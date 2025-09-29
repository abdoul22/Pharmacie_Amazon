import { useAuthContext } from '@/contexts/AuthContextSimple';

/**
 * Mapping des permissions par rôle (synchronisé avec le backend Laravel)
 */
const PERMISSIONS = {
  superadmin: ['*'],
  admin: [
    'manage_users',
    'manage_products',
    'manage_suppliers',
    'view_reports',
    'manage_categories',
    'view_sales',
    'manage_stock',
  ],
  pharmacien: [
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
  vendeur: [
    'view_products',
    'create_sales',
    'manage_customers',
    'view_stock',
    'create_invoices',
    'view_customer_history',
  ],
  caissier: [
    'manage_payments',
    'manage_credits',
    'view_sales',
    'process_refunds',
    'manage_cash_register',
    'view_payment_reports',
  ]
} as const;

/**
 * Noms d'affichage des rôles
 */
const ROLE_NAMES = {
  superadmin: 'Super Administrateur',
  admin: 'Administrateur',
  pharmacien: 'Pharmacien',
  vendeur: 'Vendeur',
  caissier: 'Caissier',
} as const;

/**
 * Hook pour la gestion des permissions basées sur les rôles
 *
 * @returns Objets et fonctions pour vérifier les permissions
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuthContext();

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user?.role) return false;

    const userPermissions = PERMISSIONS[user.role as keyof typeof PERMISSIONS] ?? [];

    // SuperAdmin a toutes les permissions
    if (userPermissions.includes('*')) return true;

    return userPermissions.includes(permission);
  };

  /**
   * Vérifie si l'utilisateur a l'une des permissions données
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Vérifie si l'utilisateur a toutes les permissions données
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role: string): boolean => {
    if (!isAuthenticated || !user?.role) return false;
    return user.role === role;
  };

  /**
   * Vérifie si l'utilisateur a l'un des rôles donnés
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!isAuthenticated || !user?.role) return false;
    return roles.includes(user.role);
  };

  /**
   * Obtient le niveau hiérarchique du rôle (plus bas = plus de permissions)
   */
  const getRoleLevel = (): number => {
    if (!user?.role) return 999; // Niveau le plus bas pour les non-authentifiés

    const roleLevels: Record<string, number> = {
      superadmin: 1,
      admin: 2,
      pharmacien: 3,
      vendeur: 3, // Même niveau que pharmacien mais domaines différents
      caissier: 4,
    };

    return roleLevels[user.role] ?? 999;
  };

  /**
   * Vérifie si l'utilisateur peut gérer un autre utilisateur (hiérarchie)
   */
  const canManageUser = (targetUserRole: string): boolean => {
    if (!isAuthenticated || !user?.role) return false;

    const currentLevel = getRoleLevel();
    const targetLevel = getRoleLevel();

    // SuperAdmin peut tout gérer
    if (user.role === 'superadmin') return true;

    // Admin peut gérer pharmacien, vendeur, caissier
    if (user.role === 'admin') {
      return ['pharmacien', 'vendeur', 'caissier'].includes(targetUserRole);
    }

    // Autres rôles ne peuvent pas gérer d'utilisateurs
    return false;
  };

  /**
   * Obtient toutes les permissions de l'utilisateur
   */
  const getUserPermissions = (): string[] => {
    if (!isAuthenticated || !user?.role) return [];
    return [...(PERMISSIONS[user.role as keyof typeof PERMISSIONS] ?? [])];
  };

  /**
   * Obtient le nom d'affichage du rôle
   */
  const getRoleDisplayName = (role?: string): string => {
    const roleToCheck = role || user?.role;
    if (!roleToCheck) return 'Non défini';

    return ROLE_NAMES[roleToCheck as keyof typeof ROLE_NAMES] ?? roleToCheck;
  };

  /**
   * Vérifie si l'utilisateur peut accéder à une route spécifique
   */
  const canAccessRoute = (requiredPermissions: string[] = [], requiredRoles: string[] = []): boolean => {
    // Si aucune restriction, accès libre pour les utilisateurs authentifiés
    if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
      return isAuthenticated;
    }

    // Vérifier les rôles requis
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return false;
    }

    // Vérifier les permissions requises
    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
      return false;
    }

    return true;
  };

  /**
   * Obtient les routes/actions disponibles selon le rôle
   */
  const getAvailableActions = () => {
    const actions = {
      dashboard: true, // Tous les utilisateurs authentifiés ont un dashboard
      sales: hasAnyPermission(['create_sales', 'view_sales']),
      stock: hasAnyPermission(['view_stock', 'manage_stock', 'manage_inventory']),
      products: hasAnyPermission(['view_products', 'manage_products']),
      customers: hasPermission('manage_customers'),
      payments: hasAnyPermission(['manage_payments', 'view_payment_reports']),
      credits: hasPermission('manage_credits'),
      reports: hasAnyPermission(['view_reports', 'view_payment_reports']),
      prescriptions: hasAnyPermission(['manage_prescriptions', 'validate_prescriptions']),
      users: hasPermission('manage_users'),
      system: hasRole('superadmin'),
      suppliers: hasPermission('manage_suppliers'),
      categories: hasPermission('manage_categories'),
    };

    return actions;
  };

  return {
    // État utilisateur
    user,
    isAuthenticated,
    currentRole: user?.role,
    roleLevel: getRoleLevel(),
    roleDisplayName: getRoleDisplayName(),

    // Vérifications de permissions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Vérifications de rôles
    hasRole,
    hasAnyRole,
    canManageUser,

    // Utilitaires
    getUserPermissions,
    getRoleDisplayName,
    canAccessRoute,
    getAvailableActions,

    // Constantes
    PERMISSIONS,
    ROLE_NAMES,
  };
};

export default usePermissions;
