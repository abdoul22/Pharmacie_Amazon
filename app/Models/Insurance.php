<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Insurance extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_ar',
        'code',
        'description',
        'reimbursement_percentage',
        'processing_days',
        'requires_preauthorization',
        'preauth_threshold',
        'type',
        'contact_info',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'contact_info' => 'array',
        'is_active' => 'boolean',
        'requires_preauthorization' => 'boolean',
        'reimbursement_percentage' => 'decimal:2',
        'preauth_threshold' => 'decimal:2',
    ];

    /**
     * Scope pour assurances actives
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope par type d'assurance
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Obtenir le nom complet avec le code
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->name} ({$this->code})";
    }

    /**
     * Vérifier si pré-autorisation requise pour un montant
     */
    public function needsPreauthorization(float $amount): bool
    {
        return $this->requires_preauthorization &&
            $this->preauth_threshold &&
            $amount >= $this->preauth_threshold;
    }

    /**
     * Calculer le montant remboursé
     */
    public function calculateReimbursement(float $amount): float
    {
        return round($amount * ($this->reimbursement_percentage / 100), 2);
    }
}
