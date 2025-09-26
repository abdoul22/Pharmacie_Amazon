import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '../api/client';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

interface UseApiOptions {
  immediate?: boolean; // Exécuter immédiatement au montage
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  refresh: () => Promise<T | null>;
}

/**
 * Hook générique pour les appels API
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
    isSuccess: false,
  });

  const lastArgsRef = useRef<any[]>([]);
  const mountedRef = useRef(true);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Exécuter l'appel API
   */
  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    lastArgsRef.current = args;
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false,
    }));

    try {
      const response = await apiFunction(...args);
      
      // Vérifier si le composant est toujours monté
      if (!mountedRef.current) return null;

      if (response.success) {
        setState(prev => ({
          ...prev,
          data: response.data,
          isLoading: false,
          error: null,
          isSuccess: true,
        }));

        onSuccess?.(response.data);
        return response.data;
      } else {
        const errorMessage = response.message || 'Erreur lors de la requête';
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          isSuccess: false,
        }));

        onError?.(errorMessage);
        return null;
      }
    } catch (error: any) {
      if (!mountedRef.current) return null;

      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Erreur réseau ou serveur indisponible';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isSuccess: false,
      }));

      onError?.(errorMessage);
      return null;
    }
  }, [apiFunction, onSuccess, onError]);

  /**
   * Réinitialiser l'état
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  /**
   * Rafraîchir avec les derniers arguments
   */
  const refresh = useCallback(async (): Promise<T | null> => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  // Exécution immédiate si demandée
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    refresh,
  };
};

/**
 * Hook spécialisé pour les listes paginées
 */
export interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  initialPerPage?: number;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface UsePaginatedApiReturn<T> extends UseApiState<PaginatedData<T>> {
  execute: (page?: number, perPage?: number, ...args: any[]) => Promise<PaginatedData<T> | null>;
  nextPage: () => Promise<PaginatedData<T> | null>;
  prevPage: () => Promise<PaginatedData<T> | null>;
  goToPage: (page: number) => Promise<PaginatedData<T> | null>;
  reset: () => void;
  refresh: () => Promise<PaginatedData<T> | null>;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const usePaginatedApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<PaginatedData<T>>>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiReturn<T> => {
  const { initialPage = 1, initialPerPage = 15, ...apiOptions } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const lastArgsRef = useRef<any[]>([]);

  const baseApi = useApi(apiFunction, { ...apiOptions, immediate: false });

  const execute = useCallback(async (
    page: number = currentPage,
    itemsPerPage: number = perPage,
    ...args: any[]
  ): Promise<PaginatedData<T> | null> => {
    setCurrentPage(page);
    setPerPage(itemsPerPage);
    lastArgsRef.current = args;
    
    return baseApi.execute(page, itemsPerPage, ...args);
  }, [currentPage, perPage, baseApi]);

  const nextPage = useCallback(async (): Promise<PaginatedData<T> | null> => {
    if (!baseApi.data || currentPage >= baseApi.data.last_page) return null;
    return execute(currentPage + 1, perPage, ...lastArgsRef.current);
  }, [currentPage, perPage, baseApi.data, execute]);

  const prevPage = useCallback(async (): Promise<PaginatedData<T> | null> => {
    if (currentPage <= 1) return null;
    return execute(currentPage - 1, perPage, ...lastArgsRef.current);
  }, [currentPage, perPage, execute]);

  const goToPage = useCallback(async (page: number): Promise<PaginatedData<T> | null> => {
    return execute(page, perPage, ...lastArgsRef.current);
  }, [perPage, execute]);

  const refresh = useCallback(async (): Promise<PaginatedData<T> | null> => {
    return execute(currentPage, perPage, ...lastArgsRef.current);
  }, [currentPage, perPage, execute]);

  // Exécution immédiate si demandée
  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [options.immediate, execute]);

  return {
    ...baseApi,
    execute,
    nextPage,
    prevPage,
    goToPage,
    refresh,
    currentPage,
    totalPages: baseApi.data?.last_page || 0,
    hasNextPage: baseApi.data ? currentPage < baseApi.data.last_page : false,
    hasPrevPage: currentPage > 1,
  };
};

export default useApi;
