// src/lib/api/products.service.ts
import { apiClient } from './config';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;              // ✅ Changé de selling_price
  costPrice: number;          // ✅ Changé de purchase_price
  categoryId: string;         // ✅ Changé de category_id
  barcode?: string;
  currentStock: number;       // ✅ Changé de stock_quantity
  minStockLevel: number;      // ✅ Changé de min_stock_level
  imageUrl?: string;          // ✅ Changé de image_url
  trackStock: boolean;        // ✅ AJOUTÉ
  unit?: string;              // ✅ AJOUTÉ
  isActive: boolean;          // ✅ Changé de is_active
  createdAt: string;          // ✅ Changé de created_at
  updatedAt: string;          // ✅ Changé de updated_at
  createdBy?: string;         // ✅ Changé de created_by
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  categoryId?: string;
  barcode?: string;
  currentStock?: number;
  minStockLevel?: number;
  unit?: string;
  trackStock?: boolean;
}

// Fonction de normalisation pour convertir les données du backend
const normalizeProduct = (product: any): Product => {
  // Log pour déboguer (à retirer en production)
  console.log('Normalisation produit:', product);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price || 0,
    costPrice: typeof product.costPrice === 'string' ? parseFloat(product.costPrice) : product.costPrice || 0,
    categoryId: product.categoryId || product.category_id || '',
    barcode: product.barcode,
    currentStock: typeof product.currentStock === 'string' ? parseInt(product.currentStock, 10) : product.currentStock || 0,
    minStockLevel: typeof product.minStockLevel === 'string' ? parseInt(product.minStockLevel, 10) : product.minStockLevel || 0,
    imageUrl: product.imageUrl || product.image_url,
    trackStock: product.trackStock === '1' || product.trackStock === 1 || product.trackStock === true,
    unit: product.unit || '',
    isActive: product.isActive === '1' || product.isActive === 1 || product.isActive === true,
    createdAt: product.createdAt || product.created_at,
    updatedAt: product.updatedAt || product.updated_at,
    createdBy: product.createdBy || product.created_by,
  };
};

const normalizeProducts = (products: any[]): Product[] => {
  if (!products) return [];
  return products.map(normalizeProduct);
};

export const productsService = {
  async getAll(params?: any): Promise<{ success: boolean; data: Product[] }> {
    try {
      const response = await apiClient.get('/products', { params });
      return {
        success: response.data.success,
        data: normalizeProducts(response.data.data),
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, data: [] };
    }
  },

  async getById(id: string): Promise<{ success: boolean; data: Product | null }> {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return {
        success: response.data.success,
        data: normalizeProduct(response.data.data),
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, data: null };
    }
  },

  async getByBarcode(barcode: string): Promise<{ success: boolean; data: Product | null }> {
    try {
      const response = await apiClient.get(`/products/barcode/${barcode}`);
      return {
        success: response.data.success,
        data: normalizeProduct(response.data.data),
      };
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      return { success: false, data: null };
    }
  },

  async getByCategory(categoryId: string): Promise<{ success: boolean; data: Product[] }> {
    try {
      const response = await apiClient.get(`/products/category/${categoryId}`);
      return {
        success: response.data.success,
        data: normalizeProducts(response.data.data),
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { success: false, data: [] };
    }
  },

  async getLowStock(): Promise<{ success: boolean; data: Product[] }> {
    try {
      const response = await apiClient.get('/products/low-stock');
      return {
        success: response.data.success,
        data: normalizeProducts(response.data.data),
      };
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return { success: false, data: [] };
    }
  },

  async getOutOfStock(): Promise<{ success: boolean; data: Product[] }> {
    try {
      const response = await apiClient.get('/products/out-of-stock');
      return {
        success: response.data.success,
        data: normalizeProducts(response.data.data),
      };
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      return { success: false, data: [] };
    }
  },

  async create(data: CreateProductData): Promise<{ success: boolean; data?: Product }> {
    try {
      // Conversion des données pour le backend
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        costPrice: data.costPrice,
        categoryId: data.categoryId,
        barcode: data.barcode,
        currentStock: data.currentStock || 0,
        minStockLevel: data.minStockLevel || 0,
        unit: data.unit,
        trackStock: data.trackStock ? '1' : '0',
      };

      const response = await apiClient.post('/products', payload);
      return {
        success: response.data.success,
        data: normalizeProduct(response.data.data),
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false };
    }
  },

  async update(id: string, data: Partial<CreateProductData>): Promise<{ success: boolean; data?: Product }> {
    try {
      // Conversion des données pour le backend
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.description !== undefined) payload.description = data.description;
      if (data.price !== undefined) payload.price = data.price;
      if (data.costPrice !== undefined) payload.costPrice = data.costPrice;
      if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
      if (data.barcode !== undefined) payload.barcode = data.barcode;
      if (data.currentStock !== undefined) payload.currentStock = data.currentStock;
      if (data.minStockLevel !== undefined) payload.minStockLevel = data.minStockLevel;
      if (data.unit !== undefined) payload.unit = data.unit;
      if (data.trackStock !== undefined) payload.trackStock = data.trackStock ? '1' : '0';

      const response = await apiClient.put(`/products/${id}`, payload);
      return {
        success: response.data.success,
        data: normalizeProduct(response.data.data),
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false };
    }
  },

  async updatePrice(id: string, price: number, costPrice: number): Promise<{ success: boolean; data?: Product }> {
    try {
      const response = await apiClient.put(`/products/${id}/price`, { price, costPrice });
      return {
        success: response.data.success,
        data: normalizeProduct(response.data.data),
      };
    } catch (error) {
      console.error('Error updating product price:', error);
      return { success: false };
    }
  },

  async updateStock(id: string, currentStock: number): Promise<{ success: boolean; data?: Product }> {
    try {
      const response = await apiClient.put(`/products/${id}/stock`, { currentStock });
      return {
        success: response.data.success,
        data: normalizeProduct(response.data.data),
      };
    } catch (error) {
      console.error('Error updating product stock:', error);
      return { success: false };
    }
  },

  async delete(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false };
    }
  },

  // Méthode utilitaire pour rechercher des produits
  async search(query: string): Promise<{ success: boolean; data: Product[] }> {
    try {
      const response = await apiClient.get('/products/search', { params: { q: query } });
      return {
        success: response.data.success,
        data: normalizeProducts(response.data.data),
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, data: [] };
    }
  },
};