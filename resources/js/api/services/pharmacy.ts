import { apiClient, ApiResponse } from '../client';

// Types pour la pharmacie
export interface PaymentMethod {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  color: string;
  category: 'physical' | 'mobile_money' | 'banking' | 'digital_wallet';
  description: string;
  is_digital: boolean;
  requires_phone: boolean;
  processing_fee: number;
  currency: string;
  enabled: boolean;
  instant: boolean;
  phone_format?: string;
  account_format?: string;
}

export interface PaymentMethodsResponse {
  methods: PaymentMethod[];
  stats: {
    total_methods: number;
    digital_methods: number;
    instant_methods: number;
    mobile_methods: number;
  };
  currency: string;
  currency_symbol: string;
  split_payments_enabled: boolean;
  max_split_methods: number;
}

export interface DashboardData {
  overview: {
    total_products: number;
    total_categories: number;
    total_suppliers: number;
    stock_value: {
      amount: number;
      formatted: string;
    };
  };
  alerts: {
    low_stock: number;
    near_expiry: number;
    out_of_stock: number;
  };
  recent_movements: Array<{
    id: number;
    product_name: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    user_name: string;
    created_at: string;
    reference: string;
  }>;
  top_products: Array<{
    product_name: string;
    total_sold: number;
    current_stock: number;
  }>;
  sales_stats: Array<{
    date: string;
    transactions: number;
    items_sold: number;
  }>;
  quick_actions: Array<{
    id: string;
    label: string;
    icon: string;
    route: string;
    color: string;
  }>;
  currency: string;
  last_updated: string;
}

export interface QuickStats {
  products_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_value: number;
  recent_movements_count: number;
}

/**
 * Service pour la gestion de la pharmacie
 */
export class PharmacyService {
  /**
   * Récupérer le dashboard principal
   */
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return await apiClient.get<DashboardData>('/pharmacy/dashboard');
  }

  /**
   * Récupérer les statistiques rapides
   */
  static async getQuickStats(): Promise<ApiResponse<QuickStats>> {
    return await apiClient.get<QuickStats>('/pharmacy/quick-stats');
  }

  /**
   * Récupérer les modes de paiement disponibles
   */
  static async getPaymentMethods(): Promise<ApiResponse<PaymentMethodsResponse>> {
    return await apiClient.get<PaymentMethodsResponse>('/pharmacy/payments/methods');
  }
}

/**
 * Service pour la gestion des assurances
 */
export interface Insurance {
  id: number;
  name: string;
  name_ar?: string;
  code: string;
  description?: string;
  reimbursement_percentage: number;
  processing_days: number;
  requires_preauthorization: boolean;
  preauth_threshold?: number;
  type: 'public' | 'private' | 'mutual';
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceListParams {
  active?: boolean;
  type?: 'public' | 'private' | 'mutual';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  all?: boolean;
}

export interface CreateInsuranceData {
  name: string;
  name_ar?: string;
  code: string;
  description?: string;
  reimbursement_percentage: number;
  processing_days: number;
  requires_preauthorization?: boolean;
  preauth_threshold?: number;
  type: 'public' | 'private' | 'mutual';
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  is_active?: boolean;
  notes?: string;
}

export interface ReimbursementCalculation {
  insurance: {
    name: string;
    code: string;
    reimbursement_percentage: number;
  };
  original_amount: number;
  reimbursement_amount: number;
  patient_amount: number;
  needs_preauthorization: boolean;
  processing_days: number;
  currency: string;
}

export class InsuranceService {
  /**
   * Lister les assurances
   */
  static async getInsurances(params?: InsuranceListParams): Promise<ApiResponse<Insurance[]>> {
    return await apiClient.get('/pharmacy/insurances', { params });
  }

  /**
   * Créer une nouvelle assurance
   */
  static async createInsurance(data: CreateInsuranceData): Promise<ApiResponse<Insurance>> {
    return await apiClient.post('/pharmacy/insurances', data);
  }

  /**
   * Récupérer une assurance spécifique
   */
  static async getInsurance(id: number): Promise<ApiResponse<Insurance>> {
    return await apiClient.get(`/pharmacy/insurances/${id}`);
  }

  /**
   * Mettre à jour une assurance
   */
  static async updateInsurance(id: number, data: Partial<CreateInsuranceData>): Promise<ApiResponse<Insurance>> {
    return await apiClient.put(`/pharmacy/insurances/${id}`, data);
  }

  /**
   * Supprimer une assurance
   */
  static async deleteInsurance(id: number): Promise<ApiResponse<null>> {
    return await apiClient.delete(`/pharmacy/insurances/${id}`);
  }

  /**
   * Activer/désactiver une assurance
   */
  static async toggleInsuranceStatus(id: number): Promise<ApiResponse<{id: number, name: string, is_active: boolean}>> {
    return await apiClient.patch(`/pharmacy/insurances/${id}/toggle-status`);
  }

  /**
   * Calculer un remboursement
   */
  static async calculateReimbursement(id: number, amount: number): Promise<ApiResponse<ReimbursementCalculation>> {
    return await apiClient.post(`/pharmacy/insurances/${id}/calculate-reimbursement`, { amount });
  }
}

export default PharmacyService;
