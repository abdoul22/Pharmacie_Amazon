<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Get current stock for a product
     */
    public function getCurrentStock(Product $product): int
    {
        $movements = $product->stockMovements();

        $stockIn = $movements->where('type', 'in')->sum('quantity');
        $stockOut = $movements->where('type', 'out')->sum('quantity');
        $adjustments = $movements->where('type', 'adjustment')->sum('quantity');

        return $product->initial_stock + $stockIn - $stockOut + $adjustments;
    }

    /**
     * Add stock (stock entry)
     */
    public function addStock(
        Product $product,
        int $quantity,
        string $reason,
        ?string $reference = null,
        ?User $user = null
    ): StockMovement {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }

        return DB::transaction(function () use ($product, $quantity, $reason, $reference, $user) {
            return StockMovement::create([
                'product_id' => $product->id,
                'type' => 'in',
                'quantity' => $quantity,
                'reason' => $reason,
                'reference' => $reference,
                'user_id' => $user?->id ?? Auth::id(),
            ]);
        });
    }

    /**
     * Remove stock (stock exit)
     */
    public function removeStock(
        Product $product,
        int $quantity,
        string $reason,
        ?string $reference = null,
        ?User $user = null
    ): StockMovement {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }

        $currentStock = $this->getCurrentStock($product);
        if ($currentStock < $quantity) {
            throw new \InvalidArgumentException("Insufficient stock. Available: {$currentStock}, Requested: {$quantity}");
        }

        return DB::transaction(function () use ($product, $quantity, $reason, $reference, $user) {
            return StockMovement::create([
                'product_id' => $product->id,
                'type' => 'out',
                'quantity' => $quantity,
                'reason' => $reason,
                'reference' => $reference,
                'user_id' => $user?->id ?? Auth::id(),
            ]);
        });
    }

    /**
     * Adjust stock (positive or negative adjustment)
     */
    public function adjustStock(
        Product $product,
        int $quantity,
        string $reason,
        ?User $user = null
    ): StockMovement {
        if ($quantity == 0) {
            throw new \InvalidArgumentException('Adjustment quantity cannot be zero');
        }

        // Check if negative adjustment would result in negative stock
        if ($quantity < 0) {
            $currentStock = $this->getCurrentStock($product);
            if ($currentStock + $quantity < 0) {
                throw new \InvalidArgumentException("Adjustment would result in negative stock");
            }
        }

        return DB::transaction(function () use ($product, $quantity, $reason, $user) {
            return StockMovement::create([
                'product_id' => $product->id,
                'type' => 'adjustment',
                'quantity' => $quantity,
                'reason' => $reason,
                'user_id' => $user?->id ?? Auth::id(),
            ]);
        });
    }

    /**
     * Check if product has low stock
     */
    public function isLowStock(Product $product): bool
    {
        return $this->getCurrentStock($product) <= $product->low_stock_threshold;
    }

    /**
     * Check if product is expiring soon
     */
    public function isExpiringSoon(Product $product, int $days = 30): bool
    {
        return $product->expiry_date->diffInDays(now()) <= $days && !$product->expiry_date->isPast();
    }

    /**
     * Check if product is expired
     */
    public function isExpired(Product $product): bool
    {
        return $product->expiry_date->isPast();
    }

    /**
     * Get stock summary for a product
     */
    public function getStockSummary(Product $product): array
    {
        $currentStock = $this->getCurrentStock($product);

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'current_stock' => $currentStock,
            'initial_stock' => $product->initial_stock,
            'low_stock_threshold' => $product->low_stock_threshold,
            'is_low_stock' => $this->isLowStock($product),
            'is_expiring_soon' => $this->isExpiringSoon($product),
            'is_expired' => $this->isExpired($product),
            'expiry_date' => $product->expiry_date->format('Y-m-d'),
            'days_to_expiry' => $product->expiry_date->diffInDays(now()),
        ];
    }

    /**
     * Get stock movements summary for a product
     */
    public function getMovementsSummary(Product $product): array
    {
        $movements = $product->stockMovements();

        return [
            'total_movements' => $movements->count(),
            'total_in' => $movements->stockIn()->sum('quantity'),
            'total_out' => $movements->stockOut()->sum('quantity'),
            'total_adjustments' => $movements->adjustments()->sum('quantity'),
            'recent_movements' => $movements->recent(7)->count(),
        ];
    }

    /**
     * Get low stock products
     */
    public function getLowStockProducts(int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Product::active()
            ->with(['category', 'supplier'])
            ->lowStock();

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get expiring products
     */
    public function getExpiringProducts(int $days = 30, int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Product::active()
            ->with(['category', 'supplier'])
            ->expiringSoon($days);

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get expired products
     */
    public function getExpiredProducts(int $limit = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Product::active()
            ->with(['category', 'supplier'])
            ->expired();

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Bulk update stock for multiple products
     */
    public function bulkStockUpdate(array $updates, string $reason): array
    {
        $results = [];

        DB::transaction(function () use ($updates, $reason, &$results) {
            foreach ($updates as $update) {
                $product = Product::findOrFail($update['product_id']);
                $quantity = $update['quantity'];
                $type = $update['type'] ?? 'adjustment';

                try {
                    $movement = match ($type) {
                        'in' => $this->addStock($product, $quantity, $reason),
                        'out' => $this->removeStock($product, $quantity, $reason),
                        'adjustment' => $this->adjustStock($product, $quantity, $reason),
                        default => throw new \InvalidArgumentException("Invalid movement type: {$type}")
                    };

                    $results[] = [
                        'product_id' => $product->id,
                        'success' => true,
                        'movement_id' => $movement->id,
                        'new_stock' => $this->getCurrentStock($product),
                    ];
                } catch (\Exception $e) {
                    $results[] = [
                        'product_id' => $product->id,
                        'success' => false,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        });

        return $results;
    }

    /**
     * Calculate total inventory value
     */
    public function calculateInventoryValue(): array
    {
        $products = Product::active()->get();

        $purchaseValue = 0;
        $sellingValue = 0;
        $totalProducts = 0;

        foreach ($products as $product) {
            $stock = $this->getCurrentStock($product);
            if ($stock > 0) {
                $purchaseValue += $stock * $product->purchase_price;
                $sellingValue += $stock * $product->selling_price;
                $totalProducts++;
            }
        }

        return [
            'total_products' => $totalProducts,
            'purchase_value' => round($purchaseValue, 2),
            'selling_value' => round($sellingValue, 2),
            'potential_profit' => round($sellingValue - $purchaseValue, 2),
            'profit_margin' => $purchaseValue > 0 ? round((($sellingValue - $purchaseValue) / $purchaseValue) * 100, 2) : 0,
        ];
    }
}
