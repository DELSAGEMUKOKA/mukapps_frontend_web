// src/lib/api/customers.service.ts
import { apiClient } from './config';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  type: 'individual' | 'business';
  taxId?: string;
  tax_id?: string;
  isVip: boolean;
  is_vip?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  type: 'individual' | 'business';
  taxId?: string;
  isVip?: boolean;
}

interface CustomerStats {
  totalRevenue: number;
  totalInvoices: number;
  averageOrderValue: number;
}

interface SaleItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Sale {
  id: string;
  invoice_number: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  sale_date: string;
  sale_items: SaleItem[];
}

class CustomersService {
  async getAll(): Promise<{ success: boolean; data: Customer[] }> {
    try {
      const response = await apiClient.get('/customers');
      
      if (response.data.success) {
        // Adapter la réponse de l'API au format attendu
        const customers = response.data.data || [];
        return { 
          success: true, 
          data: customers 
        };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      return { success: false, data: [] };
    }
  }

  async getById(id: string): Promise<{ success: boolean; data: Customer | null }> {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      }
      
      return { success: false, data: null };
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      return { success: false, data: null };
    }
  }

  async getVipCustomers(): Promise<{ success: boolean; data: Customer[] }> {
    try {
      const response = await apiClient.get('/customers', { 
        params: { isVip: true } 
      });
      
      if (response.data.success) {
        // Filtrer les clients VIP côté client si le backend ne le fait pas
        const customers = response.data.data || [];
        const vipCustomers = customers.filter((c: Customer) => c.isVip || c.is_vip);
        return { success: true, data: vipCustomers };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('Error fetching VIP customers:', error);
      return { success: false, data: [] };
    }
  }

  async getStats(id: string): Promise<{ success: boolean; data: CustomerStats | null }> {
    try {
      const response = await apiClient.get(`/customers/${id}/stats`);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      }
      
      return { success: false, data: null };
    } catch (error: any) {
      console.error('Error fetching customer stats:', error);
      return { success: false, data: null };
    }
  }

  async getPurchaseHistory(id: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await apiClient.get(`/customers/${id}/invoices`);
      
      if (response.data.success) {
        // Adapter les factures au format attendu
        const invoices = response.data.data || [];
        
        // Transformer les factures en format similaire à l'ancien système
        const purchaseHistory = invoices.map((invoice: any) => ({
          id: invoice.id,
          invoice_number: invoice.invoiceNumber,
          total_amount: invoice.total,
          payment_method: invoice.paymentMethod,
          payment_status: invoice.status,
          sale_date: invoice.date,
          sale_items: invoice.items || []
        }));
        
        return { success: true, data: purchaseHistory };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('Error fetching purchase history:', error);
      return { success: false, data: [] };
    }
  }

  async create(customerData: CreateCustomerData): Promise<{ success: boolean; data?: Customer }> {
    try {
      // Préparer les données pour l'API
      const payload = {
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        city: customerData.city || null,
        type: customerData.type,
        taxId: customerData.taxId || null,
        isVip: customerData.isVip || false,
      };

      const response = await apiClient.post('/customers', payload);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error('Error creating customer:', error);
      return { success: false };
    }
  }

  async update(
    id: string,
    customerData: Partial<CreateCustomerData>
  ): Promise<{ success: boolean; data?: Customer }> {
    try {
      // Préparer les données pour l'API
      const payload: any = {};
      
      if (customerData.name !== undefined) payload.name = customerData.name;
      if (customerData.email !== undefined) payload.email = customerData.email || null;
      if (customerData.phone !== undefined) payload.phone = customerData.phone || null;
      if (customerData.address !== undefined) payload.address = customerData.address || null;
      if (customerData.city !== undefined) payload.city = customerData.city || null;
      if (customerData.type !== undefined) payload.type = customerData.type;
      if (customerData.taxId !== undefined) payload.taxId = customerData.taxId || null;
      if (customerData.isVip !== undefined) payload.isVip = customerData.isVip;

      const response = await apiClient.put(`/customers/${id}`, payload);
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error('Error updating customer:', error);
      return { success: false };
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/customers/${id}`);
      
      if (response.data.success) {
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      return { success: false };
    }
  }

  // Méthodes supplémentaires utiles
  async search(query: string): Promise<{ success: boolean; data: Customer[] }> {
    try {
      const response = await apiClient.get('/customers', { 
        params: { search: query } 
      });
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('Error searching customers:', error);
      return { success: false, data: [] };
    }
  }

  async getRecent(limit: number = 10): Promise<{ success: boolean; data: Customer[] }> {
    try {
      const response = await apiClient.get('/customers', { 
        params: { limit, sort: 'created_at', order: 'desc' }
      });
      
      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data 
        };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('Error fetching recent customers:', error);
      return { success: false, data: [] };
    }
  }
}

export const customersService = new CustomersService();