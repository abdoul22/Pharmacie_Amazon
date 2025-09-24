<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function __construct(private StockService $stockService) {}

    /**
     * Get stock management dashboard summary
     */
    public function index(): JsonResponse
    {
        try {
            // Get counts
            $categoriesCount = Category::active()->count();
            $suppliersCount = Supplier::active()->count();
            $productsCount = Product::active()->count();
            $movementsCount = StockMovement::count();

            // Get low stock products
            $lowStockProducts = $this->stockService->getLowStockProducts(5);

            // Get expiring products
            $expiringProducts = $this->stockService->getExpiringProducts(30, 5);

            // Get expired products
            $expiredProducts = $this->stockService->getExpiredProducts(5);

            // Get recent movements
            $recentMovements = StockMovement::with(['product', 'user'])
                ->recent(7)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Calculate inventory value
            $inventoryValue = $this->stockService->calculateInventoryValue();

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'categories_count' => $categoriesCount,
                        'suppliers_count' => $suppliersCount,
                        'products_count' => $productsCount,
                        'movements_count' => $movementsCount,
                        'low_stock_count' => $lowStockProducts->count(),
                        'expiring_soon_count' => $expiringProducts->count(),
                        'expired_count' => $expiredProducts->count(),
                    ],
                    'inventory_value' => $inventoryValue,
                    'alerts' => [
                        'low_stock_products' => $lowStockProducts->map(function ($product) {
                            return [
                                'id' => $product->id,
                                'name' => $product->name,
                                'current_stock' => $product->current_stock,
                                'threshold' => $product->low_stock_threshold,
                                'category' => $product->category->name ?? 'N/A',
                            ];
                        }),
                        'expiring_products' => $expiringProducts->map(function ($product) {
                            return [
                                'id' => $product->id,
                                'name' => $product->name,
                                'expiry_date' => $product->expiry_date->format('Y-m-d'),
                                'days_remaining' => $product->expiry_date->diffInDays(now()),
                                'category' => $product->category->name ?? 'N/A',
                            ];
                        }),
                        'expired_products' => $expiredProducts->map(function ($product) {
                            return [
                                'id' => $product->id,
                                'name' => $product->name,
                                'expiry_date' => $product->expiry_date->format('Y-m-d'),
                                'days_expired' => now()->diffInDays($product->expiry_date),
                                'category' => $product->category->name ?? 'N/A',
                            ];
                        }),
                    ],
                    'recent_movements' => $recentMovements->map(function ($movement) {
                        return [
                            'id' => $movement->id,
                            'product_name' => $movement->product->name ?? 'N/A',
                            'type' => $movement->type,
                            'type_french' => $movement->type_in_french,
                            'quantity' => $movement->quantity,
                            'signed_quantity' => $movement->signed_quantity,
                            'reason' => $movement->reason,
                            'user_name' => $movement->user->name ?? 'N/A',
                            'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
                        ];
                    }),
                    'quick_stats' => [
                        'total_stock_value' => $inventoryValue['selling_value'],
                        'potential_profit' => $inventoryValue['potential_profit'],
                        'profit_margin' => $inventoryValue['profit_margin'],
                        'active_products' => $productsCount,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get stock summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public stock information (for browser access without authentication)
     */
    public function publicInfo()
    {
        $data = [
            'api_name' => 'Pharmacie Amazon - Stock Management API',
            'version' => '1.0',
            'status' => 'active',
            'currency' => 'MRU',
            'currency_name' => 'Ouguiya',
            'authentication_required' => true,
            'authentication_type' => 'Bearer Token (Laravel Sanctum)',
            'endpoints' => [
                'auth' => [
                    'POST /api/auth/login' => 'Login to get access token',
                    'POST /api/auth/register' => 'Register new user',
                    'POST /api/auth/logout' => 'Logout (requires token)',
                    'GET /api/auth/user' => 'Get current user info (requires token)',
                ],
                'stock' => [
                    'GET /api/stock/dashboard' => 'Stock dashboard with full data (requires token)',
                    'GET /api/stock/endpoints' => 'List all endpoints (requires token)',
                    'GET /api/stock/categories' => 'Get categories (requires token)',
                    'GET /api/stock/products' => 'Get products (requires token)',
                    'GET /api/stock/suppliers' => 'Get suppliers (requires token)',
                ]
            ],
            'how_to_use' => [
                '1. POST to /api/auth/login with email and password',
                '2. Copy the token from the response',
                '3. Use Authorization: Bearer {token} header in subsequent requests',
                '4. Access protected endpoints like /api/stock/dashboard'
            ],
            'test_accounts' => [
                'superadmin@pharmacie.com / SuperAdmin123!',
                'admin@pharmacie.com / Admin123!',
                'vendeur@pharmacie.com / Vendeur123!',
                'caissier@pharmacie.com / Caissier123!'
            ],
            'note' => 'This endpoint displays a modern web interface for browser access. Use authenticated endpoints for actual data.'
        ];

        // Si la requête demande du JSON (via Accept header), retourner JSON
        if (request()->wantsJson() || request()->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'message' => 'Stock API Information',
                'data' => $data
            ]);
        }

        // Sinon, retourner la vue web moderne
        return view('api.stock', compact('data'));
    }

    /**
     * Page web pour la gestion des catégories
     */
    public function categoriesPage()
    {
        $categories = Category::with('products')->get();
        return view('pharmacy.categories', compact('categories'));
    }

    /**
     * Page web pour la gestion des fournisseurs
     */
    public function suppliersPage()
    {
        $suppliers = Supplier::with('products')->get();
        return view('pharmacy.suppliers', compact('suppliers'));
    }

    /**
     * Page web pour la gestion des mouvements
     */
    public function movementsPage()
    {
        $movements = StockMovement::with(['product', 'user'])->latest()->paginate(20);
        return view('pharmacy.movements', compact('movements'));
    }

    /**
     * Page web pour la gestion des produits
     */
    public function productsPage()
    {
        $products = Product::with(['category', 'supplier'])->get();
        return view('pharmacy.products', compact('products'));
    }

    /**
     * Get available stock endpoints
     */
    public function endpoints(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'available_endpoints' => [
                    'categories' => [
                        'GET /api/stock/categories',
                        'POST /api/stock/categories',
                        'GET /api/stock/categories/{id}',
                        'PUT /api/stock/categories/{id}',
                        'DELETE /api/stock/categories/{id}',
                    ],
                    'suppliers' => [
                        'GET /api/stock/suppliers',
                        'POST /api/stock/suppliers',
                        'GET /api/stock/suppliers/{id}',
                        'PUT /api/stock/suppliers/{id}',
                        'DELETE /api/stock/suppliers/{id}',
                    ],
                    'products' => [
                        'GET /api/stock/products',
                        'POST /api/stock/products',
                        'GET /api/stock/products/{id}',
                        'PUT /api/stock/products/{id}',
                        'DELETE /api/stock/products/{id}',
                    ],
                    'movements' => [
                        'GET /api/stock/movements',
                        'POST /api/stock/movements',
                        'GET /api/stock/movements/{id}',
                    ],
                    'dashboard' => [
                        'GET /api/stock/',
                        'GET /api/stock/endpoints',
                    ]
                ],
                'authentication' => 'Bearer token required for all endpoints',
                'base_url' => '/api/stock'
            ]
        ]);
    }
}
