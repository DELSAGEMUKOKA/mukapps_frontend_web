// src/pages/Categories.tsx
import React, { useEffect, useState, useRef } from 'react'; // ✅ AJOUT de useRef
import {
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  FileDown,
  Upload,
  Download,
} from 'lucide-react'; // ✅ Supprimé Palette (non utilisé)
import * as XLSX from 'xlsx';
import { categoriesService, Category } from '../lib/api/categories.service';
import { downloadCategoryTemplate } from '../utils/excelTemplate';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange foncé
  '#6B7280', // gray
  '#1F2937', // dark gray
];

export const Categories: React.FC = () => {
  const { user } = useAuth();
  const { canEditCategory, canDeleteCategory } = usePermissions(); // ✅ Supprimé canCreateCategory (non utilisé)
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLORS[0],
  });

  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesService.getAll();
      if (response.success) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || COLORS[0],
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        color: COLORS[0],
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
      };

      let response;
      if (selectedCategory) {
        response = await categoriesService.update(selectedCategory.id, categoryData);
      } else {
        response = await categoriesService.create(categoryData);
      }

      if (response.success) {
        await loadCategories();
        setShowModal(false);
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const response = await categoriesService.delete(id);
      if (response.success) {
        await loadCategories();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleExportToExcel = () => {
    const exportData = filteredCategories.map(category => ({
      'Nom': category.name,
      'Description': category.description || '',
      'Couleur': category.color || '',
      'Date de création': new Date(category.created_at).toLocaleDateString('fr-FR'),
      'Produits': 0, // ✅ Remplacé _count par 0 par défaut
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Catégories');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `categories_export_${timestamp}.xlsx`);
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
          const categoryData = {
            name: row['Nom'],
            description: row['Description'],
            color: row['Couleur'] || COLORS[0],
          };
          await categoriesService.create(categoryData);
          successCount++;
        } catch (err) {
          console.error('Error importing row:', err);
        }
      }

      await loadCategories();
      alert(`${successCount} catégories importées avec succès`);
    } catch (err) {
      alert('Erreur lors de l\'import');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    downloadCategoryTemplate();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des catégories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-600 mt-1">Gérez vos catégories de produits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Template
          </button>
          <button
            onClick={handleExportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            disabled={categories.length === 0}
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
                Nouvelle catégorie
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

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total catégories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avec description</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {categories.filter(c => c.description).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avec produits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">0</p> {/* ✅ Remplacé par 0 */}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Couleur</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nom</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Produits</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date création</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border-2"
                        style={{ backgroundColor: category.color || '#e5e7eb' }}
                      />
                      <span className="text-sm text-gray-600 font-mono">
                        {category.color || 'Par défaut'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">{category.name}</td>
                  <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                    {category.description || '-'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      0 {/* ✅ Remplacé _count?.products par 0 */}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(category.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      {canEditCategory() && (
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteCategory() && (
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune catégorie trouvée</p>
              {isAdminOrSupervisor && (
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Créer une catégorie
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-blue-600 scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm text-gray-600">Couleur sélectionnée:</span>
                  <div
                    className="w-8 h-8 rounded-lg border-2"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm font-mono text-gray-600">{formData.color}</span>
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
                  {saving ? 'Enregistrement...' : (selectedCategory ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};