<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    /**
     * Modes de paiement mauritaniens disponibles
     */
    const PAYMENT_METHODS = [
        'cash' => [
            'id' => 'cash',
            'name' => 'Espèces',
            'name_ar' => 'نقدًا',
            'icon' => 'banknotes',
            'color' => 'green',
            'category' => 'physical',
            'description' => 'Paiement en espèces (Ouguiya)',
            'is_digital' => false,
            'requires_phone' => false,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => true,
        ],
        'bankily' => [
            'id' => 'bankily',
            'name' => 'Bankily',
            'name_ar' => 'بانكيلي',
            'icon' => 'mobile',
            'color' => 'blue',
            'category' => 'mobile_money',
            'description' => 'Service de paiement mobile Bankily',
            'is_digital' => true,
            'requires_phone' => true,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => true,
            'phone_format' => '+222 XX XX XX XX',
        ],
        'masrivi' => [
            'id' => 'masrivi',
            'name' => 'Masrivi',
            'name_ar' => 'مصريفي',
            'icon' => 'credit-card',
            'color' => 'purple',
            'category' => 'mobile_money',
            'description' => 'Service bancaire mobile Masrivi',
            'is_digital' => true,
            'requires_phone' => true,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => true,
            'phone_format' => '+222 XX XX XX XX',
        ],
        'sedad' => [
            'id' => 'sedad',
            'name' => 'Sedad',
            'name_ar' => 'سداد',
            'icon' => 'credit-card',
            'color' => 'red',
            'category' => 'mobile_money',
            'description' => 'Service de paiement Sedad',
            'is_digital' => true,
            'requires_phone' => true,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => true,
            'phone_format' => '+222 XX XX XX XX',
        ],
        'click' => [
            'id' => 'click',
            'name' => 'Click',
            'name_ar' => 'كليك',
            'icon' => 'cursor-click',
            'color' => 'orange',
            'category' => 'digital_wallet',
            'description' => 'Portefeuille numérique Click',
            'is_digital' => true,
            'requires_phone' => true,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => false,
            'phone_format' => '+222 XX XX XX XX',
        ],
        'moov_money' => [
            'id' => 'moov_money',
            'name' => 'Moov Money',
            'name_ar' => 'موڤ موني',
            'icon' => 'device-mobile',
            'color' => 'yellow',
            'category' => 'mobile_money',
            'description' => 'Service de paiement mobile Moov Money',
            'is_digital' => true,
            'requires_phone' => true,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => true,
            'phone_format' => '+222 XX XX XX XX',
        ],
        'bimbank' => [
            'id' => 'bimbank',
            'name' => 'Bimbank',
            'name_ar' => 'بيم بنك',
            'icon' => 'building-bank',
            'color' => 'indigo',
            'category' => 'banking',
            'description' => 'Service bancaire Bimbank',
            'is_digital' => true,
            'requires_phone' => false,
            'processing_fee' => 0,
            'currency' => 'MRU',
            'enabled' => true,
            'instant' => false,
            'account_format' => 'XXXX-XXXX-XXXX-XXXX',
        ]
    ];

    /**
     * Obtenir tous les modes de paiement disponibles
     */
    public function getMethods(Request $request)
    {
        try {
            $methods = collect(self::PAYMENT_METHODS)
                ->filter(fn($method) => $method['enabled'])
                ->values();

            // Statistiques d'utilisation (optionnel)
            $stats = [
                'total_methods' => $methods->count(),
                'digital_methods' => $methods->where('is_digital', true)->count(),
                'instant_methods' => $methods->where('instant', true)->count(),
                'mobile_methods' => $methods->where('category', 'mobile_money')->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Payment methods retrieved successfully',
                'data' => [
                    'methods' => $methods,
                    'stats' => $stats,
                    'currency' => 'MRU',
                    'currency_symbol' => 'أوقية',
                    'split_payments_enabled' => true,
                    'max_split_methods' => 3, // Maximum 3 méthodes par paiement fractionné
                ],
                'meta' => [
                    'user_role' => $request->user()->role ?? 'guest',
                    'timestamp' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des modes de paiement',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
