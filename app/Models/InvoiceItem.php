<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'product_name',
        'product_code',
        'batch_number',
        'expiry_date',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
        'discount_percentage',
        'discount_amount',
        'net_amount',
        'category',
        'requires_prescription',
        'prescription_notes'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'requires_prescription' => 'boolean'
    ];

    /**
     * Relation avec la facture
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Relation avec le produit
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculer le prix total sans remise
     */
    public function calculateTotalPrice(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Calculer le montant de la remise
     */
    public function calculateDiscountAmount(): float
    {
        if ($this->discount_percentage > 0) {
            return ($this->total_price * $this->discount_percentage) / 100;
        }
        return $this->discount_amount;
    }

    /**
     * Calculer le montant net (après remise)
     */
    public function calculateNetAmount(): float
    {
        return $this->total_price - $this->calculateDiscountAmount();
    }

    /**
     * Mettre à jour les calculs automatiquement
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            // Calculer le prix total
            $item->total_price = $item->calculateTotalPrice();

            // Calculer le montant de remise
            if ($item->discount_percentage > 0) {
                $item->discount_amount = $item->calculateDiscountAmount();
            }

            // Calculer le montant net
            $item->net_amount = $item->calculateNetAmount();
        });
    }

    /**
     * Scope pour les articles avec prescription
     */
    public function scopeRequiresPrescription($query)
    {
        return $query->where('requires_prescription', true);
    }

    /**
     * Scope pour les articles d'une catégorie
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Accesseur pour le prix unitaire formaté
     */
    public function getFormattedUnitPriceAttribute(): string
    {
        return number_format($this->unit_price, 2, ',', ' ') . ' MRU';
    }

    /**
     * Accesseur pour le montant net formaté
     */
    public function getFormattedNetAmountAttribute(): string
    {
        return number_format($this->net_amount, 2, ',', ' ') . ' MRU';
    }
}
