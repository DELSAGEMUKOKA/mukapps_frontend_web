// src/pages/Stock.tsx
import React, { useEffect, useState } from 'react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit3,
  History,
  X,
} from 'lucide-react';
import { productsService } from '../lib/api/products.service';
import { stockService, StockMovement, CreateStockMovementData } from '../lib/api/stock.service';

type MovementType = 'in' | 'out' | 'adjustment';
type ViewMode = 'overview' | 'movements' | 'alerts';

interface ProductWithStock {
  id: string;
  name: string;
  barcode: string;
  currentStock: number;
  minStockLevel: number;
  costPrice: number;
  price: number;
  trackStock: boolean;
  category?: any;
}

export const Stock: React.FC = () => {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MovementType | 'all'>('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [saving, setSaving] = useState(false);

  const [movementForm, setMovementForm] = useState<CreateStockMovementData>({
    productId: '',
    type: 'in',
    quantity: 0,
    reason: '',
    reference: '',
    notes: '',
  });

  const [adjustForm, setAdjustForm] = useState({
    newStock: 0,
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, movementsRes] = await Promise.all([
        productsService.getAll(),
        stockService.getAllMovements(),
      ]);

      console.log('📦 Produits reçus:', productsRes);
      console.log('📊 Mouvements reçus:', movementsRes);

      if (productsRes.success && productsRes.data) {
        const formattedProducts: ProductWithStock[] = productsRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          currentStock: parseInt(p.currentStock) || 0,
          minStockLevel: parseInt(p.minStockLevel) || 0,
          costPrice: parseFloat(p.costPrice) || 0,
          price: parseFloat(p.price) || 0,
          trackStock: p.trackStock === "1" || p.trackStock === 1 || p.trackStock === true,
          category: p.category
        }));

        setProducts(formattedProducts);
        
        const lowStock = formattedProducts.filter((p) => {
          if (!p.trackStock) return false;
          return p.currentStock > 0 && p.currentStock <= p.minStockLevel;
        });
        setLowStockProducts(lowStock);
      }
      
      if (movementsRes.success && movementsRes.data) {
        setMovements(movementsRes.data);
      }
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMovementModal = (product?: ProductWithStock) => {
    if (product) {
      setSelectedProduct(product);
      setMovementForm({
        ...movementForm,
        productId: product.id,
      });
    }
    setShowMovementModal(true);
  };

  const handleOpenAdjustModal = (product: ProductWithStock) => {
    setSelectedProduct(product);
    setAdjustForm({
      newStock: product.currentStock,
      reason: '',
    });
    setShowAdjustModal(true);
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await stockService.createMovement(movementForm);
      if (result.success) {
        await loadData();
        setShowMovementModal(false);
        setMovementForm({
          productId: '',
          type: 'in',
          quantity: 0,
          reason: '',
          reference: '',
          notes: '',
        });
      } else {
        alert('Erreur lors de la création du mouvement');
      }
    } catch (error) {
      console.error('❌ Error creating movement:', error);
      alert('Erreur lors de la création du mouvement');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const result = await stockService.adjustStock(
        selectedProduct.id,
        adjustForm.newStock,
        adjustForm.reason
      );
      if (result.success) {
        await loadData();
        setShowAdjustModal(false);
      } else {
        alert('Erreur lors de l\'ajustement du stock');
      }
    } catch (error) {
      console.error('❌ Error adjusting stock:', error);
      alert('Erreur lors de l\'ajustement du stock');
    } finally {
      setSaving(false);
    }
  };

  const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
  const outOfStockCount = products.filter((p) => p.trackStock && p.currentStock === 0).length;
  const lowStockCount = lowStockProducts.length;

  const filteredMovements = movements.filter((movement) => {
    const matchesType = filterType === 'all' || movement.type === filterType;
    return matchesType;
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du stock</h1>
          <p className="text-gray-600 mt-1">Suivez vos mouvements et alertes de stock</p>
        </div>
        <button
          onClick={() => handleOpenMovementModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau mouvement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Valeur du stock</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalStockValue.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Produits</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Stock faible</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Rupture</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setViewMode('overview')}
              className={`py-4 px-2 font-medium transition-colors border-b-2 ${
                viewMode === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setViewMode('movements')}
              className={`py-4 px-2 font-medium transition-colors border-b-2 ${
                viewMode === 'movements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mouvements ({movements.length})
            </button>
            <button
              onClick={() => setViewMode('alerts')}
              className={`py-4 px-2 font-medium transition-colors border-b-2 ${
                viewMode === 'alerts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Alertes ({lowStockCount})
            </button>
          </div>
        </div>

        {viewMode === 'overview' && (
          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produit</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock actuel</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Seuil min</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valeur</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockValue = product.currentStock * product.costPrice;
                    const isLowStock = product.trackStock && 
                                       product.currentStock > 0 && 
                                       product.currentStock <= product.minStockLevel;
                    const isOutOfStock = product.trackStock && product.currentStock === 0;

                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.barcode}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900">
                            {product.trackStock ? product.currentStock : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {product.trackStock ? product.minStockLevel : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {product.trackStock ? stockValue.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {!product.trackStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Non suivi
                            </span>
                          ) : isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <TrendingDown className="w-3 h-3" />
                              Rupture
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <AlertTriangle className="w-3 h-3" />
                              Faible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <TrendingUp className="w-3 h-3" />
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenMovementModal(product)}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                              title="Ajouter un mouvement"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenAdjustModal(product)}
                              className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                              title="Ajuster le stock"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'movements' && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as MovementType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="in">Entrées</option>
                <option value="out">Sorties</option>
                <option value="adjustment">Ajustements</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => {
                  // Chercher le produit correspondant dans la liste des produits
                  const product = products.find((p) => p.id === movement.productId);
                  
                  return (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            movement.type === 'in'
                              ? 'bg-green-100'
                              : movement.type === 'out'
                              ? 'bg-red-100'
                              : 'bg-blue-100'
                          }`}
                        >
                          {movement.type === 'in' ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          ) : movement.type === 'out' ? (
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Edit3 className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product?.name || 'Produit inconnu'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {movement.reason || 'Mouvement de stock'}
                          </p>
                          {movement.reference && (
                            <p className="text-xs text-gray-500">Réf: {movement.reference}</p>
                          )}
                          {movement.notes && (
                            <p className="text-xs text-gray-400 mt-1">{movement.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            movement.type === 'in'
                              ? 'text-green-600'
                              : movement.type === 'out'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                          {movement.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movement.date ? new Date(movement.date).toLocaleDateString('fr-FR') : ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          Stock: {movement.previousStock} → {movement.currentStock}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun mouvement trouvé</p>
                  <button
                    onClick={() => setViewMode('overview')}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Retour à la vue d'ensemble
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'alerts' && (
          <div className="p-6">
            <div className="space-y-4">
              {lowStockProducts.map((product) => {
                const isOutOfStock = product.currentStock === 0;

                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isOutOfStock
                        ? 'bg-red-50 border-red-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isOutOfStock ? 'bg-red-100' : 'bg-orange-100'
                        }`}
                      >
                        {isOutOfStock ? (
                          <TrendingDown className="w-6 h-6 text-red-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          Stock: {product.currentStock} / Seuil minimum: {product.minStockLevel}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenMovementModal(product)}
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 border border-gray-300 font-medium transition-colors"
                    >
                      Réapprovisionner
                    </button>
                  </div>
                );
              })}

              {lowStockProducts.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte</h3>
                  <p className="text-gray-600">Tous vos produits ont un stock suffisant</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Nouveau mouvement</h2>
              <button
                onClick={() => setShowMovementModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produit *
                </label>
                <select
                  value={movementForm.productId}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, productId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de mouvement *
                </label>
                <select
                  value={movementForm.type}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      type: e.target.value as MovementType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="in">Entrée</option>
                  <option value="out">Sortie</option>
                  <option value="adjustment">Ajustement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={movementForm.quantity}
                  onChange={(e) =>
                    setMovementForm({
                      ...movementForm,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison *
                </label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Achat, vente, ajustement..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  value={movementForm.reference}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, reference: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bon de commande, facture..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={movementForm.notes}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Ajuster le stock</h2>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjust} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Produit</p>
                <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600 mt-2">Stock actuel</p>
                <p className="font-semibold text-gray-900">{selectedProduct.currentStock}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau stock *
                </label>
                <input
                  type="number"
                  value={adjustForm.newStock}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      newStock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de l'ajustement *
                </label>
                <textarea
                  value={adjustForm.reason}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Inventaire, produit endommagé, correction..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Ajustement...' : 'Ajuster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};