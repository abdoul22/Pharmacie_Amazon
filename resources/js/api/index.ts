// Client API principal
export { default as apiClient } from './client';
export type { ApiResponse, ApiError } from './client';

// Services
export { AuthService } from './services/auth';
export { default as PharmacyService, InsuranceService } from './services/pharmacy';

// Types d'authentification
export type {
  User,
  LoginCredentials,
  RegisterData,
  LoginResponse,
} from './services/auth';

// Types de pharmacie
export type {
  PaymentMethod,
  PaymentMethodsResponse,
  DashboardData,
  QuickStats,
  Insurance,
  InsuranceListParams,
  CreateInsuranceData,
  ReimbursementCalculation,
} from './services/pharmacy';

// Hooks
export { useAuth } from '../hooks/useAuth';
export { useApi, usePaginatedApi } from '../hooks/useApi';

// Types des hooks
export type { UseAuthReturn } from '../hooks/useAuth';
export type { UseApiReturn, UsePaginatedApiReturn, PaginatedData } from '../hooks/useApi';
