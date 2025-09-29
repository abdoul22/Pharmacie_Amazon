<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ce seeder ne crée plus de SuperAdmin automatiquement
        // Le SuperAdmin doit être créé manuellement via Tinker pour des raisons de sécurité
        $this->command->info('SuperAdminSeeder désactivé pour des raisons de sécurité.');
        $this->command->info('Utilisez la commande Tinker pour créer le SuperAdmin:');
        $this->command->info('php artisan tinker');
        $this->command->info('Voir la documentation dans README.md');
    }
}
