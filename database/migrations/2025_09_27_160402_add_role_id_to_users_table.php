<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ajouter role_id après la colonne email seulement si elle n'existe pas
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->unsignedBigInteger('role_id')->nullable()->after('email');
            }
        });

        // Ajouter les contraintes et index séparément
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role_id')) {
                // Vérifier si la clé étrangère n'existe pas déjà
                if (!$this->foreignKeyExists('users', 'users_role_id_foreign')) {
                    $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
                }

                // Vérifier si l'index n'existe pas déjà
                if (!$this->indexExists('users', 'users_role_id_index')) {
                    $table->index('role_id');
                }
            }
        });

        // Migrer les rôles existants vers le nouveau système
        $roleMapping = [
            'superadmin' => 'superadmin',
            'admin' => 'admin',
            'pharmacien' => 'pharmacien',
            'vendeur' => 'vendeur',
            'caissier' => 'caissier'
        ];

        foreach ($roleMapping as $oldRole => $newRole) {
            $roleId = DB::table('roles')->where('name', $newRole)->value('id');
            if ($roleId) {
                DB::table('users')
                    ->where('role', $oldRole)
                    ->update(['role_id' => $roleId]);
            }
        }

        // Supprimer l'ancienne colonne role après migration
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    /**
     * Helper method to check if foreign key exists (MySQL)
     */
    private function foreignKeyExists($table, $keyName)
    {
        try {
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = 'role_id'
            ", [$table]);

            return count($foreignKeys) > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Helper method to check if index exists (MySQL)
     */
    private function indexExists($table, $indexName)
    {
        try {
            $indexes = DB::select("
                SELECT INDEX_NAME 
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = 'role_id'
            ", [$table]);

            return count($indexes) > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Recréer la colonne role
            $table->string('role')->default('vendeur');

            // Migrer les données de role_id vers role
            $users = DB::table('users')->get();
            foreach ($users as $user) {
                if ($user->role_id) {
                    $roleName = DB::table('roles')->where('id', $user->role_id)->value('name');
                    if ($roleName) {
                        DB::table('users')
                            ->where('id', $user->id)
                            ->update(['role' => $roleName]);
                    }
                }
            }

            // Supprimer les contraintes et colonnes
            $table->dropForeign(['role_id']);
            $table->dropIndex(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
