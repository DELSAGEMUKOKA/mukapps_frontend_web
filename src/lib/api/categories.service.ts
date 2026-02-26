import { apiClient } from './config';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
}

export const categoriesService = {
  async getAll(): Promise<{ success: boolean; data: Category[] }> {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Category }> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryData): Promise<{ success: boolean; data: Category }> {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCategoryData>): Promise<{ success: boolean; data: Category }> {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
