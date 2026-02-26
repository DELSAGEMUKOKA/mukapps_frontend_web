// src/pages/Products.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Archive,
  Barcode,
  Upload,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { productsService, Product } from '../lib/api/products.service';
import { categoriesService, Category } from '../lib/api/categories.service';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import * as XLSX from 'xlsx';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const { canCreateProduct, canEditProduct, canDeleteProduct } = usePermissions();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

  // Formulaire pour créer/modifier un produit
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    description: '',
    categoryId: '',
    price: '',
    costPrice: '',
    minStockLevel: '',
    unit: '',
    trackStock: true,
    currentStock: '',
  });

  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  // Effet pour mettre à jour la pagination quand les filtres changent
  useEffect(() => {
    paginateProducts();
  }, [filteredProducts, currentPage, itemsPerPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll(),
      ]);

      if (productsRes.success) {
        setProducts(productsRes.data);
        setFilteredProducts(productsRes.data);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset à la première page quand on filtre
  };

  // Fonction de pagination
  const paginateProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  };

  // Changer de page
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Aller à la première page
  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  // Aller à la dernière page
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Page précédente
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Page suivante
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Changer le nombre d'éléments par page
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Calculs pour la pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Nombre maximum de pages à afficher
    
    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages si moins que le maximum
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Afficher un sous-ensemble de pages
      if (currentPage <= 3) {
        // Début de la pagination
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1); // Séparateur (...)
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fin de la pagination
        pageNumbers.push(1);
        pageNumbers.push(-1); // Séparateur (...)
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Milieu de la pagination
        pageNumbers.push(1);
        pageNumbers.push(-1); // Séparateur (...)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-2); // Séparateur (...)
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      // Mode édition
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        minStockLevel: product.minStockLevel?.toString() || '0',
        unit: product.unit || '',
        trackStock: product.trackStock,
        currentStock: product.currentStock?.toString() || '0',
      });
    } else {
      // Mode création
      setSelectedProduct(null);
      setFormData({
        name: '',
        barcode: '',
        description: '',
        categoryId: '',
        price: '',
        costPrice: '',
        minStockLevel: '',
        unit: '',
        trackStock: true,
        currentStock: '',
      });
    }
    setShowModal(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        name: formData.name,
        barcode: formData.barcode || undefined,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : undefined,
        unit: formData.unit || undefined,
        trackStock: formData.trackStock,
        currentStock: formData.currentStock ? parseInt(formData.currentStock) : 0,
      };

      let response;
      if (selectedProduct) {
        // Mise à jour
        response = await productsService.update(selectedProduct.id, productData);
      } else {
        // Création
        response = await productsService.create(productData);
      }

      if (response.success) {
        await loadData();
        setShowModal(false);
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await productsService.delete(id);
      if (response.success) {
        await loadData();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleExportToExcel = () => {
    const exportData = filteredProducts.map(product => ({
      'Nom': product.name,
      'Code-barres': product.barcode || '',
      'Description': product.description || '',
      'Catégorie': categories.find(c => c.id === product.categoryId)?.name || '',
      'Prix de vente': product.price,
      'Prix d\'achat': product.costPrice || 0,
      'Stock actuel': product.currentStock || 0,
      'Seuil minimum': product.minStockLevel || 0,
      'Unité': product.unit || '',
      'Suivi du stock': product.trackStock ? 'Oui' : 'Non',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produits');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `produits_export_${timestamp}.xlsx`);
  };

  const handleImportFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(sheet);

      let successCount = 0;
      for (const row of importedData as any[]) {
        try {
          const category = categories.find(
            c => c.name.toLowerCase() === (row['Catégorie'] || '').toLowerCase()
          );

          const productData = {
            name: row['Nom'],
            barcode: row['Code-barres']?.toString() || undefined,
            description: row['Description'] || undefined,
            categoryId: category?.id,
            price: parseFloat(row['Prix de vente']) || 0,
            costPrice: row['Prix d\'achat'] ? parseFloat(row['Prix d\'achat']) : undefined,
            minStockLevel: row['Seuil minimum'] ? parseInt(row['Seuil minimum']) : undefined,
            unit: row['Unité'] || undefined,
            trackStock: row['Suivi du stock'] === 'Oui',
            currentStock: row['Stock actuel'] ? parseInt(row['Stock actuel']) : 0,
          };

          await productsService.create(productData);
          successCount++;
        } catch (err) {
          console.error('Error importing row:', err);
        }
      }

      await loadData();
      alert(`${successCount} produits importés avec succès`);
    } catch (err) {
      alert('Erreur lors de l\'import');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.trackStock) return null;
    const stock = product.currentStock || 0;
    const minStock = product.minStockLevel || 0;

    if (stock === 0) {
      return {
        label: 'Rupture',
        color: 'bg-red-100 text-red-700',
        icon: <AlertTriangle className="w-3 h-3" />,
      };
    }
    if (stock <= minStock) {
      return {
        label: 'Stock faible',
        color: 'bg-orange-100 text-orange-700',
        icon: <AlertTriangle className="w-3 h-3" />,
      };
    }
    return {
      label: 'Normal',
      color: 'bg-green-100 text-green-700',
      icon: <TrendingUp className="w-3 h-3" />,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des produits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            disabled={products.length === 0}
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          
          {isAdminOrSupervisor && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {importing ? 'Import...' : 'Import'}
              </button>
              
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouveau produit
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFromExcel}
            className="hidden"
          />
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total produits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avec suivi stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {products.filter(p => p.trackStock).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stock faible</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {products.filter(p => {
                  if (!p.trackStock) return false;
                  const stock = p.currentStock || 0;
                  const minStock = p.minStockLevel || 0;
                  return stock > 0 && stock <= minStock;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En rupture</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {products.filter(p => p.trackStock && (p.currentStock || 0) === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Produit</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Catégorie</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Prix</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => {
                const category = categories.find(c => c.id === product.categoryId);
                const stockStatus = getStockStatus(product);
                const stockValue = (product.currentStock || 0) * (product.costPrice || 0);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.barcode && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Barcode className="w-3 h-3" />
                              {product.barcode}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {category ? (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: category.color ? `${category.color}20` : '#e5e7eb',
                            color: category.color || '#374151',
                          }}
                        >
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-gray-900">
                          {product.price.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </p>
                        {product.costPrice > 0 && (
                          <p className="text-xs text-gray-500">
                            Achat: {product.costPrice.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {product.trackStock ? (
                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.currentStock || 0} {product.unit}
                          </p>
                          {stockValue > 0 && (
                            <p className="text-xs text-gray-500">
                              Valeur: {stockValue.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Non suivi</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {stockStatus && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.icon}
                          {stockStatus.label}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {canEditProduct() && (
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {canDeleteProduct() && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucun produit trouvé</p>
              {canCreateProduct() && (
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Ajouter un produit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contrôles de pagination */}
        {filteredProducts.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Informations de pagination */}
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startItem}</span> à{' '}
                <span className="font-medium">{endItem}</span> sur{' '}
                <span className="font-medium">{totalItems}</span> produits
              </div>

              {/* Sélecteur d'éléments par page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Afficher</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">par page</span>
              </div>

              {/* Boutons de navigation */}
              <div className="flex items-center gap-1">
                {/* Première page */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Première page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>

                {/* Page précédente */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Numéros de page */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === -1 || pageNum === -2) {
                      // Séparateur
                      return (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Page suivante */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dernière page */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Dernière page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Code-barres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code-barres
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix de vente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix de vente *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Prix d'achat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix d'achat
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Stock minimum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d'alerte stock
                  </label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Unité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unité
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="kg, pièce, litre..."
                  />
                </div>

                {/* Stock initial */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock initial
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    disabled={!formData.trackStock}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quantité en stock au moment de la création
                  </p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Suivi du stock */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trackStock}
                      onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Suivre le stock de ce produit</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : (selectedProduct ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Détails du produit</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Code-barres</p>
                  <p className="font-mono text-gray-900">{selectedProduct.barcode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                  <p className="text-gray-900">
                    {categories.find(c => c.id === selectedProduct.categoryId)?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unité</p>
                  <p className="text-gray-900">{selectedProduct.unit || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prix de vente</p>
                  <p className="font-bold text-blue-600">
                    {selectedProduct.price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prix d'achat</p>
                  <p className="text-gray-900">
                    {selectedProduct.costPrice 
                      ? selectedProduct.costPrice.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock actuel</p>
                  <p className="font-semibold text-gray-900">
                    {selectedProduct.trackStock 
                      ? `${selectedProduct.currentStock || 0} ${selectedProduct.unit || ''}`
                      : 'Non suivi'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Seuil minimum</p>
                  <p className="text-gray-900">{selectedProduct.minStockLevel || 0}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {canEditProduct() && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenModal(selectedProduct);
                    }}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors"
                  >
                    Modifier
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};