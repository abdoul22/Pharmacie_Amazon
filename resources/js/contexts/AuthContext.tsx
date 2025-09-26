import React, { createContext, useContext, ReactNode } from 'react';
import { UseAuthReturn, useAuth } from '../hooks/useAuth';

/**
 * Context d'authentification pour partager l'état dans toute l'app
 */
const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider d'authentification
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour utiliser le context d'authentification
 */
export const useAuthContext = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
