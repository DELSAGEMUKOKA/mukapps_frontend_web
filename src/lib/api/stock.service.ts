// src/lib/api/stock.service.ts
import { apiClient } from './config';

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  type: 'in' | 'out' | 'adjustment';  // ✅ AJOUTÉ: 'adjustment'
  quantity: number;
  previousStock: number;
  currentStock: number;
  reason: string;
  reference?: string;
  notes?: string;
  date: string;
  userId: string;
  companyId: string;
  created_at?: string;  // ✅ AJOUTÉ: Pour compatibilité
}

export interface CreateStockMovementData {  // ✅ AJOUTÉ: Interface pour création
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
}

export interface AdjustStockData {
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  notes?: string;
}

class StockService {
  async getAllMovements(params?: any): Promise<{ success: boolean; data: StockMovement[] }> {
    try {
      const response = await apiClient.get('/stock/movements', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      return { success: false, data: [] };
    }
  }

  async getMovementById(id: string): Promise<{ success: boolean; data: StockMovement | null }> {
    try {
      const response = await apiClient.get(`/stock/movements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock movement:', error);
      return { success: false, data: null };
    }
  }

  // ✅ NOUVELLE MÉTHODE: Créer un mouvement
  async createMovement(data: CreateStockMovementData): Promise<{ success: boolean; data?: StockMovement }> {
    try {
      const response = await apiClient.post('/stock/movements', data);
      return response.data;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      return { success: false };
    }
  }

  // ✅ NOUVELLE MÉTHODE: Ajuster le stock (méthode spécifique)
  async adjustStock(productId: string, newQuantity: number, reason: string): Promise<{ success: boolean; data?: StockMovement }> {
    try {
      const response = await apiClient.post('/stock/adjust', {
        productId,
        quantity: newQuantity,
        reason,
        type: 'adjustment'
      });
      return response.data;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return { success: false };
    }
  }

  // Méthode adjust existante (pour compatibilité)
  async adjust(data: AdjustStockData): Promise<{ success: boolean; data?: StockMovement }> {
    try {
      const response = await apiClient.post('/stock/adjust', data);
      return response.data;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return { success: false };
    }
  }

  async getLowStock(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await apiClient.get('/stock/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return { success: false, data: [] };
    }
  }

  async getOutOfStock(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await apiClient.get('/stock/out-of-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      return { success: false, data: [] };
    }
  }

  async getValuation(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get('/stock/valuation');
      return response.data;
    } catch (error) {
      console.error('Error fetching stock valuation:', error);
      return { success: false, data: null };
    }
  }
}

export const stockService = new StockService();