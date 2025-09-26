<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PrescriptionController extends Controller
{
    /**
     * Obtenir les statistiques des types d'ordonnance
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = [
                'total_products' => Product::count(),
                'libre' => Product::where('prescription_type', 'libre')->count(),
                'sur_ordonnance' => Product::where('prescription_type', 'sur_ordonnance')->count(),
                'controle' => Product::where('prescription_type', 'controle')->count(),
                'requires_prescription' => Product::where('requires_prescription', true)->count(),
                'percentage' => [
                    'libre' => round((Product::where('prescription_type', 'libre')->count() / max(Product::count(), 1)) * 100, 1),
                    'sur_ordonnance' => round((Product::where('prescription_type', 'sur_ordonnance')->count() / max(Product::count(), 1)) * 100, 1),
                    'controle' => round((Product::where('prescription_type', 'controle')->count() / max(Product::count(), 1)) * 100, 1),
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Prescription statistics retrieved successfully',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Lister les produits par type d'ordonnance
     */
    public function getProductsByType(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'type' => 'required|in:libre,sur_ordonnance,controle',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255'
            ]);

            $query = Product::with(['category', 'supplier'])
                ->where('prescription_type', $request->type);

            // Recherche optionnelle
            if ($request->has('search')) {
                $query->search($request->search);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $products = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Products retrieved successfully',
                'data' => $products
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètres invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des produits',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Mettre à jour la configuration d'ordonnance d'un produit
     */
    public function updateProductPrescription(Request $request, Product $product): JsonResponse
    {
        try {
            $validated = $request->validate([
                'prescription_type' => 'required|in:libre,sur_ordonnance,controle',
                'requires_prescription' => 'boolean',
                'prescription_notes' => 'nullable|string|max:1000',
                'restricted_conditions' => 'nullable|array',
                'restricted_conditions.max_quantity_per_sale' => 'nullable|integer|min:1',
                'restricted_conditions.require_id_verification' => 'nullable|boolean',
                'restricted_conditions.age_restriction' => 'nullable|integer|min:1|max:120',
                'restricted_conditions.special_authorization' => 'nullable|boolean',
            ]);

            // Logic automatique: si type = sur_ordonnance ou controle, alors requires_prescription = true
            if (in_array($validated['prescription_type'], ['sur_ordonnance', 'controle'])) {
                $validated['requires_prescription'] = true;
            }

            $product->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Configuration des ordonnances mise à jour avec succès',
                'data' => [
                    'product' => $product->fresh()->only([
                        'id',
                        'name',
                        'prescription_type',
                        'requires_prescription',
                        'prescription_notes',
                        'restricted_conditions'
                    ]),
                    'prescription_type_name' => $product->prescription_type_name,
                    'needs_prescription' => $product->needsValidPrescription(),
                    'is_controlled' => $product->isControlledSubstance(),
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Mise à jour en lot des configurations d'ordonnance
     */
    public function bulkUpdatePrescriptions(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'products' => 'required|array|min:1|max:100',
                'products.*' => 'required|integer|exists:products,id',
                'prescription_type' => 'required|in:libre,sur_ordonnance,controle',
                'requires_prescription' => 'boolean',
                'prescription_notes' => 'nullable|string|max:1000',
            ]);

            $productIds = $validated['products'];
            $updateData = collect($validated)->except('products')->toArray();

            // Logic automatique
            if (in_array($updateData['prescription_type'], ['sur_ordonnance', 'controle'])) {
                $updateData['requires_prescription'] = true;
            }

            $updatedCount = Product::whereIn('id', $productIds)->update($updateData);

            return response()->json([
                'success' => true,
                'message' => "Configuration mise à jour pour {$updatedCount} produits",
                'data' => [
                    'updated_count' => $updatedCount,
                    'configuration' => $updateData,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour en lot',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Vérifier si un produit nécessite une ordonnance pour la vente
     */
    public function validatePrescriptionForSale(Request $request, Product $product): JsonResponse
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1',
                'customer_age' => 'nullable|integer|min:1|max:120',
                'has_prescription' => 'boolean',
                'prescription_id' => 'nullable|string', // ID de l'ordonnance si disponible
            ]);

            $quantity = $request->quantity;
            $customerAge = $request->customer_age;
            $hasPrescription = $request->boolean('has_prescription');

            $restrictions = $product->getRestrictionRules();
            $validationResult = [
                'can_sell' => true,
                'requires_prescription' => $product->needsValidPrescription(),
                'is_controlled' => $product->isControlledSubstance(),
                'warnings' => [],
                'restrictions_applied' => []
            ];

            // Vérification ordonnance obligatoire
            if ($product->needsValidPrescription() && !$hasPrescription) {
                $validationResult['can_sell'] = false;
                $validationResult['warnings'][] = 'Ordonnance obligatoire pour ce médicament';
            }

            // Vérification quantité maximale
            if (isset($restrictions['max_quantity_per_sale']) && $quantity > $restrictions['max_quantity_per_sale']) {
                $validationResult['can_sell'] = false;
                $validationResult['warnings'][] = "Quantité maximale autorisée : {$restrictions['max_quantity_per_sale']}";
                $validationResult['restrictions_applied'][] = 'max_quantity_exceeded';
            }

            // Vérification âge
            if (isset($restrictions['age_restriction']) && $customerAge && $customerAge < $restrictions['age_restriction']) {
                $validationResult['can_sell'] = false;
                $validationResult['warnings'][] = "Âge minimum requis : {$restrictions['age_restriction']} ans";
                $validationResult['restrictions_applied'][] = 'age_restriction';
            }

            // Vérification autorisation spéciale pour médicaments contrôlés
            if ($product->isControlledSubstance() && !($restrictions['special_authorization'] ?? false)) {
                $validationResult['warnings'][] = 'Médicament contrôlé - Autorisation spéciale requise';
                $validationResult['restrictions_applied'][] = 'controlled_substance';
            }

            return response()->json([
                'success' => true,
                'message' => 'Validation completed',
                'data' => [
                    'product' => $product->only(['id', 'name', 'prescription_type']),
                    'validation' => $validationResult,
                    'prescription_type_name' => $product->prescription_type_name,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètres invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
