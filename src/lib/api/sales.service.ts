import { apiClient } from './config';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  costPrice: number;
  profit: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile_money';
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  notes?: string;
  saleDate: string;
  createdBy?: string;
  createdAt: string;
  totalProfit: number;
  items?: SaleItem[];
}

export interface CreateSaleData {
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile_money';
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  notes?: string;
}

export const salesService = {
  async getAll(): Promise<{ success: boolean; data: Sale[] }> {
    const response = await apiClient.get('/sales');
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Sale }> {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },

  async getByCustomer(customerId: string): Promise<{ success: boolean; data: Sale[] }> {
    const response = await apiClient.get(`/sales/customer/${customerId}`);
    return response.data;
  },

  async create(data: CreateSaleData): Promise<{ success: boolean; data: Sale }> {
    const response = await apiClient.post('/sales', data);
    return response.data;
  },

  async cancel(id: string): Promise<{ success: boolean; data: Sale }> {
    const response = await apiClient.put(`/sales/${id}/cancel`);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/sales/${id}`);
    return response.data;
  },
};
