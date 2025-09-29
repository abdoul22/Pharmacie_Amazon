<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Afficher tous les utilisateurs (SuperAdmin uniquement)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est SuperAdmin
            if (!Auth::user() || !Auth::user()->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Seuls les SuperAdmin peuvent gérer les utilisateurs.'
                ], 403);
            }

            $query = User::query();

            // Filtres
            if ($request->has('status')) {
                if ($request->status === 'pending') {
                    $query->where('is_approved', false);
                } elseif ($request->status === 'approved') {
                    $query->where('is_approved', true);
                }
            }

            if ($request->has('role') && $request->role !== 'all') {
                $query->whereHas('role', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Tri
            $sortField = $request->get('sort', 'created_at');
            $sortDirection = $request->get('direction', 'desc');

            $validSortFields = ['name', 'email', 'role', 'is_approved', 'created_at'];
            if (in_array($sortField, $validSortFields)) {
                if ($sortField === 'role') {
                    // Trier par nom de rôle via la relation
                    $query->join('roles', 'users.role_id', '=', 'roles.id')
                        ->orderBy('roles.name', $sortDirection)
                        ->select('users.*');
                } else {
                    $query->orderBy($sortField, $sortDirection);
                }
            }

            $users = $query->paginate($request->get('per_page', 15));

            // Enrichir avec les permissions
            $users->getCollection()->transform(function ($user) {
                // Rôle sous forme de string (peut être null si non attribué)
                $user->role = $user->role; // accessor renvoie le nom du rôle

                // Statut dérivé
                if (!empty($user->suspended_at)) {
                    $user->status = 'suspended';
                } elseif (!$user->is_approved) {
                    $user->status = 'pending';
                } else {
                    $user->status = 'active';
                }

                // Infos complémentaires d'affichage
                $user->permissions = PermissionService::getUserPermissions($user);
                $user->last_login_formatted = $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Jamais connecté';
                $user->created_at_formatted = $user->created_at->format('d/m/Y à H:i');
                return $user;
            });

            return response()->json([
                'success' => true,
                'data' => $users,
                'stats' => [
                    'total_users' => User::count(),
                    'pending_approval' => User::where('is_approved', false)->count(),
                    'approved_users' => User::where('is_approved', true)->count(),
                    'roles_distribution' => [
                        'superadmin' => User::whereHas('role', function ($q) {
                            $q->where('name', 'superadmin');
                        })->count(),
                        'admin' => User::whereHas('role', function ($q) {
                            $q->where('name', 'admin');
                        })->count(),
                        'pharmacien' => User::whereHas('role', function ($q) {
                            $q->where('name', 'pharmacien');
                        })->count(),
                        'vendeur' => User::whereHas('role', function ($q) {
                            $q->where('name', 'vendeur');
                        })->count(),
                        'caissier' => User::whereHas('role', function ($q) {
                            $q->where('name', 'caissier');
                        })->count(),
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des utilisateurs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approuver un utilisateur et lui attribuer un rôle
     */
    public function approveUser(Request $request, $userId): JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est SuperAdmin
            if (!Auth::user() || !Auth::user()->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Seuls les SuperAdmin peuvent approuver les utilisateurs.'
                ], 403);
            }

            $request->validate([
                'role' => ['required', Rule::in(['admin', 'pharmacien', 'vendeur', 'caissier'])],
            ]);

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Empêcher la modification d'un autre SuperAdmin
            if ($user->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de modifier un compte SuperAdmin'
                ], 403);
            }

            DB::transaction(function () use ($user, $request) {
                // Récupérer le rôle par son nom
                $role = \App\Models\Role::where('name', $request->role)->first();
                if (!$role) {
                    throw new \Exception('Rôle non trouvé');
                }

                $user->update([
                    'is_approved' => true,
                    'role_id' => $role->id,
                    'approved_by' => Auth::id(),
                    'approved_at' => now()
                ]);

                // Log de l'action
                Log::info('Utilisateur approuvé et rôle attribué', [
                    'approved_user_id' => $user->id,
                    'approved_user_email' => $user->email,
                    'assigned_role' => $request->role,
                    'approved_by' => Auth::user()->email,
                    'timestamp' => now()
                ]);
            });

            $user->refresh();
            $user->permissions = PermissionService::getUserPermissions($user);

            return response()->json([
                'success' => true,
                'message' => "Utilisateur {$user->name} approuvé avec le rôle {$request->role}",
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'approbation de l\'utilisateur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'approbation de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspendre/désactiver un utilisateur
     */
    public function suspendUser(Request $request, $userId): JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est SuperAdmin
            if (!Auth::user() || !Auth::user()->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Seuls les SuperAdmin peuvent suspendre les utilisateurs.'
                ], 403);
            }

            $request->validate([
                'reason' => 'nullable|string|max:255'
            ]);

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Empêcher la suspension d'un autre SuperAdmin
            if ($user->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de suspendre un compte SuperAdmin'
                ], 403);
            }

            // Empêcher l'auto-suspension
            if ($user->id === Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de suspendre votre propre compte'
                ], 403);
            }

            DB::transaction(function () use ($user, $request) {
                $user->update([
                    'is_approved' => false,
                    'suspended_by' => Auth::id(),
                    'suspended_at' => now(),
                    'suspension_reason' => $request->reason
                ]);

                // Révoquer tous les tokens de l'utilisateur
                $user->tokens()->delete();

                // Log de l'action
                Log::info('Utilisateur suspendu', [
                    'suspended_user_id' => $user->id,
                    'suspended_user_email' => $user->email,
                    'reason' => $request->reason,
                    'suspended_by' => Auth::user()->email,
                    'timestamp' => now()
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => "Utilisateur {$user->name} suspendu avec succès"
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suspension de l\'utilisateur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suspension de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Changer le rôle d'un utilisateur approuvé
     */
    public function changeUserRole(Request $request, $userId): JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est SuperAdmin
            if (!Auth::user() || !Auth::user()->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Seuls les SuperAdmin peuvent changer les rôles.'
                ], 403);
            }

            $request->validate([
                'role' => ['required', Rule::in(['admin', 'pharmacien', 'vendeur', 'caissier'])],
            ]);

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Empêcher la modification d'un SuperAdmin
            if ($user->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de modifier le rôle d\'un SuperAdmin'
                ], 403);
            }

            $oldRole = $user->role; // C'est une string grâce à l'accessor

            DB::transaction(function () use ($user, $request, $oldRole) {
                // Récupérer le nouveau rôle par son nom
                $newRole = \App\Models\Role::where('name', $request->role)->first();
                if (!$newRole) {
                    throw new \Exception('Rôle non trouvé');
                }

                $user->update([
                    'role_id' => $newRole->id,
                    'role_changed_by' => Auth::id(),
                    'role_changed_at' => now()
                ]);

                // Log de l'action
                Log::info('Rôle utilisateur modifié', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'old_role' => $oldRole,
                    'new_role' => $request->role,
                    'changed_by' => Auth::user()->email,
                    'timestamp' => now()
                ]);
            });

            $user->refresh();
            $user->permissions = PermissionService::getUserPermissions($user);

            return response()->json([
                'success' => true,
                'message' => "Rôle de {$user->name} changé de {$oldRole} à {$request->role}",
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors du changement de rôle: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de rôle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer définitivement un utilisateur
     */
    public function deleteUser($userId): JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est SuperAdmin
            if (!Auth::user() || !Auth::user()->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Seuls les SuperAdmin peuvent supprimer les utilisateurs.'
                ], 403);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Empêcher la suppression d'un SuperAdmin
            if ($user->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer un compte SuperAdmin'
                ], 403);
            }

            // Empêcher l'auto-suppression
            if ($user->id === Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer votre propre compte'
                ], 403);
            }

            $userName = $user->name;
            $userEmail = $user->email;

            DB::transaction(function () use ($user) {
                // Révoquer tous les tokens
                $user->tokens()->delete();

                // Supprimer l'utilisateur
                $user->delete();

                // Log de l'action
                Log::warning('Utilisateur supprimé définitivement', [
                    'deleted_user_email' => $user->email,
                    'deleted_by' => Auth::user()->email,
                    'timestamp' => now()
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => "Utilisateur {$userName} ({$userEmail}) supprimé définitivement"
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de l\'utilisateur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les rôles disponibles
     */
    public function getAvailableRoles(): JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est SuperAdmin
            if (!Auth::user() || !Auth::user()->hasRole('superadmin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $roles = [
                [
                    'value' => 'admin',
                    'label' => 'Administrateur',
                    'description' => 'Gestion équipe, stock global, rapports avancés',
                    'permissions_count' => 7
                ],
                [
                    'value' => 'pharmacien',
                    'label' => 'Pharmacien',
                    'description' => 'Ordonnances, substances contrôlées, conformité médicale',
                    'permissions_count' => 6
                ],
                [
                    'value' => 'vendeur',
                    'label' => 'Vendeur',
                    'description' => 'Ventes, clientèle, objectifs, point de vente tactile',
                    'permissions_count' => 6
                ],
                [
                    'value' => 'caissier',
                    'label' => 'Caissier',
                    'description' => 'Paiements fractionnés, crédits, caisse, modes mauritaniens',
                    'permissions_count' => 5
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $roles
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des rôles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
