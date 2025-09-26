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
        Schema::create('insurances', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nom de l'assurance (ex: CNAM, MGMO, etc.)
            $table->string('name_ar')->nullable(); // Nom en arabe
            $table->string('code', 10)->unique(); // Code court unique (ex: CNAM, MGMO)
            $table->text('description')->nullable(); // Description de l'assurance
            $table->decimal('reimbursement_percentage', 5, 2)->default(0); // % remboursement (ex: 90.00)
            $table->integer('processing_days')->default(15); // Délai traitement en jours
            $table->boolean('requires_preauthorization')->default(false); // Pré-autorisation nécessaire
            $table->decimal('preauth_threshold', 10, 2)->nullable(); // Seuil pré-autorisation (MRU)
            $table->enum('type', ['public', 'private', 'mutual'])->default('public'); // Type d'assurance
            $table->json('contact_info')->nullable(); // Infos contact (téléphone, email, etc.)
            $table->boolean('is_active')->default(true); // Assurance active/inactive
            $table->text('notes')->nullable(); // Notes internes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insurances');
    }
};
