// src/pages/Invoices.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  X,
  Download,
  Check,
  XCircle,
  Clock,
  Filter,
  Calendar,
  User,
  DollarSign,
  Upload,
  FileDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { invoicesService, Invoice } from '../lib/api/invoices.service';
import { customersService, Customer } from '../lib/api/customers.service';
import { downloadInvoiceTemplate } from '../utils/excelTemplate'; // ✅ IMPORT AJOUTÉ

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, customersRes] = await Promise.all([
        invoicesService.getAll(),
        customersService.getAll(),
      ]);

      if (invoicesRes.success) setInvoices(invoicesRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleCancelInvoice = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) return;

    try {
      await invoicesService.cancel(id);
      await loadData();
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      alert('Erreur lors de l\'annulation de la facture');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    try {
      await invoicesService.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Téléchargement de la facture ${invoice.id}`);
  };

  const handleExportToExcel = () => {
    const exportData = filteredInvoices.map(invoice => ({
      'Invoice Number': invoice.id.substring(0, 8).toUpperCase(),
      'Customer Name': invoice.customerName || 'Anonymous',
      'Customer ID': invoice.customerId || '',
      'Date': new Date(invoice.created_at).toLocaleDateString('fr-FR'),
      'Status': invoice.status,
      'Payment Method': invoice.paymentMethod,
      'Subtotal': invoice.subtotal,
      'Tax': invoice.tax,
      'Discount': invoice.discount,
      'Total': invoice.total,
      'Items Count': invoice.items.length,
      'Notes': invoice.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const columnWidths = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 30 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    const itemsData: any[] = [];
    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        itemsData.push({
          'Invoice Number': invoice.id.substring(0, 8).toUpperCase(),
          'Product Name': item.productName,
          'Product ID': item.productId,
          'Quantity': item.quantity,
          'Unit Price': item.unitPrice,
          'Total': item.total,
        });
      });
    });

    if (itemsData.length > 0) {
      const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
      XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Invoice Items');
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `invoices_export_${timestamp}.xlsx`);
  };

  const handleImportFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const invoicesSheet = workbook.Sheets[workbook.SheetNames[0]];
      const invoicesData = XLSX.utils.sheet_to_json(invoicesSheet);

      let itemsData: any[] = [];
      if (workbook.SheetNames.length > 1) {
        const itemsSheet = workbook.Sheets[workbook.SheetNames[1]];
        itemsData = XLSX.utils.sheet_to_json(itemsSheet);
      }

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const row of invoicesData as any[]) {
        try {
          const invoiceNumber = row['Invoice Number'] || '';
          const customerName = row['Customer Name'];
          const customerId = row['Customer ID'] || null;

          const invoiceItems = itemsData.filter(
            (item: any) => item['Invoice Number'] === invoiceNumber
          );

          if (invoiceItems.length === 0) {
            errors.push(`Invoice ${invoiceNumber}: No items found`);
            failCount++;
            continue;
          }

          const items = invoiceItems.map((item: any) => ({
            productId: item['Product ID'],
            productName: item['Product Name'],
            quantity: item['Quantity'] || 1,
            unitPrice: item['Unit Price'] || 0,
            total: item['Total'] || 0,
          }));

          const invoiceData = {
            customerId: customerId || undefined,
            customerName: customerName !== 'Anonymous' ? customerName : undefined,
            items: items,
            subtotal: row['Subtotal'] || 0,
            tax: row['Tax'] || 0,
            discount: row['Discount'] || 0,
            total: row['Total'] || 0,
            paymentMethod: (row['Payment Method'] || 'cash') as 'cash' | 'card' | 'mobile_money',
            status: (row['Status'] || 'paid') as 'paid' | 'pending' | 'cancelled',
            notes: row['Notes'] || undefined,
          };

          await invoicesService.create(invoiceData);
          successCount++;
        } catch (err: any) {
          failCount++;
          errors.push(`Error: ${err.message}`);
        }
      }

      await loadData();

      if (errors.length > 0 && errors.length <= 5) {
        alert(`Import completed!\nSuccessful: ${successCount}\nFailed: ${failCount}\n\nErrors:\n${errors.join('\n')}`);
      } else if (errors.length > 5) {
        alert(`Import completed!\nSuccessful: ${successCount}\nFailed: ${failCount}\n\nShowing first 5 errors:\n${errors.slice(0, 5).join('\n')}\n... and ${errors.length - 5} more errors`);
      } else {
        alert(`Import completed successfully!\nImported: ${successCount} invoices`);
      }
    } catch (err: any) {
      alert('Failed to import file. Please ensure it is a valid Excel file with both Invoices and Invoice Items sheets.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const icons = {
      paid: <Check className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };

    const labels = {
      paid: 'Payée',
      pending: 'En attente',
      cancelled: 'Annulée',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    cancelled: invoices.filter((i) => i.status === 'cancelled').length,
    totalRevenue: invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices
      .filter((i) => i.status === 'pending')
      .reduce((sum, i) => sum + i.total, 0),
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
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <p className="text-gray-600 mt-1">Gérez vos factures clients</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadInvoiceTemplate} // ✅ Fonction importée
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Template
          </button>
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            disabled={invoices.length === 0}
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {importing ? 'Importing...' : 'Import'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFromExcel}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total factures</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chiffre d'affaires</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalRevenue.toLocaleString('fr-FR', {
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
              <p className="text-gray-600 text-sm">En attente</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.pendingAmount.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Payées</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.paid}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
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
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Toutes
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Payées
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Annulées
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Numéro</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Articles</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(invoice)}
                >
                  <td className="py-4 px-4">
                    <p className="font-mono font-semibold text-gray-900">
                      #{invoice.id.substring(0, 8).toUpperCase()}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-900">
                        {invoice.customerName || 'Client anonyme'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{invoice.items.length} article(s)</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">
                      {invoice.total.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </p>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(invoice.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(invoice);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(invoice);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {invoice.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelInvoice(invoice.id);
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Annuler"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInvoice(invoice.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune facture trouvée</p>
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Détails de la facture</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Numéro de facture</p>
                  <h3 className="text-2xl font-bold text-gray-900 font-mono">
                    #{selectedInvoice.id.substring(0, 8).toUpperCase()}
                  </h3>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedInvoice.status)}
                  <p className="text-sm text-gray-600 mt-2">
                    {new Date(selectedInvoice.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-gray-200 py-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Client</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">
                      {selectedInvoice.customerName || 'Client anonyme'}
                    </p>
                    {selectedInvoice.customerId && (
                      <p className="text-sm text-gray-600">
                        ID: {selectedInvoice.customerId.substring(0, 8)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Paiement</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700 capitalize">{selectedInvoice.paymentMethod}</p>
                    <p className="text-sm text-gray-600">
                      {selectedInvoice.status === 'paid'
                        ? 'Payée'
                        : selectedInvoice.status === 'pending'
                        ? 'En attente'
                        : 'Annulée'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Articles</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Produit
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                          Quantité
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Prix unitaire
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">{item.productName}</td>
                          <td className="py-3 px-4 text-center text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            {item.unitPrice.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            {item.total.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Sous-total</span>
                    <span>
                      {selectedInvoice.subtotal.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>TVA</span>
                    <span>
                      {selectedInvoice.tax.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Remise</span>
                      <span>
                        -
                        {selectedInvoice.discount.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      {selectedInvoice.total.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Notes</h4>
                  <p className="text-blue-800 text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
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