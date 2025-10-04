import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types pour l'API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    user_role?: string;
    timestamp?: string;
    pagination?: {
      current_page: number;
      total: number;
      per_page: number;
    };
  };
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Configuration du client Axios
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string = '/api';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // 15 secondes
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs pour gestion automatique auth + erreurs
   */
  private setupInterceptors(): void {
    // Intercepteur de requête - Ajouter le token automatiquement
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Envoyer le dernier timestamp d'activité côté client
        try {
          const lastActivity = localStorage.getItem('last_activity') || sessionStorage.getItem('last_activity');
          const nowIso = new Date().toISOString();
          config.headers['X-Last-Activity'] = lastActivity || nowIso;
          // Mettre à jour côté client
          localStorage.setItem('last_activity', nowIso);
        } catch {}

        // Log des requêtes en développement
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse - Gestion automatique des erreurs
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log des réponses en développement
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.status}`, response.data);
        }

        return response;
      },
      (error) => {
        console.error('❌ Response Interceptor Error:', error);

        // Timeout réseau (ECONNABORTED)
        if (error.code === 'ECONNABORTED') {
          console.warn('⚠️ API Timeout - redirection si route protégée');
        }

        // Gestion des erreurs d'authentification
        if (error.response?.status === 401) {
          const code = error.response?.data?.error_code;
          if (code === 'SESSION_TIMEOUT') {
            console.warn('⏰ Session expirée - nettoyage token et redirection');
            this.handleAuthenticationError();
          } else {
            console.warn('⚠️ API Authentication Error - Token may be invalid');
          }
        }

        // Gestion des erreurs de validation
        if (error.response?.status === 422) {
          console.warn('⚠️ Validation Error:', error.response.data.errors);
        }

        // Gestion des erreurs serveur
        if (error.response?.status >= 500) {
          console.error('🔥 Server Error:', error.response.data.message);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupérer le token d'authentification
   */
  private getAuthToken(): string | null {
    // Priorité: localStorage, puis sessionStorage, puis cookies
    return (
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      this.getCookie('auth_token')
    );
  }

  /**
   * Sauvegarder le token d'authentification
   */
  public setAuthToken(token: string, remember: boolean = true): void {
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }

  /**
   * Supprimer le token d'authentification
   */
  public clearAuthToken(): void {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    this.deleteCookie('auth_token');
  }

  /**
   * Gestion automatique des erreurs d'authentification
   */
  private handleAuthenticationError(): void {
    this.clearAuthToken();

    // Rediriger vers la page de connexion correcte
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  /**
   * Utilitaires pour cookies
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private deleteCookie(name: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }

  /**
   * Méthodes HTTP principales
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Méthodes utilitaires
   */
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  public getBaseURL(): string {
    return this.baseURL;
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient();
export default apiClient;
