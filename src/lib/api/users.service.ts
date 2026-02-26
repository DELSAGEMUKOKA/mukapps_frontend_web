// src/lib/api/users.service.ts
import { apiClient } from './config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator' | 'cashier';
  phone?: string;
  is_active: boolean;
  email_verified: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'supervisor' | 'operator' | 'cashier';
  phone?: string;
}

class UsersService {
  async getAll(params?: any): Promise<{ success: boolean; data: User[] }> {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, data: [] };
    }
  }

  async getById(id: string): Promise<{ success: boolean; data: User | null }> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, data: null };
    }
  }

  async create(data: CreateUserData): Promise<{ success: boolean; data?: User }> {
    try {
      const response = await apiClient.post('/users', data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false };
    }
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<{ success: boolean; data?: User }> {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false };
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false };
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; data: User | null }> {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return { success: false, data: null };
    }
  }
}

export const usersService = new UsersService();