import { apiClient, ApiResponse } from '../client';

// Types pour l'authentification
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'pharmacien' | 'vendeur' | 'caissier';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_at: string;
}

/**
 * Service d'authentification
 */
export class AuthService {
  /**
   * Connexion utilisateur
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Sauvegarder le token automatiquement
    if (response.success && response.data.token) {
      apiClient.setAuthToken(response.data.token, credentials.remember || false);
    }
    
    return response;
  }

  /**
   * Inscription utilisateur
   */
  static async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/register', userData);
    
    // Sauvegarder le token automatiquement
    if (response.success && response.data.token) {
      apiClient.setAuthToken(response.data.token, false);
    }
    
    return response;
  }

  /**
   * Déconnexion utilisateur
   */
  static async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<null>('/auth/logout');
      return response;
    } finally {
      // Supprimer le token même si la requête échoue
      apiClient.clearAuthToken();
    }
  }

  /**
   * Récupérer les informations utilisateur actuel
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return await apiClient.get<User>('/auth/user');
  }

  /**
   * Récupérer les rôles disponibles
   */
  static async getRoles(): Promise<ApiResponse<Array<{id: number, name: string, display_name: string}>>> {
    return await apiClient.get('/auth/roles');
  }

  /**
   * Mettre à jour le rôle d'un utilisateur (Admin seulement)
   */
  static async updateUserRole(userId: number, role: string): Promise<ApiResponse<User>> {
    return await apiClient.put(`/auth/users/${userId}/role`, { role });
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  static async hasRole(role: string): Promise<boolean> {
    try {
      const userResponse = await this.getCurrentUser();
      return userResponse.success && userResponse.data.role === role;
    } catch {
      return false;
    }
  }

  /**
   * Vérifier si l'utilisateur a l'un des rôles spécifiés
   */
  static async hasAnyRole(roles: string[]): Promise<boolean> {
    try {
      const userResponse = await this.getCurrentUser();
      return userResponse.success && roles.includes(userResponse.data.role);
    } catch {
      return false;
    }
  }
}

export default AuthService;
