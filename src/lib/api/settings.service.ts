import { apiClient } from './config';

export interface Settings {
  currency?: string;
  dateFormat?: string;
  invoicePrefix?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  rccm?: string;
  invoiceFooter?: string;
}

export const settingsService = {
  async get(): Promise<{ success: boolean; data: Settings }> {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  async update(data: Settings): Promise<{ success: boolean; data: Settings }> {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },
};
