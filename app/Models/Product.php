<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'generic_name',
        'barcode',
        'category_id',
        'supplier_id',
        'purchase_price',
        'selling_price',
        'initial_stock',
        'low_stock_threshold',
        'pharmaceutical_form',
        'dosage',
        'expiry_date',
        'description',
        'image_path',
        'status',
        'prescription_type',
        'requires_prescription',
        'prescription_notes',
        'restricted_conditions',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'initial_stock' => 'integer',
        'low_stock_threshold' => 'integer',
        'expiry_date' => 'date',
        'status' => 'string',
        'requires_prescription' => 'boolean',
        'restricted_conditions' => 'array',
    ];

    protected $appends = [
        'current_stock',
        'is_low_stock',
        'is_expiring_soon',
        'is_expired',
        'image_url',
        'profit_margin',
    ];

    /**
     * Get the category that owns this product
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the supplier that owns this product
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get all stock movements for this product
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get all alerts for this product
     */
    public function stockAlerts(): HasMany
    {
        return $this->hasMany(StockAlert::class);
    }

    /**
     * Get current stock based on movements
     */
    public function getCurrentStockAttribute(): int
    {
        $movements = $this->stockMovements;

        $stockIn = $movements->where('type', 'in')->sum('quantity');
        $stockOut = $movements->where('type', 'out')->sum('quantity');
        $adjustments = $movements->where('type', 'adjustment')->sum('quantity');

        return $this->initial_stock + $stockIn - $stockOut + $adjustments;
    }

    /**
     * Check if product has low stock
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->current_stock <= $this->low_stock_threshold;
    }

    /**
     * Check if product is expiring soon (30 days)
     */
    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->expiry_date->diffInDays(now()) <= 30 && !$this->is_expired;
    }

    /**
     * Check if product is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date->isPast();
    }

    /**
     * Get image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        return Storage::url($this->image_path);
    }

    /**
     * Get profit margin percentage
     */
    public function getProfitMarginAttribute(): float
    {
        if ($this->purchase_price == 0) {
            return 0;
        }

        return (($this->selling_price - $this->purchase_price) / $this->purchase_price) * 100;
    }

    /**
     * Scope to get only active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get low stock products
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('(
            initial_stock +
            COALESCE((SELECT SUM(quantity) FROM stock_movements WHERE product_id = products.id AND type = "in"), 0) -
            COALESCE((SELECT SUM(quantity) FROM stock_movements WHERE product_id = products.id AND type = "out"), 0) +
            COALESCE((SELECT SUM(quantity) FROM stock_movements WHERE product_id = products.id AND type = "adjustment"), 0)
        ) <= low_stock_threshold');
    }

    /**
     * Scope to get expiring products
     */
    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>', now());
    }

    /**
     * Scope to get expired products
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    /**
     * Scope to search by name or barcode
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('generic_name', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%");
        });
    }

    /**
     * Scope pour produits nécessitant une ordonnance
     */
    public function scopeRequiresPrescription($query)
    {
        return $query->where('requires_prescription', true);
    }

    /**
     * Scope par type d'ordonnance
     */
    public function scopeByPrescriptionType($query, string $type)
    {
        return $query->where('prescription_type', $type);
    }

    /**
     * Obtenir le libellé du type d'ordonnance
     */
    public function getPrescriptionTypeNameAttribute(): string
    {
        return match ($this->prescription_type) {
            'libre' => 'Libre (sans ordonnance)',
            'sur_ordonnance' => 'Sur ordonnance',
            'controle' => 'Médicament contrôlé',
            default => 'Non défini'
        };
    }

    /**
     * Vérifier si la vente nécessite une ordonnance valide
     */
    public function needsValidPrescription(): bool
    {
        return $this->requires_prescription || in_array($this->prescription_type, ['sur_ordonnance', 'controle']);
    }

    /**
     * Vérifier si le médicament est contrôlé (nécessite autorisation spéciale)
     */
    public function isControlledSubstance(): bool
    {
        return $this->prescription_type === 'controle';
    }

    /**
     * Obtenir les conditions de restriction
     */
    public function getRestrictionRules(): array
    {
        return $this->restricted_conditions ?? [];
    }

    /**
     * Ajouter une condition de restriction
     */
    public function addRestrictionRule(string $rule, mixed $value = null): void
    {
        $conditions = $this->getRestrictionRules();
        $conditions[$rule] = $value;
        $this->update(['restricted_conditions' => $conditions]);
    }

    /**
     * Delete product image when model is deleted
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($product) {
            if ($product->image_path && Storage::exists($product->image_path)) {
                Storage::delete($product->image_path);
            }
        });
    }
}
