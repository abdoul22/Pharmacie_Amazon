import { useState, useEffect, useCallback } from 'react';
import { AuthService, User, LoginCredentials, RegisterData } from '../api/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Hook personnalisé pour la gestion de l'authentification
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialiser l'authentification au montage
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialiser l'état d'authentification
   */
  const initializeAuth = useCallback(async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const response = await AuthService.getCurrentUser();
        if (response.success) {
          setState(prev => ({
            ...prev,
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          // Token invalide ou expiré
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erreur lors de l\'initialisation de l\'authentification',
      }));
    }
  }, []);

  /**
   * Connexion
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Erreur de connexion',
          isLoading: false,
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erreur de connexion';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, []);

  /**
   * Inscription
   */
  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.register(userData);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'Erreur d\'inscription',
          isLoading: false,
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erreur d\'inscription';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Rafraîchir les informations utilisateur
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.success) {
        setState(prev => ({
          ...prev,
          user: response.data,
        }));
      }
    } catch (error) {
      console.warn('Erreur lors du rafraîchissement des données utilisateur:', error);
    }
  }, []);

  /**
   * Effacer l'erreur
   */
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = useCallback((role: string): boolean => {
    return state.user?.role === role;
  }, [state.user]);

  /**
   * Vérifier si l'utilisateur a l'un des rôles spécifiés
   */
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  }, [state.user]);

  return {
    // État
    ...state,
    // Actions
    login,
    register,
    logout,
    refreshUser,
    clearError,
    hasRole,
    hasAnyRole,
  };
};

export default useAuth;
