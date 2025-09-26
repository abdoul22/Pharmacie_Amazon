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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();

            // Relation facture
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');

            // Produit
            $table->foreignId('product_id')->nullable()->constrained(); // Peut être null si produit supprimé
            $table->string('product_name'); // Nom du produit au moment de la vente
            $table->string('product_code')->nullable(); // Code-barres
            $table->string('batch_number')->nullable(); // Numéro de lot pharmaceutique
            $table->date('expiry_date')->nullable(); // Date d'expiration du lot

            // Quantités et prix
            $table->decimal('quantity', 8, 2); // Quantité vendue
            $table->string('unit')->default('pcs'); // Unité (pcs, ml, gr, etc.)
            $table->decimal('unit_price', 10, 2); // Prix unitaire HT
            $table->decimal('total_price', 10, 2); // Prix total HT (quantity * unit_price)

            // Remises éventuelles
            $table->decimal('discount_percentage', 5, 2)->default(0); // % remise
            $table->decimal('discount_amount', 10, 2)->default(0); // Montant remise
            $table->decimal('net_amount', 10, 2); // Montant net après remise

            // Métadonnées pour traçabilité pharmaceutique
            $table->string('category')->nullable(); // Catégorie médicament
            $table->boolean('requires_prescription')->default(false);
            $table->text('prescription_notes')->nullable();

            $table->timestamps();

            // Index pour performance et traçabilité
            $table->index(['invoice_id']);
            $table->index(['product_id']);
            $table->index(['batch_number']);
            $table->index(['expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
