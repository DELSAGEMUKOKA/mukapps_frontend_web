import { apiClient } from './config';

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId?: string;
  customerName?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  customerId?: string;
  customerName?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'cancelled';
  notes?: string;
}

export const invoicesService = {
  async getAll(): Promise<{ success: boolean; data: Invoice[] }> {
    const response = await apiClient.get('/invoices');
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Invoice }> {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  async getByCustomer(customerId: string): Promise<{ success: boolean; data: Invoice[] }> {
    const response = await apiClient.get(`/invoices/customer/${customerId}`);
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get('/invoices/stats');
    return response.data;
  },

  async create(data: CreateInvoiceData): Promise<{ success: boolean; data: Invoice }> {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateInvoiceData>): Promise<{ success: boolean; data: Invoice }> {
    const response = await apiClient.put(`/invoices/${id}`, data);
    return response.data;
  },

  async cancel(id: string): Promise<{ success: boolean; data: Invoice }> {
    const response = await apiClient.put(`/invoices/${id}/cancel`);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response.data;
  },
};
