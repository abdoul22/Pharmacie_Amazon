<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\StockAlert;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PharmacyController extends Controller
{
    /**
     * Dashboard principal avec statistiques complètes
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            // Statistiques générales
            $totalProducts = Product::count();
            $totalCategories = Category::count();
            $totalSuppliers = Supplier::count();

            // Valeur du stock total (utilise current_stock calculé, seulement produits actifs)
            $totalStockValue = 0;
            $products = Product::with('stockMovements')->get();
            $activeProductsCount = 0;
            foreach ($products as $product) {
                $currentStock = $product->current_stock;
                if ($currentStock > 0) { // Seulement les produits avec stock > 0
                    $totalStockValue += $currentStock * $product->selling_price;
                    $activeProductsCount++;
                }
            }

            // Produits en alerte (stock faible) - basé sur current_stock
            $lowStockProducts = 0;
            foreach ($products as $product) {
                $currentStock = $product->current_stock;
                // Stock faible : entre 1 et le seuil minimum (pas en rupture)
                if ($currentStock > 0 && $currentStock <= $product->low_stock_threshold) {
                    $lowStockProducts++;
                }
            }

            // Produits expirés ou bientôt expirés (si champ expiry_date existe)
            $nearExpiryProducts = Product::whereNotNull('expiry_date')
                ->where('expiry_date', '<=', Carbon::now()->addDays(30))
                ->count();

            // Mouvements récents (10 derniers)
            $recentMovements = StockMovement::with(['product', 'user'])
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($movement) {
                    return [
                        'id' => $movement->id,
                        'product_name' => $movement->product->name ?? 'Produit supprimé',
                        'type' => $movement->type,
                        'quantity' => $movement->quantity,
                        'user_name' => $movement->user->name ?? 'Utilisateur inconnu',
                        'created_at' => $movement->created_at->format('d/m/Y H:i'),
                        'reference' => $movement->reference,
                    ];
                });

            // Top 5 des produits les plus vendus (basé sur les mouvements sortants)
            $topProducts = StockMovement::selectRaw('product_id, SUM(ABS(quantity)) as total_sold')
                ->where('type', 'out')
                ->groupBy('product_id')
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->with('product')
                ->get()
                ->map(function ($movement) {
                    // Charger les mouvements de stock pour calculer le current_stock
                    $product = $movement->product;
                    if ($product) {
                        $product->load('stockMovements');
                    }
                    return [
                        'product_name' => $product->name ?? 'Produit supprimé',
                        'total_sold' => $movement->total_sold,
                        'current_stock' => $product ? $product->current_stock : 0,
                    ];
                });

            // Alertes actives
            $outOfStock = 0;
            $lowStock = 0;
            foreach ($products as $product) {
                $currentStock = $product->current_stock;
                if ($currentStock <= 0) {
                    $outOfStock++;
                } elseif ($currentStock <= $product->low_stock_threshold) {
                    $lowStock++;
                }
            }

            $activeAlerts = [
                'low_stock' => $lowStock,
                'near_expiry' => $nearExpiryProducts,
                'out_of_stock' => $outOfStock,
            ];

            // Statistiques des ventes (7 derniers jours)
            $salesStats = StockMovement::selectRaw('DATE(created_at) as date, COUNT(*) as transactions, SUM(ABS(quantity)) as items_sold')
                ->where('type', 'out')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get();

            // Actions rapides disponibles selon le rôle
            $quickActions = $this->getQuickActionsForUser($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'overview' => [
                        'total_products' => $activeProductsCount, // Seulement les produits actifs
                        'total_categories' => $totalCategories,
                        'total_suppliers' => $totalSuppliers,
                        'stock_value' => [
                            'amount' => $totalStockValue,
                            'formatted' => number_format($totalStockValue, 2, ',', ' ') . ' MRU',
                        ],
                    ],
                    'alerts' => $activeAlerts,
                    'recent_movements' => $recentMovements,
                    'top_products' => $topProducts,
                    'sales_stats' => $salesStats,
                    'quick_actions' => $quickActions,
                    'currency' => 'MRU',
                    'last_updated' => Carbon::now()->format('d/m/Y H:i:s'),
                ],
                'meta' => [
                    'user' => $request->user()->only(['id', 'name', 'email', 'role']),
                    'permissions' => \App\Services\PermissionService::getUserPermissions($request->user()),
                    'timestamp' => Carbon::now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données du dashboard',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Actions rapides selon le rôle utilisateur
     */
    private function getQuickActionsForUser($user): array
    {
        $actions = [];

        // Actions communes à tous les utilisateurs authentifiés
        $actions[] = [
            'id' => 'view_products',
            'label' => 'Consulter Produits',
            'icon' => 'package',
            'route' => '/stock/products',
            'color' => 'blue'
        ];

        // Lien vers Catégories (toujours visible pour faciliter la configuration)
        $actions[] = [
            'id' => 'categories',
            'label' => 'Catégories',
            'icon' => 'folder-open',
            'route' => '/categories',
            'color' => 'amber'
        ];

        // Lien vers Fournisseurs (toujours visible)
        $actions[] = [
            'id' => 'suppliers',
            'label' => 'Fournisseurs',
            'icon' => 'truck',
            'route' => '/suppliers',
            'color' => 'purple'
        ];

        // Actions selon les permissions
        if (\App\Services\PermissionService::userHasPermission($user, 'create_sales')) {
            $actions[] = [
                'id' => 'new_sale',
                'label' => 'Nouvelle Vente',
                'icon' => 'shopping-cart',
                'route' => '/sales/new',
                'color' => 'green'
            ];
        }

        if (\App\Services\PermissionService::userHasPermission($user, 'manage_products')) {
            $actions[] = [
                'id' => 'add_product',
                'label' => 'Ajouter Produit',
                'icon' => 'plus',
                'route' => '/stock/products/new',
                'color' => 'indigo'
            ];
        }

        if (\App\Services\PermissionService::userHasPermission($user, 'manage_payments')) {
            $actions[] = [
                'id' => 'cash_register',
                'label' => 'Caisse',
                'icon' => 'calculator',
                'route' => '/cash-register',
                'color' => 'purple'
            ];
        }

        if (\App\Services\PermissionService::userHasPermission($user, 'manage_prescriptions')) {
            $actions[] = [
                'id' => 'prescriptions',
                'label' => 'Ordonnances',
                'icon' => 'clipboard-list',
                'route' => '/prescriptions',
                'color' => 'red'
            ];
        }

        if (\App\Services\PermissionService::userHasPermission($user, 'view_reports')) {
            $actions[] = [
                'id' => 'reports',
                'label' => 'Rapports',
                'icon' => 'chart-bar',
                'route' => '/reports',
                'color' => 'yellow'
            ];
        }

        return $actions;
    }

    /**
     * Statistiques rapides pour widgets
     */
    public function quickStats(Request $request): JsonResponse
    {
        try {
            // Calculer le stock actuel pour chaque produit
            $products = Product::with('stockMovements')->get();
            $lowStockCount = 0;
            $outOfStockCount = 0;
            $totalValue = 0;

            foreach ($products as $product) {
                $currentStock = $product->current_stock;
                $totalValue += $currentStock * $product->selling_price;

                if ($currentStock <= 0) {
                    $outOfStockCount++;
                } elseif ($currentStock <= $product->low_stock_threshold) {
                    $lowStockCount++;
                }
            }

            $stats = [
                'products_count' => Product::count(),
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'total_value' => $totalValue,
                'recent_movements_count' => StockMovement::whereDate('created_at', Carbon::today())->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('quickStats error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Statistiques de ventes pour la page /app/sales
     */
    public function salesStats(Request $request): JsonResponse
    {
        try {
            $today = Carbon::today();
            $yesterday = Carbon::yesterday();

            // Ventes d'aujourd'hui
            $todaySales = StockMovement::where('type', 'out')
                ->whereDate('created_at', $today)
                ->get();

            $todayTransactions = $todaySales->count();
            $todayRevenue = 0;
            $todayItemsSold = $todaySales->sum('quantity');

            // Calculer le chiffre d'affaires d'aujourd'hui
            foreach ($todaySales as $sale) {
                $product = $sale->product;
                if ($product) {
                    $todayRevenue += $sale->quantity * $product->selling_price;
                }
            }

            // Ticket moyen
            $averageTicket = $todayTransactions > 0 ? $todayRevenue / $todayTransactions : 0;

            // Transactions en attente (si on a un système de panier suspendu)
            $pendingTransactions = 0; // À implémenter si nécessaire

            // Top produits du jour
            $topProductsToday = StockMovement::selectRaw('product_id, SUM(quantity) as total_sold')
                ->where('type', 'out')
                ->whereDate('created_at', $today)
                ->groupBy('product_id')
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->with('product')
                ->get()
                ->map(function ($movement) {
                    return [
                        'product_name' => $movement->product->name ?? 'Produit supprimé',
                        'total_sold' => $movement->total_sold,
                    ];
                });

            // Modes de paiement du jour (basé sur les factures)
            $paymentMethods = \App\Models\Invoice::whereDate('created_at', $today)
                ->selectRaw('payment_method, COUNT(*) as count, SUM(total_ttc) as total')
                ->groupBy('payment_method')
                ->get()
                ->map(function ($invoice) {
                    return [
                        'method' => $invoice->payment_method,
                        'count' => $invoice->count,
                        'total' => $invoice->total,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'today' => [
                        'transactions' => $todayTransactions,
                        'revenue' => $todayRevenue,
                        'items_sold' => $todayItemsSold,
                        'average_ticket' => $averageTicket,
                        'pending' => $pendingTransactions,
                    ],
                    'top_products' => $topProductsToday,
                    'payment_methods' => $paymentMethods,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('salesStats error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques de ventes',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
