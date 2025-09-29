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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // superadmin, admin, pharmacien, vendeur, caissier
            $table->string('display_name'); // Super Admin, Admin, Pharmacien, Vendeur, Caissier
            $table->text('description')->nullable();
            $table->json('permissions')->nullable(); // Permissions spécifiques au rôle
            $table->integer('level')->default(1); // Niveau hiérarchique (1=superadmin, 2=admin, etc.)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insérer les rôles par défaut
        DB::table('roles')->insert([
            [
                'name' => 'superadmin',
                'display_name' => 'Super Admin',
                'description' => 'Accès total au système, gestion des utilisateurs, configuration système',
                'permissions' => json_encode(['*']), // Toutes permissions
                'level' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrateur',
                'description' => 'Gestion équipe, stock global, rapports avancés',
                'permissions' => json_encode([
                    'manage_users',
                    'manage_products',
                    'manage_suppliers',
                    'view_reports',
                    'manage_categories',
                    'view_sales',
                    'manage_stock'
                ]),
                'level' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'pharmacien',
                'display_name' => 'Pharmacien',
                'description' => 'Validation ordonnances, substances contrôlées, conformité médicale',
                'permissions' => json_encode([
                    'manage_prescriptions',
                    'validate_prescriptions',
                    'manage_medicines',
                    'manage_controlled_substances',
                    'view_product_interactions',
                    'manage_inventory',
                    'view_stock',
                    'manage_suppliers',
                    'view_reports',
                    'create_sales',
                    'manage_pharmacy_operations'
                ]),
                'level' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'vendeur',
                'display_name' => 'Vendeur',
                'description' => 'Ventes, clientèle, objectifs, point de vente tactile',
                'permissions' => json_encode([
                    'view_products',
                    'create_sales',
                    'manage_customers',
                    'view_stock',
                    'create_invoices',
                    'view_customer_history'
                ]),
                'level' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'caissier',
                'display_name' => 'Caissier',
                'description' => 'Paiements fractionnés, crédits, caisse, modes mauritaniens',
                'permissions' => json_encode([
                    'manage_payments',
                    'manage_credits',
                    'view_sales',
                    'process_refunds',
                    'manage_cash_register',
                    'view_payment_reports'
                ]),
                'level' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
