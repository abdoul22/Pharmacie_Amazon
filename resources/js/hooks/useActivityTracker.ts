import { useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContextSimple';

interface UseActivityTrackerOptions {
  /** Délai d'inactivité en millisecondes (par défaut: 1 heure) */
  inactivityTimeout?: number;
  /** Afficher un avertissement avant la déconnexion (par défaut: 5 minutes avant) */
  warningTimeout?: number;
  /** Callback appelé quand l'utilisateur est proche de la déconnexion */
  onWarning?: () => void;
  /** Callback appelé lors de la déconnexion automatique */
  onAutoLogout?: () => void;
  /** Désactiver le tracker (utile pour les pages de connexion) */
  disabled?: boolean;
}

/**
 * Hook pour tracker l'activité utilisateur et déconnecter automatiquement après inactivité
 *
 * Événements trackés:
 * - Mouvements de souris
 * - Clics
 * - Appuis de touches
 * - Touches tactiles (mobile/tablette)
 * - Défilement de page
 * - Focus sur des éléments
 */
export const useActivityTracker = (options: UseActivityTrackerOptions = {}) => {
  const {
    inactivityTimeout = 60 * 60 * 1000, // 1 heure par défaut
    warningTimeout = 5 * 60 * 1000, // 5 minutes d'avertissement par défaut
    onWarning,
    onAutoLogout,
    disabled = false,
  } = options;

  const { logout, isAuthenticated } = useAuthContext();

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownWarningRef = useRef<boolean>(false);

  /**
   * Mettre à jour le timestamp de la dernière activité
   */
  const updateActivity = useCallback(() => {
    if (disabled || !isAuthenticated) return;

    lastActivityRef.current = Date.now();
    hasShownWarningRef.current = false;

    // Nettoyer les timers existants
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // Programmer l'avertissement
    const warningDelay = inactivityTimeout - warningTimeout;
    if (warningDelay > 0 && onWarning) {
      warningTimerRef.current = setTimeout(() => {
        if (!hasShownWarningRef.current) {
          hasShownWarningRef.current = true;
          onWarning();
        }
      }, warningDelay);
    }

    // Programmer la déconnexion automatique
    logoutTimerRef.current = setTimeout(() => {
      handleAutoLogout();
    }, inactivityTimeout);
  }, [disabled, isAuthenticated, inactivityTimeout, warningTimeout, onWarning]);

  /**
   * Gérer la déconnexion automatique
   */
  const handleAutoLogout = useCallback(async () => {
    console.warn('⏰ Déconnexion automatique - Inactivité de', inactivityTimeout / 1000 / 60, 'minutes');

    // Nettoyer les données sensibles du localStorage/sessionStorage
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');

    // Nettoyer d'autres données sensibles si nécessaires
    localStorage.removeItem('user_preferences');
    sessionStorage.removeItem('cart_data');
    sessionStorage.removeItem('temp_sale_data');

    // Callback personnalisé
    if (onAutoLogout) {
      onAutoLogout();
    }

    // Déconnecter via le context auth
    await logout();

    // Rediriger vers la page de connexion avec un message
    if (typeof window !== 'undefined') {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('reason', 'inactivity');
      loginUrl.searchParams.set('message', 'Vous avez été déconnecté pour cause d\'inactivité');
      window.location.href = loginUrl.toString();
    }
  }, [inactivityTimeout, onAutoLogout, logout]);

  /**
   * Réinitialiser manuellement le timer d'activité
   */
  const resetTimer = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  /**
   * Obtenir le temps restant avant déconnexion (en millisecondes)
   */
  const getTimeUntilLogout = useCallback((): number => {
    if (disabled || !isAuthenticated) return Infinity;

    const timeSinceActivity = Date.now() - lastActivityRef.current;
    const timeRemaining = inactivityTimeout - timeSinceActivity;

    return Math.max(0, timeRemaining);
  }, [disabled, isAuthenticated, inactivityTimeout]);

  /**
   * Vérifier si l'avertissement doit être affiché
   */
  const shouldShowWarning = useCallback((): boolean => {
    if (disabled || !isAuthenticated) return false;

    const timeRemaining = getTimeUntilLogout();
    return timeRemaining <= warningTimeout && timeRemaining > 0;
  }, [disabled, isAuthenticated, getTimeUntilLogout, warningTimeout]);

  // Événements à tracker pour détecter l'activité utilisateur
  useEffect(() => {
    if (disabled || !isAuthenticated) {
      return;
    }

    // Liste des événements qui indiquent une activité utilisateur
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'keyup',
      'click',
      'dblclick',
      'scroll',
      'touchstart',
      'touchmove',
      'touchend',
      'focus',
      'blur',
      'contextmenu',
      'wheel',
      'pointerdown',
      'pointermove',
      'pointerup'
    ];

    // Throttling pour éviter trop d'appels
    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledUpdateActivity = () => {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        updateActivity();
        throttleTimer = null;
      }, 1000); // Throttle à 1 seconde maximum
    };

    // Ajouter les event listeners
    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, true);
    });

    // Initialiser le timer
    updateActivity();

    // Nettoyage
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity, true);
      });

      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }

      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [disabled, isAuthenticated, updateActivity]);

  // Nettoyer les timers si l'utilisateur se déconnecte manuellement
  useEffect(() => {
    if (!isAuthenticated) {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    }
  }, [isAuthenticated]);

  return {
    /** Réinitialiser manuellement le timer d'activité */
    resetTimer,
    /** Obtenir le temps restant avant déconnexion (ms) */
    getTimeUntilLogout,
    /** Vérifier si l'avertissement doit être affiché */
    shouldShowWarning,
    /** Timestamp de la dernière activité */
    lastActivity: lastActivityRef.current,
    /** Configuration actuelle */
    config: {
      inactivityTimeout,
      warningTimeout,
      disabled,
    },
  };
};

export default useActivityTracker;

