<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating sample stock data...');

        // Create Categories
        $categories = [
            [
                'name' => 'Antibiotiques',
                'description' => 'Médicaments contre les infections bactériennes',
                'status' => 'active'
            ],
            [
                'name' => 'Antalgiques',
                'description' => 'Médicaments contre la douleur',
                'status' => 'active'
            ],
            [
                'name' => 'Vitamines',
                'description' => 'Compléments vitaminiques',
                'status' => 'active'
            ],
            [
                'name' => 'Antiseptiques',
                'description' => 'Produits de désinfection',
                'status' => 'active'
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['name' => $categoryData['name']],
                $categoryData
            );
        }

        // Create Suppliers
        $suppliers = [
            [
                'name' => 'Pharma Distribut',
                'contact_person' => 'Ahmed Ould Mohamed',
                'phone' => '+222 45 67 89 01',
                'email' => 'contact@pharmadistribut.mr',
                'address' => 'Nouakchott, Mauritanie',
                'status' => 'active'
            ],
            [
                'name' => 'MediCorp',
                'contact_person' => 'Fatima Mint Ali',
                'phone' => '+222 45 67 89 02',
                'email' => 'info@medicorp.mr',
                'address' => 'Nouadhibou, Mauritanie',
                'status' => 'active'
            ],
            [
                'name' => 'Global Pharma',
                'contact_person' => 'Mohamed Ould Sidi',
                'phone' => '+222 45 67 89 03',
                'email' => 'sales@globalpharma.mr',
                'address' => 'Rosso, Mauritanie',
                'status' => 'active'
            ],
        ];

        foreach ($suppliers as $supplierData) {
            Supplier::firstOrCreate(
                ['name' => $supplierData['name']],
                $supplierData
            );
        }

        // Get created categories and suppliers
        $antibiotiques = Category::where('name', 'Antibiotiques')->first();
        $antalgiques = Category::where('name', 'Antalgiques')->first();
        $vitamines = Category::where('name', 'Vitamines')->first();
        $antiseptiques = Category::where('name', 'Antiseptiques')->first();

        $pharmaDistribut = Supplier::where('name', 'Pharma Distribut')->first();
        $mediCorp = Supplier::where('name', 'MediCorp')->first();
        $globalPharma = Supplier::where('name', 'Global Pharma')->first();

        // Create Products
        $products = [
            [
                'name' => 'Amoxicilline 500mg',
                'generic_name' => 'Amoxicilline',
                'barcode' => '1234567890123',
                'category_id' => $antibiotiques->id,
                'supplier_id' => $pharmaDistribut->id,
                'purchase_price' => 150.00,
                'selling_price' => 200.00,
                'initial_stock' => 100,
                'low_stock_threshold' => 20,
                'pharmaceutical_form' => 'Comprimé',
                'dosage' => '500mg',
                'expiry_date' => now()->addMonths(18)->format('Y-m-d'),
                'description' => 'Antibiotique à large spectre',
                'status' => 'active'
            ],
            [
                'name' => 'Paracétamol 1000mg',
                'generic_name' => 'Paracétamol',
                'barcode' => '1234567890124',
                'category_id' => $antalgiques->id,
                'supplier_id' => $mediCorp->id,
                'purchase_price' => 50.00,
                'selling_price' => 75.00,
                'initial_stock' => 200,
                'low_stock_threshold' => 30,
                'pharmaceutical_form' => 'Comprimé',
                'dosage' => '1000mg',
                'expiry_date' => now()->addMonths(24)->format('Y-m-d'),
                'description' => 'Antalgique et antipyrétique',
                'status' => 'active'
            ],
            [
                'name' => 'Vitamine C 1000mg',
                'generic_name' => 'Acide Ascorbique',
                'barcode' => '1234567890125',
                'category_id' => $vitamines->id,
                'supplier_id' => $globalPharma->id,
                'purchase_price' => 80.00,
                'selling_price' => 120.00,
                'initial_stock' => 150,
                'low_stock_threshold' => 25,
                'pharmaceutical_form' => 'Comprimé effervescent',
                'dosage' => '1000mg',
                'expiry_date' => now()->addMonths(36)->format('Y-m-d'),
                'description' => 'Complément vitaminique',
                'status' => 'active'
            ],
            [
                'name' => 'Bétadine 10%',
                'generic_name' => 'Povidone iodée',
                'barcode' => '1234567890126',
                'category_id' => $antiseptiques->id,
                'supplier_id' => $pharmaDistribut->id,
                'purchase_price' => 120.00,
                'selling_price' => 180.00,
                'initial_stock' => 50,
                'low_stock_threshold' => 10,
                'pharmaceutical_form' => 'Solution',
                'dosage' => '10%',
                'expiry_date' => now()->addMonths(12)->format('Y-m-d'),
                'description' => 'Antiseptique à large spectre',
                'status' => 'active'
            ],
            [
                'name' => 'Aspirine 500mg',
                'generic_name' => 'Acide acétylsalicylique',
                'barcode' => '1234567890127',
                'category_id' => $antalgiques->id,
                'supplier_id' => $mediCorp->id,
                'purchase_price' => 45.00,
                'selling_price' => 70.00,
                'initial_stock' => 5, // Low stock for testing alerts
                'low_stock_threshold' => 15,
                'pharmaceutical_form' => 'Comprimé',
                'dosage' => '500mg',
                'expiry_date' => now()->addDays(25)->format('Y-m-d'), // Expiring soon for testing alerts
                'description' => 'Antalgique, antipyrétique et anti-inflammatoire',
                'status' => 'active'
            ],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['barcode' => $productData['barcode']],
                $productData
            );
        }

        $this->command->info('Sample stock data created successfully!');
        $this->command->info('Categories: ' . Category::count());
        $this->command->info('Suppliers: ' . Supplier::count());
        $this->command->info('Products: ' . Product::count());
    }
}
