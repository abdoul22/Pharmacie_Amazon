<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'reference',
        'reason',
        'user_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'type' => 'string',
    ];

    /**
     * Get the product that owns this movement
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who made this movement
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for stock entries
     */
    public function scopeStockIn($query)
    {
        return $query->where('type', 'in');
    }

    /**
     * Scope for stock exits
     */
    public function scopeStockOut($query)
    {
        return $query->where('type', 'out');
    }

    /**
     * Scope for stock adjustments
     */
    public function scopeAdjustments($query)
    {
        return $query->where('type', 'adjustment');
    }

    /**
     * Scope for recent movements
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get movement type in French
     */
    public function getTypeInFrenchAttribute(): string
    {
        return match ($this->type) {
            'in' => 'Entrée',
            'out' => 'Sortie',
            'adjustment' => 'Ajustement',
            default => $this->type
        };
    }

    /**
     * Get signed quantity (negative for out movements)
     */
    public function getSignedQuantityAttribute(): int
    {
        return match ($this->type) {
            'out' => -$this->quantity,
            default => $this->quantity
        };
    }
}
