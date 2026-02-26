// src/lib/api/subscriptions.service.ts
import { apiClient } from './config';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  maxUsers: number;
  maxProducts: number;
  maxStorage: number;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  canceledAt?: string;
  paymentMethod?: string;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  method: string;
  invoiceUrl?: string;
}

class SubscriptionsService {
  async getCurrent(): Promise<{ success: boolean; data: Subscription | null }> {
    try {
      const response = await apiClient.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return { success: false, data: null };
    }
  }

  async getHistory(): Promise<{ success: boolean; data: PaymentHistory[] }> {
    try {
      const response = await apiClient.get('/subscriptions/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return { success: false, data: [] };
    }
  }

  async getPlans(): Promise<{ success: boolean; data: SubscriptionPlan[] }> {
    try {
      const response = await apiClient.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return { success: false, data: [] };
    }
  }

  async update(planId: string): Promise<{ success: boolean; data?: Subscription }> {
    try {
      const response = await apiClient.put('/subscriptions', { planId });
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false };
    }
  }

  async cancel(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.post('/subscriptions/cancel');
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false };
    }
  }

  async renew(): Promise<{ success: boolean; data?: Subscription }> {
    try {
      const response = await apiClient.post('/subscriptions/renew');
      return response.data;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      return { success: false };
    }
  }
}

export const subscriptionsService = new SubscriptionsService();