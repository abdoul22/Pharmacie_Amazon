<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'invoice_date',
        'invoice_time',
        'status',
        'type',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'subtotal_ht',
        'tva_rate',
        'tva_amount',
        'total_ttc',
        'currency',
        'payment_method',
        'payment_status',
        'paid_amount',
        'due_amount',
        'notes',
        'payment_details',
        'user_id',
        'pos_terminal'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'invoice_time' => 'datetime:H:i',
        'subtotal_ht' => 'decimal:2',
        'tva_rate' => 'decimal:2',
        'tva_amount' => 'decimal:2',
        'total_ttc' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'payment_details' => 'array'
    ];

    /**
     * Relation avec les lignes de facture
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Relation avec l'utilisateur (caissier/vendeur)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Générer un numéro de facture unique
     */
    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $lastInvoice = self::where('invoice_number', 'like', "F-{$year}-%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = intval(substr($lastInvoice->invoice_number, -3));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('F-%d-%03d', $year, $newNumber);
    }

    /**
     * Calculer le montant dû
     */
    public function calculateDueAmount(): float
    {
        return max(0, $this->total_ttc - $this->paid_amount);
    }

    /**
     * Marquer comme payée
     */
    public function markAsPaid(float $amount, string $paymentMethod = null): bool
    {
        $this->paid_amount += $amount;
        $this->due_amount = $this->calculateDueAmount();

        if ($this->due_amount <= 0.01) { // Tolérance de 1 centime
            $this->payment_status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->payment_status = 'partial';
        }

        if ($paymentMethod) {
            $this->payment_method = $paymentMethod;
        }

        return $this->save();
    }

    /**
     * Scope pour les factures du jour
     */
    public function scopeToday($query)
    {
        return $query->whereDate('invoice_date', today());
    }

    /**
     * Scope pour les factures par méthode de paiement
     */
    public function scopeByPaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope pour les factures payées
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Accesseur pour le nom du mode de paiement
     */
    public function getPaymentMethodNameAttribute(): string
    {
        return match ($this->payment_method) {
            'cash' => 'Espèces',
            'bankily' => 'Bankily',
            'masrivi' => 'Masrivi',
            'sedad' => 'Sedad',
            'click' => 'Click',
            'moov_money' => 'Moov Money',
            'bimbank' => 'Bimbank',
            'credit' => 'Crédit',
            default => $this->payment_method
        };
    }

    /**
     * Accesseur pour le statut formaté
     */
    public function getStatusNameAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Brouillon',
            'sent' => 'Envoyée',
            'paid' => 'Payée',
            'cancelled' => 'Annulée',
            default => $this->status
        };
    }
}
