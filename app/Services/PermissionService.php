<?php

namespace App\Services;

use App\Models\User;

class PermissionService
{
    /**
     * Permissions mapping for each role
     */
    const PERMISSIONS = [
        'superadmin' => ['*'],
        'admin' => [
            'manage_users',
            'manage_products',
            'manage_suppliers',
            'view_reports',
            'manage_categories',
            'view_sales',
            'manage_stock',
        ],
        'vendeur' => [
            'view_products',
            'create_sales',
            'manage_customers',
            'view_stock',
            'create_invoices',
            'view_customer_history',
        ],
        'pharmacien' => [
            'manage_prescriptions',
            'validate_prescriptions',
            'manage_medicines',
            'manage_controlled_substances',
            'view_product_interactions',
            'manage_inventory',
            'view_stock',
            'manage_suppliers',
            'view_reports',
            'create_sales',
            'manage_pharmacy_operations',
        ],
        'caissier' => [
            'manage_payments',
            'manage_credits',
            'view_sales',
            'process_refunds',
            'manage_cash_register',
            'view_payment_reports',
        ]
    ];

    /**
     * Role display names
     */
    const ROLE_NAMES = [
        'superadmin' => 'Super Administrateur',
        'admin' => 'Administrateur',
        'pharmacien' => 'Pharmacien',
        'vendeur' => 'Vendeur',
        'caissier' => 'Caissier',
    ];

    /**
     * Check if user has a specific permission
     */
    public static function userHasPermission(User $user, string $permission): bool
    {
        if (!$user || !$user->role) {
            return false;
        }

        $userPermissions = self::PERMISSIONS[$user->role] ?? [];

        // Superadmin has all permissions
        if (in_array('*', $userPermissions)) {
            return true;
        }

        return in_array($permission, $userPermissions);
    }

    /**
     * Check if user has any of the given permissions
     */
    public static function userHasAnyPermission(User $user, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (self::userHasPermission($user, $permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public static function userHasAllPermissions(User $user, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!self::userHasPermission($user, $permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get all permissions for a user's role
     */
    public static function getUserPermissions(User $user): array
    {
        if (!$user || !$user->role) {
            return [];
        }

        return self::PERMISSIONS[$user->role] ?? [];
    }

    /**
     * Get all available roles with their permissions
     */
    public static function getAllRoles(): array
    {
        $roles = [];
        foreach (self::PERMISSIONS as $roleName => $permissions) {
            $roles[] = [
                'id' => array_search($roleName, array_keys(self::PERMISSIONS)) + 1,
                'name' => $roleName,
                'display_name' => self::ROLE_NAMES[$roleName],
                'permissions' => $permissions,
            ];
        }
        return $roles;
    }

    /**
     * Check if user can manage another user (role hierarchy)
     */
    public static function canManageUser(User $manager, User $targetUser): bool
    {
        if (!$manager || !$targetUser) {
            return false;
        }

        // Superadmin can manage everyone
        if ($manager->role === 'superadmin') {
            return true;
        }

        // Admin can manage pharmacien, vendeur and caissier
        if ($manager->role === 'admin') {
            return in_array($targetUser->role, ['pharmacien', 'vendeur', 'caissier']);
        }

        // Others can't manage users
        return false;
    }

    /**
     * Get valid roles that a user can assign
     */
    public static function getAssignableRoles(User $user): array
    {
        if (!$user) {
            return [];
        }

        switch ($user->role) {
            case 'superadmin':
                return ['superadmin', 'admin', 'pharmacien', 'vendeur', 'caissier'];
            case 'admin':
                return ['pharmacien', 'vendeur', 'caissier'];
            default:
                return [];
        }
    }

    /**
     * Check if a role is valid
     */
    public static function isValidRole(string $role): bool
    {
        return array_key_exists($role, self::PERMISSIONS);
    }
}
