<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get all products from this supplier
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get active products from this supplier
     */
    public function activeProducts(): HasMany
    {
        return $this->products()->where('status', 'active');
    }

    /**
     * Scope to get only active suppliers
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if supplier can be deleted
     */
    public function canBeDeleted(): bool
    {
        return $this->activeProducts()->count() === 0;
    }

    /**
     * Get full contact information
     */
    public function getFullContactAttribute(): string
    {
        $contact = $this->contact_person;
        if ($this->phone) {
            $contact .= ' - ' . $this->phone;
        }
        if ($this->email) {
            $contact .= ' - ' . $this->email;
        }
        return $contact;
    }
}
