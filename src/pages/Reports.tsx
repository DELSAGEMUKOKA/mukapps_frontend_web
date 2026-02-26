// src/pages/Reports.tsx
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Star,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import { reportsService } from '../lib/api/reports.service';
import {
  exportComprehensiveReport,
  exportDetailedSalesReport,
  exportDetailedExpensesReport,
  exportInventoryReport,
  exportCustomersReport,
} from '../utils/reportsExcel';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Interfaces qui correspondent à ce que le service retourne réellement
interface SalesData {
  total: number;
  count: number;
  average: number;
  data: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  byCategory?: Array<{ name: string; value: number }>;
}

interface ProfitData {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface InventoryData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStock?: Array<{ productName: string; stock: number }>;
}

interface CustomersData {
  total: number;
  new: number;
  loyal: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    purchaseCount: number;
  }>;
}

interface ExpensesData {
  total: number;
  count: number;
  byCategory: Array<{ category: string; amount: number; percentage: number }>;
}

interface ProductData {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  quantity: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [profitData, setProfitData] = useState<ProfitData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [customersData, setCustomersData] = useState<CustomersData | null>(null);
  const [expensesData, setExpensesData] = useState<ExpensesData | null>(null);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const period = 'month';
      
      const [sales, profit, inventory, customers, expenses, products] =
        await Promise.all([
          reportsService.getSalesReport({ period }),
          reportsService.getProfitReport({ period }),
          reportsService.getInventoryReport(),
          reportsService.getCustomersReport({ period }),
          reportsService.getExpensesReport({ period }),
          reportsService.getTopProducts(5),
        ]);

      if (sales.success) {
        setSalesData(sales.data);
      }
      
      if (profit.success) {
        setProfitData(profit.data);
      }
      
      if (inventory.success) {
        setInventoryData(inventory.data);
      }
      
      if (customers.success) {
        setCustomersData(customers.data);
      }
      
      if (expenses.success) {
        setExpensesData(expenses.data);
      }
      
      if (products.success) {
        setTopProducts(products.data);
      }
      
      // Générer des données de tendance simulées
      generateMockRevenueTrend();
      
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer des données de tendance simulées
  const generateMockRevenueTrend = () => {
    const mockData: RevenueData[] = [];
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      mockData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 100000) + 50000,
      });
    }
    setRevenueTrend(mockData);
  };

  const handleExportComprehensive = () => {
    exportComprehensiveReport({
      dateRange,
      salesData,
      profitData,
      inventoryData,
      customersData,
      expensesData,
      topProducts,
      revenueTrend,
    });
    setShowExportMenu(false);
  };

  const handleExportSales = () => {
    if (salesData) {
      exportDetailedSalesReport(salesData.data || [], dateRange);
    }
    setShowExportMenu(false);
  };

  const handleExportExpenses = () => {
    if (expensesData) {
      exportDetailedExpensesReport(expensesData.byCategory || [], dateRange);
    }
    setShowExportMenu(false);
  };

  const handleExportInventory = () => {
    if (inventoryData) {
      exportInventoryReport([inventoryData]);
    }
    setShowExportMenu(false);
  };

  const handleExportCustomers = () => {
    if (customersData) {
      exportCustomersReport(customersData.topCustomers || []);
    }
    setShowExportMenu(false);
  };

  // Formateur sécurisé pour le tooltip
  const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return '0 €';
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return num.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des rapports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Analyses</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            disabled={!salesData && !profitData}
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export Excel
            <ChevronDown className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                <button
                  onClick={handleExportComprehensive}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Rapport Complet</div>
                    <div className="text-xs text-gray-600">Toutes les analyses</div>
                  </div>
                </button>

                <button
                  onClick={handleExportSales}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Ventes Détaillées</div>
                    <div className="text-xs text-gray-600">Toutes les transactions</div>
                  </div>
                </button>

                <button
                  onClick={handleExportExpenses}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">Dépenses Détaillées</div>
                    <div className="text-xs text-gray-600">Toutes les dépenses</div>
                  </div>
                </button>

                <button
                  onClick={handleExportInventory}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Package className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Inventaire Complet</div>
                    <div className="text-xs text-gray-600">Tous les produits</div>
                  </div>
                </button>

                <button
                  onClick={handleExportCustomers}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Clients Détaillés</div>
                    <div className="text-xs text-gray-600">Tous les clients</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chiffre d'affaires</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(salesData?.total || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bénéfice</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {(profitData?.profit || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                })}
              </p>
              {profitData?.margin !== undefined && (
                <p className="text-sm text-gray-600 mt-2">
                  Marge: {profitData.margin.toFixed(1)}%
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Produits vendus</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {salesData?.count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {salesData?.data?.length || 0} jour(s)
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Nouveaux clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {customersData?.new || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Total: {customersData?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution du chiffre d'affaires
          </h3>
          {revenueTrend && revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="CA"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 des produits</h3>
          {topProducts && topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.sales || product.quantity || 0} vente(s)
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 ml-4">
                    {(product.revenue || 0).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des ventes</h3>
          {salesData?.byCategory && salesData.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData.byCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    percent !== undefined ? `${name}: ${(percent * 100).toFixed(0)}%` : name
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesData.byCategory.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dépenses par catégorie</h3>
          {expensesData?.byCategory && expensesData.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesData.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#ef4444" name="Montant" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Stock faible</h3>
          </div>
          {inventoryData?.lowStock && inventoryData.lowStock.length > 0 ? (
            <div className="space-y-3">
              {inventoryData.lowStock.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-900">{item.productName}</p>
                  <span className="text-sm font-medium text-red-600">{item.stock} unités</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {inventoryData?.lowStockCount ? `${inventoryData.lowStockCount} produit(s) en stock faible` : 'Aucun produit en stock faible'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Clients VIP</h3>
          </div>
          {customersData?.topCustomers && customersData.topCustomers.length > 0 ? (
            <div className="space-y-3">
              {customersData.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                <div key={customer.id || index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-900">{customer.name}</p>
                  <span className="text-sm font-medium text-gray-600">
                    {(customer.totalSpent || 0).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Aucun client VIP</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Récapitulatif</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Panier moyen</span>
              <span className="text-sm font-medium text-gray-900">
                {(salesData?.average || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total dépenses</span>
              <span className="text-sm font-medium text-red-600">
                {(expensesData?.total || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Stock total</span>
              <span className="text-sm font-medium text-gray-900">
                {inventoryData?.totalProducts || 0} produits
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Valeur du stock</span>
              <span className="text-sm font-medium text-gray-900">
                {(inventoryData?.totalValue || 0).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};