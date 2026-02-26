import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  Key,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { settingsService, Settings as SettingsData } from '../lib/api/settings.service';
import { companiesService } from '../lib/api/companies.service';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive';
  createdAt: string;
}

type SettingsTab = 'profile' | 'company' | 'users' | 'preferences' | 'security' | 'notifications';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    position: '',
  });

  const [companyData, setCompanyData] = useState<SettingsData>({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'France',
    taxId: '',
    rccm: '',
    invoiceFooter: '',
  });

  const [preferencesData, setPreferencesData] = useState({
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    invoicePrefix: 'INV',
    language: 'fr',
    timezone: 'Europe/Paris',
    lowStockThreshold: 10,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notificationsData, setNotificationsData] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    newOrderAlerts: true,
    expenseApprovals: true,
    dailyReports: false,
    weeklyReports: true,
  });

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as CompanyUser['role'],
    password: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsResponse, companyResponse] = await Promise.all([
        settingsService.get(),
        companiesService.getCurrent(),
      ]);

      if (settingsResponse.success && settingsResponse.data) {
        setCompanyData({
          ...companyData,
          ...settingsResponse.data,
        });
        if (settingsResponse.data.currency) {
          setPreferencesData({ ...preferencesData, currency: settingsResponse.data.currency });
        }
        if (settingsResponse.data.dateFormat) {
          setPreferencesData({ ...preferencesData, dateFormat: settingsResponse.data.dateFormat });
        }
        if (settingsResponse.data.invoicePrefix) {
          setPreferencesData({
            ...preferencesData,
            invoicePrefix: settingsResponse.data.invoicePrefix,
          });
        }
      }

      if (companyResponse.success && companyResponse.data) {
        setCompanyData((prev) => ({
          ...prev,
          companyName: companyResponse.data.name,
          email: companyResponse.data.email,
          phone: companyResponse.data.phone,
          address: companyResponse.data.address,
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      await settingsService.update(companyData);
      await companiesService.update({
        name: companyData.companyName || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
      });
      alert('Informations de l\'entreprise mises à jour avec succès');
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Erreur lors de la mise à jour des informations');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await settingsService.update({
        currency: preferencesData.currency,
        dateFormat: preferencesData.dateFormat,
        invoicePrefix: preferencesData.invoicePrefix,
      });
      alert('Préférences mises à jour avec succès');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Erreur lors de la mise à jour des préférences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Erreur lors de la modification du mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Erreur lors de la mise à jour des notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormData({ name: '', email: '', role: 'employee', password: '' });
    setShowUserModal(true);
  };

  const handleEditUser = (user: CompanyUser) => {
    setSelectedUser(user);
    setUserFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!userFormData.name || !userFormData.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowUserModal(false);
      alert(selectedUser ? 'Utilisateur modifié avec succès' : 'Utilisateur ajouté avec succès');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Erreur lors de la sauvegarde de l\'utilisateur');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(users.filter((u) => u.id !== id));
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profil', icon: UserCircle },
    { id: 'company' as SettingsTab, label: 'Entreprise', icon: Building2 },
    { id: 'users' as SettingsTab, label: 'Utilisateurs', icon: Users },
    { id: 'preferences' as SettingsTab, label: 'Préférences', icon: SettingsIcon },
    { id: 'security' as SettingsTab, label: 'Sécurité', icon: Shield },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez les paramètres de votre compte et de votre entreprise</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de l'entreprise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input
                      type="text"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <input
                      type="text"
                      value={companyData.country}
                      onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro TVA</label>
                    <input
                      type="text"
                      value={companyData.taxId}
                      onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RCCM</label>
                    <input
                      type="text"
                      value={companyData.rccm}
                      onChange={(e) => setCompanyData({ ...companyData, rccm: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pied de page des factures</label>
                    <textarea
                      value={companyData.invoiceFooter}
                      onChange={(e) => setCompanyData({ ...companyData, invoiceFooter: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Merci de votre confiance..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveCompany}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h2>
                <button
                  onClick={handleAddUser}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un utilisateur
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    La gestion des utilisateurs nécessite une connexion au backend API. Connectez votre API pour gérer les utilisateurs de votre entreprise.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rôle</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{user?.name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-600">{user?.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                          Administrateur
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          <Check className="w-3 h-3" />
                          Actif
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-gray-500">Votre compte</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Préférences générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                    <select
                      value={preferencesData.currency}
                      onChange={(e) => setPreferencesData({ ...preferencesData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                      <option value="GBP">Livre Sterling (£)</option>
                      <option value="XAF">Franc CFA (FCFA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format de date</label>
                    <select
                      value={preferencesData.dateFormat}
                      onChange={(e) => setPreferencesData({ ...preferencesData, dateFormat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                      <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                      <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Préfixe des factures</label>
                    <input
                      type="text"
                      value={preferencesData.invoicePrefix}
                      onChange={(e) => setPreferencesData({ ...preferencesData, invoicePrefix: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                    <select
                      value={preferencesData.language}
                      onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                    <select
                      value={preferencesData.timezone}
                      onChange={(e) => setPreferencesData({ ...preferencesData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="Africa/Kinshasa">Afrique/Kinshasa (GMT+1)</option>
                      <option value="America/New_York">America/New York (GMT-5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seuil de stock faible</label>
                    <input
                      type="number"
                      min="0"
                      value={preferencesData.lowStockThreshold}
                      onChange={(e) => setPreferencesData({ ...preferencesData, lowStockThreshold: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sécurité du compte</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Mot de passe</p>
                        <p className="text-sm text-gray-600">Dernière modification il y a 30 jours</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                        <p className="text-sm text-gray-600">Sécurisez votre compte avec la 2FA</p>
                      </div>
                    </div>
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Activer
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Clés API</p>
                        <p className="text-sm text-gray-600">Gérez vos clés d'accès API</p>
                      </div>
                    </div>
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Gérer
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sessions actives</h3>
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Session actuelle</p>
                        <p className="text-sm text-gray-600">Windows • Chrome • Paris, France</p>
                        <p className="text-xs text-gray-500 mt-1">Dernière activité: il y a quelques secondes</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Préférences de notification</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Notifications par email</p>
                      <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
                    </div>
                    <button
                      onClick={() => setNotificationsData({ ...notificationsData, emailNotifications: !notificationsData.emailNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationsData.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationsData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Alertes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Stock faible</span>
                        <button
                          onClick={() => setNotificationsData({ ...notificationsData, lowStockAlerts: !notificationsData.lowStockAlerts })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationsData.lowStockAlerts ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationsData.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Nouvelles commandes</span>
                        <button
                          onClick={() => setNotificationsData({ ...notificationsData, newOrderAlerts: !notificationsData.newOrderAlerts })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationsData.newOrderAlerts ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationsData.newOrderAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Approbations de dépenses</span>
                        <button
                          onClick={() => setNotificationsData({ ...notificationsData, expenseApprovals: !notificationsData.expenseApprovals })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationsData.expenseApprovals ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationsData.expenseApprovals ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Rapports</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Rapports quotidiens</span>
                        <button
                          onClick={() => setNotificationsData({ ...notificationsData, dailyReports: !notificationsData.dailyReports })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationsData.dailyReports ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationsData.dailyReports ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Rapports hebdomadaires</span>
                        <button
                          onClick={() => setNotificationsData({ ...notificationsData, weeklyReports: !notificationsData.weeklyReports })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationsData.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationsData.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Modifier le mot de passe</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as CompanyUser['role'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="employee">Employé</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
