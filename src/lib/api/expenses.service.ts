// src/lib/api/expenses.service.ts
import { apiClient } from './config';

export interface Expense {
  id: string;
  amount: number;
  title: string;
  category: string;
  description?: string;
  date: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  amount: number;
  title: string;
  category: string;
  description?: string;
  date: string;
  paymentMethod: string;
  receiptUrl?: string;
}

class ExpensesService {
  async getAll(params?: any): Promise<{ success: boolean; data: Expense[] }> {
    try {
      const response = await apiClient.get('/expenses', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<{ success: boolean; data: Expense | null }> {
    try {
      const response = await apiClient.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  async create(data: CreateExpenseData): Promise<{ success: boolean; data?: Expense }> {
    try {
      const response = await apiClient.post('/expenses', data);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateExpenseData>): Promise<{ success: boolean; data?: Expense }> {
    try {
      const response = await apiClient.put(`/expenses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async approve(id: string): Promise<{ success: boolean; data?: Expense }> {
    try {
      const response = await apiClient.put(`/expenses/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving expense:', error);
      throw error;
    }
  }

  async reject(id: string): Promise<{ success: boolean; data?: Expense }> {
    try {
      const response = await apiClient.put(`/expenses/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }
  }

  // ✅ AJOUT: Méthode getCategories
  async getCategories(): Promise<{ success: boolean; data: string[] }> {
    try {
      const response = await apiClient.get('/expenses/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      // Retourner des catégories par défaut en cas d'erreur
      return { 
        success: false, 
        data: ['Achat', 'Transport', 'Fourniture', 'Salaire', 'Autre'] 
      };
    }
  }
}

export const expensesService = new ExpensesService();