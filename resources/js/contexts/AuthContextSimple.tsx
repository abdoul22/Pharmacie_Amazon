import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Types d'authentification
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'pharmacien' | 'vendeur' | 'caissier';
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  setUser: (user: User | null) => void;
}

export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Context d'authentification simplifié
 */
const AuthContextSimple = createContext<UseAuthReturn | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider d'authentification simplifié
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
  const initializeAuth = async () => {
    try {
      // Vérifier si un token existe
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      console.log('AuthContext - Initialize:', { token: token ? 'exists' : 'none' });
      
      if (token) {
        // Nettoyer les anciens tokens test
        if (token.startsWith('test-token-')) {
          console.log('Suppression ancien token test');
          localStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_token');
          
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }));
          return;
        }
        
        // Valider le token avec l'API Laravel
        try {
          console.log('AuthContext - Validating token:', token.substring(0, 20) + '...');
          const response = await fetch('/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            const user = result.data?.user ?? result.data;


            setState(prev => ({
              ...prev,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                email_verified_at: user.email_verified_at,
              },
              isAuthenticated: true,
              isLoading: false,
            }));
          } else {
            // Token invalide, supprimer et déconnecter
            console.log('AuthContext - Token invalid, logging out');
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
            
            setState(prev => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error('Erreur validation token:', error);
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
      console.error('Erreur lors de l\'initialisation auth:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Erreur lors de l\'initialisation de l\'authentification',
      }));
    }
  };

  /**
   * Connexion
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Appel à l'API Laravel pour la connexion
      console.log('Login attempt:', credentials);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember || false,
        }),
      });

      const result = await response.json();
      console.log('AuthContext - Login response:', result);

      if (response.ok && result.success) {
        const { user, token } = result.data;
        console.log('AuthContext - User data:', user);
        console.log('AuthContext - Token received:', token ? 'yes' : 'no');

        // Sauvegarder le token réel de Sanctum
        console.log('AuthContext - Storing token:', token.substring(0, 20) + '...');
        if (credentials.remember) {
          localStorage.setItem('auth_token', token);
          console.log('AuthContext - Token stored in localStorage');
        } else {
          sessionStorage.setItem('auth_token', token);
          console.log('AuthContext - Token stored in sessionStorage');
        }

        setState(prev => ({
          ...prev,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            email_verified_at: user.email_verified_at,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));

        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Identifiants incorrects',
          isLoading: false,
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Erreur de connexion';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      // Appeler l'API de déconnexion si un token existe
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Erreur lors de l\'appel API de déconnexion:', error);
        }
      }
      
      // Nettoyer tous les tokens et données sensibles
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      // Nettoyer les données sensibles supplémentaires
      localStorage.removeItem('user_preferences');
      sessionStorage.removeItem('cart_data');
      sessionStorage.removeItem('temp_sale_data');
      sessionStorage.removeItem('session_last_activity');

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      console.info('🔓 Déconnexion réussie - Données nettoyées');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, nettoyer les données locales
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('user_preferences');
      sessionStorage.removeItem('cart_data');
      sessionStorage.removeItem('temp_sale_data');
      sessionStorage.removeItem('session_last_activity');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  /**
   * Effacer l'erreur
   */
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  /**
   * Vérifier si l'utilisateur a l'un des rôles spécifiés
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  /**
   * Définir l'utilisateur directement (pour les tests)
   */
  const setUser = (user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  };

  const value: UseAuthReturn = {
    // État
    ...state,
    // Actions
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    setUser,
  };

  return (
    <AuthContextSimple.Provider value={value}>
      {children}
    </AuthContextSimple.Provider>
  );
};

/**
 * Hook pour utiliser le context d'authentification
 */
export const useAuthContext = (): UseAuthReturn => {
  const context = useContext(AuthContextSimple);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContextSimple;
