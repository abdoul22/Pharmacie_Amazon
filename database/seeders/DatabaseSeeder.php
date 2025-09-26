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

        // Create test users for development
        if (app()->environment('local')) {
            User::firstOrCreate(
                ['email' => 'admin@pharmacie.com'],
                [
                    'name' => 'Admin Test',
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]
            );

            User::firstOrCreate(
                ['email' => 'vendeur@pharmacie.com'],
                [
                    'name' => 'Vendeur Test',
                    'password' => Hash::make('password'),
                    'role' => 'vendeur',
                    'email_verified_at' => now(),
                ]
            );

            User::firstOrCreate(
                ['email' => 'caissier@pharmacie.com'],
                [
                    'name' => 'Caissier Test',
                    'password' => Hash::make('password'),
                    'role' => 'caissier',
                    'email_verified_at' => now(),
                ]
            );

            User::firstOrCreate(
                ['email' => 'pharmacien@pharmacie.com'],
                [
                    'name' => 'Pharmacien Test',
                    'password' => Hash::make('password'),
                    'role' => 'pharmacien',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
