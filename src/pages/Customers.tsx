import React, { useEffect, useState, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  Star,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Upload,
} from 'lucide-react';
import { customersService, Customer, CreateCustomerData } from '../lib/api/customers.service';
import { exportCustomersToExcel, getCustomerImportTemplate, parseCustomersFromExcel } from '../utils/customersExcel';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'business' | 'vip'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateCustomerData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    type: 'individual',
    taxId: '',
    isVip: false,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filterType]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersService.getAll();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
      );
    }

    if (filterType === 'individual') {
      filtered = filtered.filter((c) => c.type === 'individual');
    } else if (filterType === 'business') {
      filtered = filtered.filter((c) => c.type === 'business');
    } else if (filterType === 'vip') {
      filtered = filtered.filter((c) => c.isVip);
    }

    setFilteredCustomers(filtered);
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        type: customer.type,
        taxId: customer.taxId,
        isVip: customer.isVip,
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        type: 'individual',
        taxId: '',
        isVip: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (selectedCustomer) {
        await customersService.update(selectedCustomer.id, formData);
      } else {
        await customersService.create(formData);
      }
      await loadCustomers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Erreur lors de la sauvegarde du client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      await customersService.delete(id);
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  const handleExport = () => {
    exportCustomersToExcel(filteredCustomers);
  };

  const handleDownloadTemplate = () => {
    getCustomerImportTemplate();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const customersData = await parseCustomersFromExcel(file);

      if (customersData.length === 0) {
        alert('Aucun client trouvé dans le fichier');
        return;
      }

      const results = { success: 0, failed: 0 };

      for (const customerData of customersData) {
        if (!customerData.name) {
          results.failed++;
          continue;
        }

        try {
          await customersService.create(customerData);
          results.success++;
        } catch (error) {
          console.error('Error importing customer:', error);
          results.failed++;
        }
      }

      await loadCustomers();
      alert(`Import terminé: ${results.success} clients importés, ${results.failed} échecs`);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Erreur lors de la lecture du fichier. Assurez-vous que le format est correct.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleViewDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    setPurchaseHistory([]);
    setCustomerStats(null);

    try {
      const [statsResponse, historyResponse] = await Promise.all([
        customersService.getStats(customer.id),
        customersService.getPurchaseHistory(customer.id),
      ]);

      if (statsResponse.success) {
        setCustomerStats(statsResponse.data);
      }

      if (historyResponse.success) {
        setPurchaseHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  const stats = {
    total: customers.length,
    individual: customers.filter((c) => c.type === 'individual').length,
    business: customers.filter((c) => c.type === 'business').length,
    vip: customers.filter((c) => c.isVip).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Gérez votre base clients</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {importing ? 'Import...' : 'Importer'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exporter
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Particuliers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.individual}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Entreprises</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.business}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">VIP</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.vip}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'individual'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Particuliers
            </button>
            <button
              onClick={() => setFilterType('business')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'business'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Entreprises
            </button>
            <button
              onClick={() => setFilterType('vip')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'vip'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              VIP
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date création</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(customer)}
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        {customer.isVip && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {customer.city && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {customer.city}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {customer.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                      )}
                      {customer.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        customer.type === 'business'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {customer.type === 'business' ? (
                        <Building className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {customer.type === 'business' ? 'Entreprise' : 'Particulier'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {customer.isVip ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                        <Star className="w-3 h-3" />
                        VIP
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Standard</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(customer);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(customer.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucun client trouvé</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCustomer ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet / Raison sociale *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de client *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'individual' | 'business' })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Particulier</option>
                    <option value="business">Entreprise</option>
                  </select>
                </div>

                {formData.type === 'business' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SIRET / TVA
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isVip}
                      onChange={(e) => setFormData({ ...formData, isVip: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Client VIP
                    </span>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Détails du client</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setCustomerStats(null);
                  setPurchaseHistory([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.name}
                    </h3>
                    {selectedCustomer.isVip && (
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCustomer.type === 'business'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedCustomer.type === 'business' ? (
                      <Building className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    {selectedCustomer.type === 'business' ? 'Entreprise' : 'Particulier'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.address}</p>
                      {selectedCustomer.city && (
                        <p className="text-sm text-gray-600">{selectedCustomer.city}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedCustomer.taxId && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SIRET / TVA</p>
                      <p className="font-medium text-gray-900">{selectedCustomer.taxId}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Client depuis</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedCustomer.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {customerStats && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Statistiques</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-800">Chiffre d'affaires</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {(customerStats.totalRevenue || 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">Factures</p>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {customerStats.totalInvoices || 0}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        <p className="text-sm text-orange-800">Panier moyen</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">
                        {(customerStats.averageOrderValue || 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {purchaseHistory.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Historique des achats (20 dernières ventes)</h4>
                  <div className="space-y-3">
                    {purchaseHistory.map((sale: any) => (
                      <div key={sale.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">
                              {sale.invoice_number}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                sale.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : sale.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {sale.payment_status === 'paid'
                                ? 'Payée'
                                : sale.payment_status === 'pending'
                                ? 'En attente'
                                : 'Annulée'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {parseFloat(sale.total_amount || 0).toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        {sale.sale_items && sale.sale_items.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Articles:</p>
                            <ul className="space-y-1">
                              {sale.sale_items.map((item: any) => (
                                <li key={item.id} className="text-sm text-gray-700 flex justify-between">
                                  <span>
                                    {item.product_name} <span className="text-gray-500">x{item.quantity}</span>
                                  </span>
                                  <span className="font-medium">
                                    {parseFloat(item.total_price || 0).toLocaleString('fr-FR', {
                                      style: 'currency',
                                      currency: 'EUR',
                                    })}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenModal(selectedCustomer);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
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
