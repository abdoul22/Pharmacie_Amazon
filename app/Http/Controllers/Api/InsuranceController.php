<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class InsuranceController extends Controller
{
    /**
     * Liste toutes les assurances
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Insurance::query();

            // Filtrer par statut actif/inactif
            if ($request->has('active')) {
                $query->where('is_active', $request->boolean('active'));
            }

            // Filtrer par type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Recherche par nom ou code
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('code', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            // Trier
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination ou tout
            if ($request->boolean('all')) {
                $insurances = $query->get();
            } else {
                $perPage = $request->get('per_page', 15);
                $insurances = $query->paginate($perPage);
            }

            return response()->json([
                'success' => true,
                'message' => 'Insurances retrieved successfully',
                'data' => $insurances,
                'meta' => [
                    'total_active' => Insurance::active()->count(),
                    'total_inactive' => Insurance::where('is_active', false)->count(),
                    'types_stats' => [
                        'public' => Insurance::active()->where('type', 'public')->count(),
                        'private' => Insurance::active()->where('type', 'private')->count(),
                        'mutual' => Insurance::active()->where('type', 'mutual')->count(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des assurances',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Créer une nouvelle assurance
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'name_ar' => 'nullable|string|max:255',
                'code' => 'required|string|max:10|unique:insurances,code',
                'description' => 'nullable|string',
                'reimbursement_percentage' => 'required|numeric|min:0|max:100',
                'processing_days' => 'required|integer|min:1|max:365',
                'requires_preauthorization' => 'boolean',
                'preauth_threshold' => 'nullable|numeric|min:0',
                'type' => 'required|in:public,private,mutual',
                'contact_info' => 'nullable|array',
                'contact_info.phone' => 'nullable|string',
                'contact_info.email' => 'nullable|email',
                'contact_info.address' => 'nullable|string',
                'is_active' => 'boolean',
                'notes' => 'nullable|string'
            ]);

            $insurance = Insurance::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Assurance créée avec succès',
                'data' => $insurance
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'assurance',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Afficher une assurance spécifique
     */
    public function show(Insurance $insurance): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Insurance details retrieved successfully',
                'data' => $insurance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'assurance',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Mettre à jour une assurance
     */
    public function update(Request $request, Insurance $insurance): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'name_ar' => 'nullable|string|max:255',
                'code' => [
                    'sometimes',
                    'string',
                    'max:10',
                    Rule::unique('insurances', 'code')->ignore($insurance->id)
                ],
                'description' => 'nullable|string',
                'reimbursement_percentage' => 'sometimes|numeric|min:0|max:100',
                'processing_days' => 'sometimes|integer|min:1|max:365',
                'requires_preauthorization' => 'boolean',
                'preauth_threshold' => 'nullable|numeric|min:0',
                'type' => 'sometimes|in:public,private,mutual',
                'contact_info' => 'nullable|array',
                'contact_info.phone' => 'nullable|string',
                'contact_info.email' => 'nullable|email',
                'contact_info.address' => 'nullable|string',
                'is_active' => 'boolean',
                'notes' => 'nullable|string'
            ]);

            $insurance->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Assurance mise à jour avec succès',
                'data' => $insurance->fresh()
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
                'message' => 'Erreur lors de la mise à jour de l\'assurance',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Supprimer une assurance
     */
    public function destroy(Insurance $insurance): JsonResponse
    {
        try {
            // Vérifier si l'assurance est utilisée dans des transactions (à implémenter plus tard)
            // if ($insurance->credits()->count() > 0) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Impossible de supprimer cette assurance car elle est utilisée dans des transactions'
            //     ], 409);
            // }

            $insuranceName = $insurance->name;
            $insurance->delete();

            return response()->json([
                'success' => true,
                'message' => "Assurance '{$insuranceName}' supprimée avec succès"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'assurance',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Activer/désactiver une assurance
     */
    public function toggleStatus(Insurance $insurance): JsonResponse
    {
        try {
            $insurance->update(['is_active' => !$insurance->is_active]);

            $status = $insurance->is_active ? 'activée' : 'désactivée';

            return response()->json([
                'success' => true,
                'message' => "Assurance '{$insurance->name}' {$status} avec succès",
                'data' => [
                    'id' => $insurance->id,
                    'name' => $insurance->name,
                    'is_active' => $insurance->is_active
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de statut',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Calculer le remboursement pour un montant donné
     */
    public function calculateReimbursement(Request $request, Insurance $insurance): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.01'
            ]);

            $amount = $request->amount;
            $reimbursement = $insurance->calculateReimbursement($amount);
            $patientPay = $amount - $reimbursement;
            $needsPreauth = $insurance->needsPreauthorization($amount);

            return response()->json([
                'success' => true,
                'message' => 'Calcul de remboursement effectué',
                'data' => [
                    'insurance' => $insurance->only(['name', 'code', 'reimbursement_percentage']),
                    'original_amount' => $amount,
                    'reimbursement_amount' => $reimbursement,
                    'patient_amount' => $patientPay,
                    'needs_preauthorization' => $needsPreauth,
                    'processing_days' => $insurance->processing_days,
                    'currency' => 'MRU'
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Montant invalide',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
