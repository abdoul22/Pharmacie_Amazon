<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Insurance;

class InsuranceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $insurances = [
            [
                'name' => 'CNAM',
                'name_ar' => 'الصندوق الوطني للتأمين الصحي',
                'code' => 'CNAM',
                'description' => 'Caisse Nationale d\'Assurance Maladie - Assurance publique mauritanienne',
                'reimbursement_percentage' => 80.00,
                'processing_days' => 30,
                'requires_preauthorization' => true,
                'preauth_threshold' => 50000.00, // 50,000 MRU
                'type' => 'public',
                'contact_info' => [
                    'phone' => '+222 45 25 26 27',
                    'email' => 'info@cnam.mr',
                    'address' => 'Avenue Kennedy, Nouakchott, Mauritanie'
                ],
                'is_active' => true,
                'notes' => 'Assurance publique principale en Mauritanie'
            ],
            [
                'name' => 'MGMO',
                'name_ar' => 'التعاضدية العامة لموظفي الدولة',
                'code' => 'MGMO',
                'description' => 'Mutuelle Générale des Agents de l\'État - Mutuelle des fonctionnaires',
                'reimbursement_percentage' => 90.00,
                'processing_days' => 15,
                'requires_preauthorization' => true,
                'preauth_threshold' => 75000.00, // 75,000 MRU
                'type' => 'mutual',
                'contact_info' => [
                    'phone' => '+222 45 29 30 31',
                    'email' => 'contact@mgmo.mr',
                    'address' => 'Ilot K, Nouakchott, Mauritanie'
                ],
                'is_active' => true,
                'notes' => 'Traitement accéléré 15 jours, 90% remboursement tous médicaments'
            ],
            [
                'name' => 'CNSS',
                'name_ar' => 'الصندوق الوطني للضمان الاجتماعي',
                'code' => 'CNSS',
                'description' => 'Caisse Nationale de Sécurité Sociale - Sécurité sociale',
                'reimbursement_percentage' => 70.00,
                'processing_days' => 21,
                'requires_preauthorization' => false,
                'preauth_threshold' => null,
                'type' => 'public',
                'contact_info' => [
                    'phone' => '+222 45 25 33 34',
                    'email' => 'info@cnss.mr',
                    'address' => 'Avenue Gamal Abdel Nasser, Nouakchott'
                ],
                'is_active' => true,
                'notes' => 'Sécurité sociale des travailleurs du secteur privé'
            ],
            [
                'name' => 'Assurance Atlantique',
                'name_ar' => 'التأمين الأطلسي',
                'code' => 'ATL',
                'description' => 'Compagnie d\'assurance privée mauritanienne',
                'reimbursement_percentage' => 85.00,
                'processing_days' => 10,
                'requires_preauthorization' => true,
                'preauth_threshold' => 100000.00, // 100,000 MRU
                'type' => 'private',
                'contact_info' => [
                    'phone' => '+222 45 29 40 41',
                    'email' => 'sante@atlantique.mr',
                    'address' => 'Tevragh Zeina, Nouakchott'
                ],
                'is_active' => true,
                'notes' => 'Assurance privée avec traitement rapide'
            ],
            [
                'name' => 'Mutuelle Santé Privée',
                'name_ar' => 'التعاضدية الصحية الخاصة',
                'code' => 'MSP',
                'description' => 'Mutuelle de santé du secteur privé',
                'reimbursement_percentage' => 75.00,
                'processing_days' => 14,
                'requires_preauthorization' => false,
                'preauth_threshold' => null,
                'type' => 'mutual',
                'contact_info' => [
                    'phone' => '+222 45 28 35 36',
                    'email' => 'contact@msp.mr',
                    'address' => 'Ksar, Nouakchott'
                ],
                'is_active' => true,
                'notes' => 'Mutuelle pour employés du secteur privé'
            ]
        ];

        foreach ($insurances as $insuranceData) {
            Insurance::firstOrCreate(
                ['code' => $insuranceData['code']], // Condition unique
                $insuranceData // Données complètes
            );
        }

        $this->command->info('✅ Insurance companies seeded successfully!');
        $this->command->table(
            ['Code', 'Name', 'Type', 'Reimbursement %', 'Processing Days'],
            collect($insurances)->map(fn($ins) => [
                $ins['code'],
                $ins['name'],
                $ins['type'],
                $ins['reimbursement_percentage'] . '%',
                $ins['processing_days'] . ' jours'
            ])->toArray()
        );
    }
}
