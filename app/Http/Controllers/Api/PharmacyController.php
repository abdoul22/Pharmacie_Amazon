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

            // Valeur du stock total
            $totalStockValue = Product::selectRaw('SUM(quantity * selling_price) as total')
                ->value('total') ?? 0;

            // Produits en alerte (stock faible)
            $lowStockProducts = Product::where('quantity', '<=', 10)->count();

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
                    return [
                        'product_name' => $movement->product->name ?? 'Produit supprimé',
                        'total_sold' => $movement->total_sold,
                        'current_stock' => $movement->product->quantity ?? 0,
                    ];
                });

            // Alertes actives
            $activeAlerts = [
                'low_stock' => $lowStockProducts,
                'near_expiry' => $nearExpiryProducts,
                'out_of_stock' => Product::where('quantity', 0)->count(),
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
                        'total_products' => $totalProducts,
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
            $stats = [
                'products_count' => Product::count(),
                'low_stock_count' => Product::where('quantity', '<=', 10)->count(),
                'out_of_stock_count' => Product::where('quantity', 0)->count(),
                'total_value' => Product::selectRaw('SUM(quantity * selling_price) as total')->value('total') ?? 0,
                'recent_movements_count' => StockMovement::whereDate('created_at', Carbon::today())->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
