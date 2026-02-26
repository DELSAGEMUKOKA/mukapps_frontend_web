// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  // TrendingDown, // ❌ Supprimé car non utilisé
  ShoppingBag,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { reportsService } from '../lib/api/reports.service';

// Interface qui correspond exactement à la réponse du backend
interface DashboardData {
  sales: {
    today: number;
    week: number;
    month: number;
  };
  counts: {
    products: number;
    customers: number;
    lowStock: number;
    outOfStock: number;
    pendingExpenses: number;
  };
  financials: {
    pendingExpensesTotal: number;
  };
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    total: string;
    status: string;
    date: string;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reportsService.getDashboardStats(period);
      
      if (response.success && response.data) {
        console.log('Données reçues:', response.data);
        // ✅ Utiliser directement response.data qui a la bonne structure
        setData(response.data as DashboardData);
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement du tableau de bord...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Calcul de la croissance (simulée pour l'exemple)
  const growth = 15; // À remplacer par une vraie valeur si disponible

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Filtres de période */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chiffre d'affaires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(data.sales?.month || 0)}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                {growth}%
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Produits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.counts?.products || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {data.counts?.lowStock || 0} en stock faible
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.counts?.customers || 0}
              </p>
              <p className="text-sm text-green-600 mt-2">
                +0 ce mois
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Alertes Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertes Stock</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {data.counts?.lowStock || 0}
              </p>
              <p className="text-sm text-red-600 mt-2">
                {data.counts?.outOfStock || 0} en rupture
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des ventes - Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
        <div className="h-64 bg-gray-50 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              {data.sales?.today.toLocaleString('fr-FR')} F aujourd'hui
            </p>
            <p className="text-sm text-gray-400">
              {data.sales?.week.toLocaleString('fr-FR')} F cette semaine
            </p>
          </div>
        </div>
      </div>

      {/* Deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparaison des ventes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparaison des ventes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Aujourd'hui</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.sales?.today || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Cette semaine</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.sales?.week || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Ce mois</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(data.sales?.month || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques rapides</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Produits en stock</span>
              <span className="font-semibold text-gray-900">
                {(data.counts?.products || 0) - (data.counts?.outOfStock || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Produits en rupture</span>
              <span className="font-semibold text-red-600">{data.counts?.outOfStock || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock faible</span>
              <span className="font-semibold text-orange-600">{data.counts?.lowStock || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dépenses en attente</span>
              <span className="font-semibold text-gray-900">
                {data.counts?.pendingExpenses || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Factures récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Factures récentes</h3>
          <ShoppingBag className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">N° Facture</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.recentInvoices && data.recentInvoices.length > 0 ? (
                data.recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {invoice.customerName || 'Client de passage'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(parseFloat(invoice.total))}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aucune facture récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Produits en stock faible (si existant) */}
      {data.counts?.lowStock && data.counts.lowStock > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              {data.counts.lowStock} produit(s) en stock faible. Pensez à réapprovisionner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};