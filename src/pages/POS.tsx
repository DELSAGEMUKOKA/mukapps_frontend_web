import React, { useEffect, useState, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  X,
  Check,
  Package,
  Barcode,
} from 'lucide-react';
import { productsService, Product } from '../lib/api/products.service';
import { customersService, Customer } from '../lib/api/customers.service';
import { categoriesService, Category } from '../lib/api/categories.service';
import { invoicesService } from '../lib/api/invoices.service';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  product: Product;
  quantity: number;
}

export const POS: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  // Références pour les modales
  const customerModalRef = useRef<HTMLDivElement>(null);
  const paymentModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Gestionnaire de clic extérieur pour les modales
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerModalRef.current && !customerModalRef.current.contains(event.target as Node)) {
        setShowCustomerModal(false);
      }
      if (paymentModalRef.current && !paymentModalRef.current.contains(event.target as Node)) {
        setShowPaymentModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Bloquer le scroll quand une modale est ouverte
  useEffect(() => {
    if (showCustomerModal || showPaymentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCustomerModal, showPaymentModal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll(),
        customersService.getAll(),
      ]);

      if (productsRes.success) setProducts(productsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;

    try {
      const response = await productsService.getByBarcode(barcodeInput);
      if (response.success) {
        addToCart(response.data);
        setBarcodeInput('');
      }
    } catch (error) {
      alert('Produit non trouvé');
      setBarcodeInput('');
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (product.trackStock && existingItem.quantity >= product.currentStock) {
        alert('Stock insuffisant');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.trackStock && product.currentStock === 0) {
        alert('Produit en rupture de stock');
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (item.product.trackStock && newQuantity > item.product.currentStock) {
      alert('Stock insuffisant');
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setNotes('');
    setAmountPaid('');
    setPaymentMethod('cash');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.2;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }
    setAmountPaid(calculateTotal().toFixed(2));
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid);

    if (paymentMethod === 'cash' && paid < total) {
      alert('Le montant payé est insuffisant');
      return;
    }

    setProcessing(true);

    try {
      // Préparer les articles pour la facture
      const invoiceItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        total: item.product.price * item.quantity
      }));

      // Préparer les données de la facture
      const invoiceData = {
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || 'Client de passage',
        items: invoiceItems,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: total,
        paymentMethod: paymentMethod,
        status: 'paid',
        notes: notes || '',
        date: new Date().toISOString()
      };

      // Appel au service des factures
      const response = await invoicesService.create(invoiceData);

      if (response.success) {
        // Préparer les données pour le ticket
        const saleData = {
          ...response.data,
          items: cart,
          customerName: selectedCustomer?.name,
          change: paymentMethod === 'cash' ? change : 0,
          amountPaid: parseFloat(amountPaid),
          paymentMethod: paymentMethod,
          date: new Date(),
          companyInfo: response.data.companyInfo || {
            name: 'Votre Entreprise',
            address: 'Adresse',
            phone: 'Téléphone',
            email: 'Email'
          }
        };
        
        // Recharger les données pour mettre à jour les stocks
        await loadData();
        
        // Réinitialiser le panier
        clearCart();
        
        // Fermer la modale avant redirection
        setShowPaymentModal(false);
        
        // Petit délai pour permettre à React de nettoyer le DOM
        setTimeout(() => {
          navigate('/print-receipt', { 
            state: { saleData: saleData }
          });
        }, 50);
      } else {
        throw new Error(response.message || 'Échec de l\'enregistrement de la facture');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      if (error.response) {
        alert(`❌ Erreur ${error.response.status}: ${error.response.data?.error?.message || error.response.data?.message || 'Erreur serveur'}`);
      } else if (error.request) {
        alert('❌ Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        alert(`❌ Erreur: ${error.message}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const change = paymentMethod === 'cash' ? parseFloat(amountPaid) - calculateTotal() : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Point de vente</h1>
        <p className="text-gray-600 mt-1">Effectuez vos ventes rapidement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Scanner le code-barres..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    selectedCategory === category.id
                      ? { backgroundColor: category.color }
                      : {}
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const isOutOfStock =
                  product.trackStock && product.currentStock === 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isOutOfStock
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">
                      {product.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                    {product.trackStock && (
                      <p className="text-xs text-gray-500 mt-1">
                        {isOutOfStock
                          ? 'Rupture de stock'
                          : `Stock: ${product.currentStock}`}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucun produit trouvé</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Panier ({cart.length})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <button
                onClick={() => setShowCustomerModal(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                {selectedCustomer ? selectedCustomer.name : 'Sélectionner un client'}
              </button>
            </div>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.product.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Panier vide</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>
                      {calculateSubtotal().toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>TVA (20%)</span>
                    <span>
                      {calculateTax().toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>
                      {calculateTotal().toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Payer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modale client */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={customerModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Sélectionner un client</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setShowCustomerModal(false);
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <p className="font-medium text-gray-900">Client anonyme</p>
                </button>
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerModal(false);
                    }}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedCustomer?.id === customer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={paymentModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Paiement</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Montant à payer</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {calculateTotal().toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    <p className="font-medium text-gray-900">Espèces</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    <p className="font-medium text-gray-900">Carte</p>
                  </button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant reçu
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                  {parseFloat(amountPaid) > 0 && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">
                          Monnaie à rendre
                        </span>
                        <span className="text-lg font-bold text-green-800">
                          {change > 0
                            ? change.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              })
                            : '0,00 €'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Ajouter une note pour cette vente..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    'Traitement...'
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirmer la vente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};