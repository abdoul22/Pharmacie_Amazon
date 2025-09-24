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
        // Check if superadmin already exists
        if (User::where('role', 'superadmin')->exists()) {
            $this->command->info('SuperAdmin already exists.');
            return;
        }

        // Create superadmin user
        $superadmin = User::create([
            'name' => 'Super Administrateur',
            'email' => 'superadmin@pharmacie.com',
            'password' => Hash::make('SuperAdmin123!'),
            'role' => 'superadmin',
            'email_verified_at' => now(),
        ]);

        $this->command->info('SuperAdmin created successfully:');
        $this->command->info('Email: superadmin@pharmacie.com');
        $this->command->info('Password: SuperAdmin123!');
        $this->command->warn('Please change the password after first login.');
    }
}
