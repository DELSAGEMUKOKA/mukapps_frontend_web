import { apiClient } from './config';

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
}

export const companiesService = {
  async getInfo(): Promise<{ success: boolean; data: Company }> {
    const response = await apiClient.get('/companies');
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get('/companies/stats');
    return response.data;
  },

  async getSettings(): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get('/companies/settings');
    return response.data;
  },

  async getActivity(): Promise<{ success: boolean; data: any[] }> {
    const response = await apiClient.get('/companies/activity');
    return response.data;
  },

  async update(data: UpdateCompanyData): Promise<{ success: boolean; data: Company }> {
    const response = await apiClient.put('/companies', data);
    return response.data;
  },
};
