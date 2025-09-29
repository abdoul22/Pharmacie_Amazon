<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'vendeur', // Default role
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                    ],
                    'token' => $token,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            // Validation manuelle des credentials
            $credentials = $request->only('email', 'password');

            if (!Auth::attempt($credentials, $request->boolean('remember'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = Auth::user();

            // Vérifier que l'utilisateur est approuvé
            if (!$user->is_approved) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Votre compte n\'est pas encore approuvé par l\'administrateur'
                ], 403);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'permissions' => PermissionService::getUserPermissions($user),
                    ],
                    'token' => $token,
                    'expires_at' => now()->addHours(8)->toISOString(),
                ]
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role, // Accessor qui retourne le nom du rôle
                        'permissions' => PermissionService::getUserPermissions($user),
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all roles (Admin+ only)
     */
    public function roles(Request $request): JsonResponse
    {
        try {
            $roles = PermissionService::getAllRoles();

            return response()->json([
                'success' => true,
                'data' => [
                    'roles' => $roles
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user role (Admin+ only)
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        try {
            $request->validate([
                'role' => 'required|string|in:superadmin,admin,vendeur,caissier'
            ]);

            $currentUser = $request->user();

            // Check if current user can manage the target user
            if (!PermissionService::canManageUser($currentUser, $user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot manage this user'
                ], 403);
            }

            // Check if current user can assign this role
            $assignableRoles = PermissionService::getAssignableRoles($currentUser);
            if (!in_array($request->role, $assignableRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot assign this role'
                ], 403);
            }

            $user->update(['role' => $request->role]);

            return response()->json([
                'success' => true,
                'message' => 'User role updated successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'updated_at' => $user->updated_at,
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user role',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
