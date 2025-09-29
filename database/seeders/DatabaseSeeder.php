<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,
            StockSeeder::class,
            InsuranceSeeder::class,
        ]);

        // Note: Les utilisateurs de test ont été supprimés
        // Le SuperAdmin doit être créé manuellement via Tinker pour des raisons de sécurité
        // Voir la documentation dans README.md pour la procédure
    }
}
