// src/lib/api/reports.service.ts
import { apiClient } from './config';

export interface SalesReport {
  period: string;
  total: number;
  count: number;
  average: number;
  data: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  quantity: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  sales: number;
  percentage: number;
  color?: string;
}

export interface DashboardStats {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
    growth: number;
  };
  products: {
    total: number;
    newThisMonth: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    loyal: number;
    active: number;
  };
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: number;
    date: string;
    customerName: string;
    status: string;
  }>;
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
  recentActivities: Array<{
    id: string;
    type: 'sale' | 'customer' | 'product' | 'stock';
    description: string;
    timestamp: string;
    userId?: string;
  }>;
}

export interface ProfitReport {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  byPeriod: Array<{
    period: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

export interface CustomerReport {
  total: number;
  new: number;
  loyal: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    purchaseCount: number;
    lastPurchase: string;
  }>;
}

export interface ExpensesReport {
  total: number;
  count: number;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  data: Array<{
    date: string;
    amount: number;
    category: string;
    title: string;
  }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    value: number;
  }>;
}

class ReportsService {
  /**
   * Récupère les statistiques pour le tableau de bord
   * @param period - Période (today, week, month, year)
   */
  async getDashboardStats(period: string = 'month'): Promise<{ success: boolean; data: DashboardStats }> {
    try {
      const response = await apiClient.get('/reports/dashboard', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Récupère le rapport des ventes
   * @param params - Paramètres de filtre (startDate, endDate, period)
   */
  async getSalesReport(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<{ success: boolean; data: SalesReport }> {
    try {
      const response = await apiClient.get('/reports/sales', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  }

  /**
   * Récupère les produits les plus vendus
   * @param limit - Nombre de produits à récupérer
   * @param period - Période
   */
  async getTopProducts(limit: number = 5, period?: string): Promise<{ success: boolean; data: TopProduct[] }> {
    try {
      const response = await apiClient.get('/reports/top-products', { params: { limit, period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  /**
   * Récupère la répartition des ventes par catégorie
   * @param period - Période
   */
  async getSalesByCategory(period?: string): Promise<{ success: boolean; data: CategorySales[] }> {
    try {
      const response = await apiClient.get('/reports/sales-by-category', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw error;
    }
  }

  /**
   * Récupère le rapport des profits
   * @param params - Paramètres de filtre
   */
  async getProfitReport(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<{ success: boolean; data: ProfitReport }> {
    try {
      const response = await apiClient.get('/reports/profit', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching profit report:', error);
      throw error;
    }
  }

  /**
   * Récupère le rapport des dépenses
   * @param params - Paramètres de filtre
   */
  async getExpensesReport(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
    category?: string;
  }): Promise<{ success: boolean; data: ExpensesReport }> {
    try {
      const response = await apiClient.get('/reports/expenses', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses report:', error);
      throw error;
    }
  }

  /**
   * Récupère le rapport des clients
   * @param params - Paramètres de filtre
   */
  async getCustomersReport(params?: {
    period?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: CustomerReport }> {
    try {
      const response = await apiClient.get('/reports/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers report:', error);
      throw error;
    }
  }

  /**
   * Récupère le rapport d'inventaire
   */
  async getInventoryReport(): Promise<{ success: boolean; data: InventoryReport }> {
    try {
      const response = await apiClient.get('/reports/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  }

  /**
   * Récupère les activités récentes
   * @param limit - Nombre d'activités à récupérer
   */
  async getRecentActivities(limit: number = 10): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await apiClient.get('/reports/recent-activities', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  /**
   * Exporte un rapport au format CSV
   * @param reportType - Type de rapport (sales, profit, expenses, inventory, customers)
   * @param params - Paramètres du rapport
   */
  async exportReportCSV(reportType: string, params?: any): Promise<Blob> {
    try {
      const response = await apiClient.get(`/reports/export/${reportType}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  /**
   * Exporte un rapport au format PDF
   * @param reportType - Type de rapport (sales, profit, expenses, inventory, customers)
   * @param params - Paramètres du rapport
   */
  async exportReportPDF(reportType: string, params?: any): Promise<Blob> {
    try {
      const response = await apiClient.get(`/reports/export/${reportType}/pdf`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  /**
   * Récupère les produits en stock faible
   */
  async getLowStockProducts(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await apiClient.get('/stock/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  /**
   * Récupère les produits en rupture de stock
   */
  async getOutOfStockProducts(): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await apiClient.get('/stock/out-of-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      throw error;
    }
  }

  /**
   * Récupère la valorisation du stock
   */
  async getStockValuation(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.get('/stock/valuation');
      return response.data;
    } catch (error) {
      console.error('Error fetching stock valuation:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des ventes par jour pour le graphique
   * @param days - Nombre de jours
   */
  async getSalesChartData(days: number = 30): Promise<{ success: boolean; data: Array<{ date: string; total: number }> }> {
    try {
      const response = await apiClient.get('/reports/sales-chart', { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques rapides pour l'en-tête du dashboard
   */
  async getQuickStats(): Promise<{ 
    success: boolean; 
    data: {
      todayRevenue: number;
      yesterdayRevenue: number;
      growth: number;
      totalProducts: number;
      totalCustomers: number;
      lowStockCount: number;
    }
  }> {
    try {
      const response = await apiClient.get('/reports/quick-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();