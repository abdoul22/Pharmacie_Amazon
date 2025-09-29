import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InactivityWarningModalProps {
  /** Si le modal est ouvert */
  isOpen: boolean;
  /** Fonction pour fermer le modal */
  onClose: () => void;
  /** Fonction pour étendre la session */
  onExtendSession: () => void;
  /** Fonction pour se déconnecter maintenant */
  onLogoutNow?: () => void;
  /** Temps restant en millisecondes */
  timeRemaining: number;
  /** Configuration personnalisée */
  config?: {
    title?: string;
    description?: string;
    extendButtonText?: string;
    logoutButtonText?: string;
    showLogoutButton?: boolean;
  };
}

/**
 * Modal d'avertissement d'inactivité
 * 
 * Affiche un compte à rebours et permet à l'utilisateur de :
 * - Étendre sa session en cliquant sur "Rester connecté"
 * - Se déconnecter immédiatement
 * - Voir le temps restant avant la déconnexion automatique
 */
export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  onClose,
  onExtendSession,
  onLogoutNow,
  timeRemaining,
  config = {},
}) => {
  const {
    title = "⏰ Déconnexion imminente",
    description = "Vous allez être déconnecté automatiquement pour cause d'inactivité.",
    extendButtonText = "Rester connecté",
    logoutButtonText = "Se déconnecter maintenant",
    showLogoutButton = true,
  } = config;

  const [countdown, setCountdown] = useState(timeRemaining);

  // Mettre à jour le compte à rebours chaque seconde
  useEffect(() => {
    if (!isOpen) return;

    setCountdown(timeRemaining);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const newValue = Math.max(0, prev - 1000);
        
        // Fermer automatiquement le modal si le temps est écoulé
        if (newValue === 0) {
          onClose();
        }
        
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeRemaining, onClose]);

  /**
   * Formater le temps en minutes:secondes
   */
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Étendre la session et fermer le modal
   */
  const handleExtendSession = () => {
    onExtendSession();
    onClose();
  };

  /**
   * Se déconnecter immédiatement
   */
  const handleLogoutNow = () => {
    if (onLogoutNow) {
      onLogoutNow();
    }
    onClose();
  };

  /**
   * Obtenir la couleur du compte à rebours selon le temps restant
   */
  const getCountdownColor = (): string => {
    const minutes = countdown / 1000 / 60;
    
    if (minutes <= 1) {
      return 'text-red-600 dark:text-red-400';
    } else if (minutes <= 2) {
      return 'text-orange-600 dark:text-orange-400';
    } else {
      return 'text-blue-600 dark:text-blue-400';
    }
  };

  /**
   * Obtenir l'icône selon le temps restant
   */
  const getIcon = () => {
    const minutes = countdown / 1000 / 60;
    
    if (minutes <= 1) {
      return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
    } else {
      return <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {/* Empêcher la fermeture par clic extérieur */}}>
      <DialogContent 
        className="sm:max-w-md" 
        hideCloseButton={true} // Empêcher fermeture par X
      >
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Message d'avertissement */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {description}
            </AlertDescription>
          </Alert>

          {/* Compte à rebours */}
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Déconnexion automatique dans :
            </div>
            <div className={`text-4xl font-mono font-bold ${getCountdownColor()}`}>
              {formatTime(countdown)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              minutes:secondes
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Cliquez sur "{extendButtonText}" pour continuer votre session ou 
            toute activité (clic, clavier, etc.) réinitialisera automatiquement le délai.
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {/* Bouton pour étendre la session */}
          <Button
            onClick={handleExtendSession}
            className="flex-1 gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            {extendButtonText}
          </Button>

          {/* Bouton pour se déconnecter maintenant (optionnel) */}
          {showLogoutButton && onLogoutNow && (
            <Button
              onClick={handleLogoutNow}
              variant="outline"
              className="flex-1"
            >
              {logoutButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InactivityWarningModal;

