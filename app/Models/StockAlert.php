<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAlert extends Model
{
    protected $fillable = [
        'product_id',
        'type',
        'message',
        'priority',
        'status',
    ];

    protected $casts = [
        'type' => 'string',
        'priority' => 'string',
        'status' => 'string',
    ];

    /**
     * Get the product that owns this alert
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope for active alerts
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for seen alerts
     */
    public function scopeSeen($query)
    {
        return $query->where('status', 'seen');
    }

    /**
     * Scope for low stock alerts
     */
    public function scopeLowStock($query)
    {
        return $query->where('type', 'low_stock');
    }

    /**
     * Scope for expiring alerts
     */
    public function scopeExpiring($query)
    {
        return $query->where('type', 'expiring_soon');
    }

    /**
     * Scope for expired alerts
     */
    public function scopeExpired($query)
    {
        return $query->where('type', 'expired');
    }

    /**
     * Scope by priority
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Mark alert as seen
     */
    public function markAsSeen(): bool
    {
        return $this->update(['status' => 'seen']);
    }

    /**
     * Get alert type in French
     */
    public function getTypeInFrenchAttribute(): string
    {
        return match ($this->type) {
            'low_stock' => 'Stock bas',
            'expiring_soon' => 'Expire bientôt',
            'expired' => 'Expiré',
            default => $this->type
        };
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute(): string
    {
        return match ($this->priority) {
            'low' => 'gray',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
            default => 'gray'
        };
    }
}
