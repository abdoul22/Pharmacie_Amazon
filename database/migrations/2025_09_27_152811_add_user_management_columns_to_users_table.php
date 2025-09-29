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
        Schema::table('users', function (Blueprint $table) {
            // Ajouter d'abord la colonne is_approved si elle n'existe pas
            if (!Schema::hasColumn('users', 'is_approved')) {
                $table->boolean('is_approved')->default(false)->after('role');
            }

            // Colonnes pour la gestion des utilisateurs
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');
            $table->unsignedBigInteger('approved_by')->nullable()->after('is_approved');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->unsignedBigInteger('suspended_by')->nullable()->after('approved_at');
            $table->timestamp('suspended_at')->nullable()->after('suspended_by');
            $table->text('suspension_reason')->nullable()->after('suspended_at');
            $table->unsignedBigInteger('role_changed_by')->nullable()->after('suspension_reason');
            $table->timestamp('role_changed_at')->nullable()->after('role_changed_by');

            // Index pour les performances
            $table->index('is_approved');
            $table->index('last_login_at');

            // Clés étrangères
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('suspended_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('role_changed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Supprimer les clés étrangères
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['suspended_by']);
            $table->dropForeign(['role_changed_by']);

            // Supprimer les index
            $table->dropIndex(['is_approved']);
            $table->dropIndex(['role']);
            $table->dropIndex(['last_login_at']);

            // Supprimer les colonnes
            $table->dropColumn([
                'last_login_at',
                'approved_by',
                'approved_at',
                'suspended_by',
                'suspended_at',
                'suspension_reason',
                'role_changed_by',
                'role_changed_at'
            ]);
        });
    }
};
