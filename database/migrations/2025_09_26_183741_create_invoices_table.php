<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // Informations facture
            $table->string('invoice_number')->unique(); // F-2025-001
            $table->date('invoice_date');
            $table->time('invoice_time');
            $table->enum('status', ['draft', 'sent', 'paid', 'cancelled'])->default('draft');
            $table->enum('type', ['sale', 'refund', 'credit_note'])->default('sale');

            // Client (optionnel pour ventes comptoir)
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->text('customer_address')->nullable();

            // Totaux
            $table->decimal('subtotal_ht', 10, 2); // Sous-total Hors Taxes
            $table->decimal('tva_rate', 5, 2)->default(14.00); // Taux TVA mauritanienne
            $table->decimal('tva_amount', 10, 2); // Montant TVA
            $table->decimal('total_ttc', 10, 2); // Total Toutes Taxes Comprises
            $table->string('currency', 3)->default('MRU'); // Ouguiya Mauritanienne

            // Paiement
            $table->enum('payment_method', [
                'cash',
                'bankily',
                'masrivi',
                'sedad',
                'click',
                'moov_money',
                'bimbank',
                'credit'
            ]);
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('due_amount', 10, 2)->default(0);

            // Métadonnées
            $table->text('notes')->nullable();
            $table->json('payment_details')->nullable(); // Détails paiement mobile (téléphone, etc.)
            $table->foreignId('user_id')->constrained(); // Caissier/Vendeur
            $table->string('pos_terminal')->nullable(); // Terminal de caisse

            $table->timestamps();

            // Index pour performance
            $table->index(['invoice_date', 'status']);
            $table->index(['customer_phone']);
            $table->index(['payment_method', 'payment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
