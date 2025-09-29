import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Permissions requises (au moins une doit être satisfaite) */
  requiredPermissions?: string[];
  /** Rôles requis (au moins un doit être satisfait) */
  requiredRoles?: string[];
  /** Message personnalisé d'erreur */
  fallbackMessage?: string;
  /** Titre personnalisé d'erreur */
  fallbackTitle?: string;
  /** Masquer le bouton de retour */
  hideBackButton?: boolean;
  /** Composant de fallback personnalisé */
  fallbackComponent?: React.ReactNode;
}

/**
 * Composant de protection basé sur les permissions et rôles
 *
 * Utilise le hook usePermissions pour vérifier l'accès
 * Affiche un message d'erreur si l'accès est refusé
 *
 * @example
 * ```tsx
 * <PermissionGuard requiredPermissions={['manage_users']}>
 *   <UserManagementPage />
 * </PermissionGuard>
 *
 * <PermissionGuard requiredRoles={['superadmin', 'admin']}>
 *   <AdminPanel />
 * </PermissionGuard>
 * ```
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackMessage,
  fallbackTitle = 'Accès restreint',
  hideBackButton = false,
  fallbackComponent,
}) => {
  const {
    canAccessRoute,
    isAuthenticated,
    user,
    roleDisplayName,
    hasAnyPermission,
    hasAnyRole
  } = usePermissions();

  const navigate = useNavigate();

  // Si pas de restrictions, autoriser l'accès pour les utilisateurs authentifiés
  if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
    return isAuthenticated ? <>{children}</> : null;
  }

  // Vérifier l'accès
  if (canAccessRoute(requiredPermissions, requiredRoles)) {
    return <>{children}</>;
  }

  // Si un composant de fallback personnalisé est fourni
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Déterminer le message d'erreur approprié
  const getErrorMessage = (): string => {
    if (fallbackMessage) return fallbackMessage;

    if (!isAuthenticated) {
      return 'Vous devez être connecté pour accéder à cette page.';
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return `Votre rôle "${roleDisplayName}" ne vous permet pas d'accéder à cette section. Rôles requis: ${requiredRoles.map(role => ROLE_NAMES[role as keyof typeof ROLE_NAMES] || role).join(', ')}.`;
    }

    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
      return `Vous n'avez pas les permissions nécessaires pour accéder à cette section. Permissions requises: ${requiredPermissions.join(', ')}.`;
    }

    return 'Vous n\'avez pas les autorisations nécessaires pour accéder à cette page.';
  };

  const getRecommendations = (): string[] => {
    const recommendations = [];

    if (!isAuthenticated) {
      recommendations.push('Connectez-vous avec un compte autorisé');
      return recommendations;
    }

    if (user?.role === 'caissier' && requiredPermissions.some(p => ['manage_users', 'manage_products'].includes(p))) {
      recommendations.push('Contactez un administrateur ou pharmacien pour cette action');
    } else if (user?.role === 'vendeur' && requiredPermissions.includes('manage_users')) {
      recommendations.push('Seuls les administrateurs peuvent gérer les utilisateurs');
    } else if (requiredRoles.includes('superadmin')) {
      recommendations.push('Cette section est réservée au super-administrateur');
    } else {
      recommendations.push('Contactez votre superviseur pour obtenir les autorisations nécessaires');
    }

    return recommendations;
  };

  // Constantes pour les noms de rôles (importées du hook)
  const ROLE_NAMES = {
    superadmin: 'Super Administrateur',
    admin: 'Administrateur',
    pharmacien: 'Pharmacien',
    vendeur: 'Vendeur',
    caissier: 'Caissier',
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-xl text-red-600 dark:text-red-400">
            {fallbackTitle}
          </CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informations utilisateur */}
          {isAuthenticated && user && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Vos informations
              </h4>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div><strong>Nom:</strong> {user.name}</div>
                <div><strong>Rôle:</strong> {roleDisplayName}</div>
                <div><strong>Email:</strong> {user.email}</div>
              </div>
            </div>
          )}

          {/* Recommandations */}
          <div>
            <h4 className="font-medium text-sm mb-2">Comment résoudre ?</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {getRecommendations().map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations de debug en développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-xs">
              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Debug (Développement uniquement)
              </h5>
              <div className="space-y-1 text-yellow-700 dark:text-yellow-300">
                <div><strong>Permissions requises:</strong> {requiredPermissions.join(', ') || 'Aucune'}</div>
                <div><strong>Rôles requis:</strong> {requiredRoles.join(', ') || 'Aucun'}</div>
                <div><strong>Authentifié:</strong> {isAuthenticated ? 'Oui' : 'Non'}</div>
                <div><strong>Rôle actuel:</strong> {user?.role || 'Aucun'}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!hideBackButton && (
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
            <Button
              onClick={() => navigate('/app/pharmacy')}
              className="flex-1"
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionGuard;
