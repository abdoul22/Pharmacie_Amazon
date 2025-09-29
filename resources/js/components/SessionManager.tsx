import React, { useState, useCallback } from 'react';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { useAuthContext } from '../contexts/AuthContextSimple';
import InactivityWarningModal from './InactivityWarningModal';

interface SessionManagerProps {
  children: React.ReactNode;
  /** Configuration du délai d'inactivité */
  config?: {
    /** Délai d'inactivité en minutes (par défaut: 60 minutes = 1 heure) */
    inactivityTimeoutMinutes?: number;
    /** Délai d'avertissement en minutes avant déconnexion (par défaut: 5 minutes) */
    warningTimeoutMinutes?: number;
    /** Désactiver le gestionnaire de session */
    disabled?: boolean;
  };
}

/**
 * Gestionnaire de session qui enveloppe l'application
 * 
 * Fonctionnalités:
 * - Tracker l'activité utilisateur automatiquement
 * - Afficher un modal d'avertissement avant déconnexion
 * - Déconnecter automatiquement après inactivité
 * - Permettre à l'utilisateur d'étendre sa session
 * 
 * Usage:
 * ```tsx
 * <SessionManager config={{ inactivityTimeoutMinutes: 60 }}>
 *   <App />
 * </SessionManager>
 * ```
 */
export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  config = {},
}) => {
  const {
    inactivityTimeoutMinutes = 60, // 1 heure par défaut
    warningTimeoutMinutes = 5,     // 5 minutes d'avertissement
    disabled = false,
  } = config;

  const { isAuthenticated, logout } = useAuthContext();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningTimeRemaining, setWarningTimeRemaining] = useState(0);

  /**
   * Callback quand l'avertissement doit être affiché
   */
  const handleWarning = useCallback(() => {
    if (!isAuthenticated) return;
    
    console.info('⚠️ Avertissement de déconnexion - Inactivité détectée');
    setWarningTimeRemaining(warningTimeoutMinutes * 60 * 1000);
    setShowWarningModal(true);
  }, [isAuthenticated, warningTimeoutMinutes]);

  /**
   * Callback lors de la déconnexion automatique
   */
  const handleAutoLogout = useCallback(() => {
    console.warn('🔒 Déconnexion automatique pour inactivité');
    setShowWarningModal(false);
    
    // Le hook useActivityTracker s'occupe déjà de la déconnexion
    // Ce callback sert principalement pour les logs et notifications
  }, []);

  // Hook de tracker d'activité
  const { resetTimer, getTimeUntilLogout } = useActivityTracker({
    inactivityTimeout: inactivityTimeoutMinutes * 60 * 1000,
    warningTimeout: warningTimeoutMinutes * 60 * 1000,
    onWarning: handleWarning,
    onAutoLogout: handleAutoLogout,
    disabled: disabled || !isAuthenticated,
  });

  /**
   * Étendre la session (réinitialiser le timer)
   */
  const handleExtendSession = useCallback(() => {
    console.info('🔄 Session étendue par l\'utilisateur');
    resetTimer();
    setShowWarningModal(false);
  }, [resetTimer]);

  /**
   * Fermer le modal d'avertissement
   */
  const handleCloseWarning = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  /**
   * Déconnexion manuelle depuis le modal
   */
  const handleManualLogout = useCallback(async () => {
    console.info('🔓 Déconnexion manuelle depuis le modal');
    setShowWarningModal(false);
    await logout();
  }, [logout]);

  // Ne pas afficher le gestionnaire si non authentifié ou désactivé
  if (!isAuthenticated || disabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Modal d'avertissement d'inactivité */}
      <InactivityWarningModal
        isOpen={showWarningModal}
        onClose={handleCloseWarning}
        onExtendSession={handleExtendSession}
        onLogoutNow={handleManualLogout}
        timeRemaining={warningTimeRemaining}
        config={{
          title: "⏰ Session expire bientôt",
          description: `Vous allez être déconnecté dans quelques minutes pour cause d'inactivité (${inactivityTimeoutMinutes} minutes sans activité).`,
          extendButtonText: "Continuer ma session",
          logoutButtonText: "Se déconnecter maintenant",
          showLogoutButton: true,
        }}
      />
    </>
  );
};

export default SessionManager;

