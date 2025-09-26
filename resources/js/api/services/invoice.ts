import { apiClient } from '../client';

// Types pour les factures
export interface InvoiceItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
}

export interface CreateInvoiceRequest {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  payment_method: string;
  payment_details?: Record<string, any>;
  notes?: string;
  items: InvoiceItem[];
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  invoice_time: string;
  status: string;
  type: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal_ht: number;
  tva_rate: number;
  tva_amount: number;
  total_ttc: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  paid_amount: number;
  due_amount: number;
  notes?: string;
  user: {
    id: number;
    name: string;
  };
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    net_amount: number;
    batch_number?: string;
    expiry_date?: string;
    requires_prescription: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: {
    data: Invoice[];
    current_page: number;
    total: number;
    per_page: number;
  };
  stats: {
    total_invoices: number;
    today_invoices: number;
    today_revenue: number;
    pending_amount: number;
  };
}

export interface InvoiceStatsResponse {
  success: boolean;
  message: string;
  data: {
    period: {
      from: string;
      to: string;
    };
    totals: {
      invoices: number;
      revenue: number;
      items_sold: number;
    };
    by_payment_method: Array<{
      payment_method: string;
      count: number;
      total: number;
    }>;
    top_products: Array<{
      product_name: string;
      total_quantity: number;
      total_revenue: number;
    }>;
  };
}

/**
 * Service API pour la gestion des factures
 */
export class InvoiceService {
  
  /**
   * Créer une nouvelle facture
   */
  static async createInvoice(data: CreateInvoiceRequest): Promise<{ invoice: Invoice; pdf_url: string }> {
    const response = await apiClient.post<{ invoice: Invoice; pdf_url: string }>('/pharmacy/invoices', data);
    return response.data;
  }

  /**
   * Lister les factures avec filtres et pagination
   */
  static async getInvoices(params?: {
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
    status?: string;
    payment_method?: string;
    customer_phone?: string;
  }): Promise<InvoiceListResponse> {
    const response = await apiClient.get<InvoiceListResponse['data']>('/pharmacy/invoices', { params });
    return {
      success: response.success,
      message: response.message,
      data: response.data,
      stats: (response as any).stats
    };
  }

  /**
   * Récupérer une facture par son ID
   */
  static async getInvoice(id: number): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/pharmacy/invoices/${id}`);
    return response.data;
  }

  /**
   * Télécharger une facture en PDF
   */
  static getPDFUrl(id: number): string {
    return `${apiClient.getBaseURL()}/pharmacy/invoices/${id}/pdf`;
  }

  /**
   * Obtenir les statistiques de ventes
   */
  static async getStats(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<InvoiceStatsResponse> {
    const response = await apiClient.get<InvoiceStatsResponse['data']>('/pharmacy/invoices/stats', { params });
    return {
      success: true,
      message: 'Statistiques récupérées',
      data: response.data
    };
  }
}

export default InvoiceService;
