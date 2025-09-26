<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\PermissionMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Password reset routes (to be implemented later)
    // Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    // Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public stock info routes (for browser access)
Route::prefix('stock')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\StockController::class, 'publicInfo'])->name('stock.public');
    Route::get('/info', [\App\Http\Controllers\Api\StockController::class, 'publicInfo'])->name('stock.info');
});

// Alternative public route without trailing slash
Route::get('stock', [\App\Http\Controllers\Api\StockController::class, 'publicInfo'])->name('stock.public.alt');

// Public pharmacy endpoints
Route::prefix('pharmacy')->group(function () {
    // Modes de paiement (public pour consultation)
    Route::get('/payments/methods', [\App\Http\Controllers\Api\PaymentController::class, 'getMethods']);
});

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {

    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        // Role management routes (Admin+ only)
        Route::middleware('role:admin,superadmin')->group(function () {
            Route::get('/roles', [AuthController::class, 'roles']);
            Route::put('/users/{user}/role', [AuthController::class, 'updateUserRole']);
        });
    });

    // 🏥 Pharmacy Management API
    Route::prefix('pharmacy')->group(function () {
        // Dashboard principal
        Route::get('/dashboard', [\App\Http\Controllers\Api\PharmacyController::class, 'dashboard']);
        Route::get('/quick-stats', [\App\Http\Controllers\Api\PharmacyController::class, 'quickStats']);

        // Note: Route payments/methods déplacée en public pour éviter redirection

        // Gestion des assurances (Admin+ seulement)
        Route::middleware('role:admin,superadmin,pharmacien')->group(function () {
            Route::prefix('insurances')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\InsuranceController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\InsuranceController::class, 'store']);
                Route::get('/{insurance}', [\App\Http\Controllers\Api\InsuranceController::class, 'show']);
                Route::put('/{insurance}', [\App\Http\Controllers\Api\InsuranceController::class, 'update']);
                Route::delete('/{insurance}', [\App\Http\Controllers\Api\InsuranceController::class, 'destroy']);
                Route::patch('/{insurance}/toggle-status', [\App\Http\Controllers\Api\InsuranceController::class, 'toggleStatus']);
                Route::post('/{insurance}/calculate-reimbursement', [\App\Http\Controllers\Api\InsuranceController::class, 'calculateReimbursement']);
            });
        });

        // Gestion des ordonnances (Pharmacien+ seulement)
        Route::middleware('role:pharmacien,admin,superadmin')->group(function () {
            Route::prefix('prescriptions')->group(function () {
                Route::get('/stats', [\App\Http\Controllers\Api\PrescriptionController::class, 'getStats']);
                Route::get('/products-by-type', [\App\Http\Controllers\Api\PrescriptionController::class, 'getProductsByType']);
                Route::put('/products/{product}', [\App\Http\Controllers\Api\PrescriptionController::class, 'updateProductPrescription']);
                Route::post('/products/bulk-update', [\App\Http\Controllers\Api\PrescriptionController::class, 'bulkUpdatePrescriptions']);
                Route::post('/validate-sale/{product}', [\App\Http\Controllers\Api\PrescriptionController::class, 'validatePrescriptionForSale']);
            });
        });

        // 🧾 Gestion des factures (Tous utilisateurs authentifiés)
        Route::prefix('invoices')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\InvoiceController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\InvoiceController::class, 'store']);
            Route::get('/stats', [\App\Http\Controllers\Api\InvoiceController::class, 'stats']);
            Route::get('/{invoice}', [\App\Http\Controllers\Api\InvoiceController::class, 'show']);
            Route::get('/{invoice}/pdf', [\App\Http\Controllers\Api\InvoiceController::class, 'generatePDF'])
                ->name('api.invoices.pdf');
        });
    });

    // Stock Management Routes (Protected)
    Route::prefix('stock')->group(function () {

        // Dashboard and info routes (protected)
        Route::get('/dashboard', [\App\Http\Controllers\Api\StockController::class, 'index']);
        Route::get('/endpoints', [\App\Http\Controllers\Api\StockController::class, 'endpoints']);

        // Categories - Admin only for CUD, All authenticated for Read
        Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
        Route::get('/categories/{category}', [\App\Http\Controllers\Api\CategoryController::class, 'show']);

        Route::middleware('role:admin,superadmin')->group(function () {
            Route::post('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'store']);
            Route::put('/categories/{category}', [\App\Http\Controllers\Api\CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [\App\Http\Controllers\Api\CategoryController::class, 'destroy']);
            Route::post('/categories/{id}/restore', [\App\Http\Controllers\Api\CategoryController::class, 'restore']);
        });

        // Suppliers - Admin only for CUD, All authenticated for Read
        Route::get('/suppliers', [\App\Http\Controllers\Api\SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [\App\Http\Controllers\Api\SupplierController::class, 'show']);

        Route::middleware('role:admin,superadmin')->group(function () {
            Route::post('/suppliers', [\App\Http\Controllers\Api\SupplierController::class, 'store']);
            Route::put('/suppliers/{supplier}', [\App\Http\Controllers\Api\SupplierController::class, 'update']);
            Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\Api\SupplierController::class, 'destroy']);
            Route::post('/suppliers/{id}/restore', [\App\Http\Controllers\Api\SupplierController::class, 'restore']);
        });

        // Products - Admin/Vendeur for CUD, All authenticated for Read
        Route::get('/products', [\App\Http\Controllers\Api\ProductController::class, 'index']);
        Route::get('/products/{product}', [\App\Http\Controllers\Api\ProductController::class, 'show']);

        Route::middleware('role:admin,superadmin,vendeur')->group(function () {
            Route::post('/products', [\App\Http\Controllers\Api\ProductController::class, 'store']);
            Route::put('/products/{product}', [\App\Http\Controllers\Api\ProductController::class, 'update']);
        });

        Route::middleware('role:admin,superadmin')->group(function () {
            Route::delete('/products/{product}', [\App\Http\Controllers\Api\ProductController::class, 'destroy']);
            Route::post('/products/{id}/restore', [\App\Http\Controllers\Api\ProductController::class, 'restore']);
        });

        // Stock Movements - Admin only for Create, All authenticated for Read
        Route::get('/movements', [\App\Http\Controllers\Api\StockMovementController::class, 'index']);
        Route::get('/movements/{stockMovement}', [\App\Http\Controllers\Api\StockMovementController::class, 'show']);

        Route::middleware('role:admin,superadmin')->group(function () {
            Route::post('/movements', [\App\Http\Controllers\Api\StockMovementController::class, 'store']);
        });

        // Stock Alerts - All authenticated can view, Admin can manage
        // Route::get('/alerts', [StockAlertController::class, 'index']);
        // Route::put('/alerts/{alert}/mark-seen', [StockAlertController::class, 'markSeen']);
    });
});
