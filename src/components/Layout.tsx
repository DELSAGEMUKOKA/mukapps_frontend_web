// src/components/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Bell,
  Search,
  BarChart3,
  ClipboardList,
  Shield,
  CreditCard
} from 'lucide-react';  // ✅ Supprimé TrendingUp, Home, Truck, Printer (non utilisés)

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications] = useState(3); // ✅ Enlevé setNotifications car non utilisé

  // Fermer le menu mobile quand la route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // ======================================================
  // CONFIGURATION DU MENU SELON LES PERMISSIONS
  // ======================================================
  const menuItems: MenuItem[] = [
    {
      title: 'Tableau de bord',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Point de vente',
      path: '/pos',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      title: 'Produits',
      path: '/products',
      icon: <Package className="w-5 h-5" />,
      roles: ['admin', 'supervisor'],
    },
    {
      title: 'Catégories',
      path: '/categories',
      icon: <Tags className="w-5 h-5" />,
      roles: ['admin', 'supervisor'],
    },
    {
      title: 'Stock',
      path: '/stock',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      title: 'Clients',
      path: '/customers',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Factures',
      path: '/invoices',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: 'Dépenses',
      path: '/expenses',
      icon: <DollarSign className="w-5 h-5" />,
      roles: ['admin', 'supervisor'],
    },
    {
      title: 'Rapports',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'supervisor'],
    },
    {
      title: 'Équipes',
      path: '/teams',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'supervisor'],
    },
    {
      title: 'Abonnements',
      path: '/subscriptions',
      icon: <CreditCard className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      title: 'Utilisateurs',
      path: '/users',
      icon: <Shield className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      title: 'Paramètres',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin'],
    },
  ];

  // Filtrer les menus selon les permissions
  const filteredMenu = menuItems.filter(item => {
    if (!item.roles) return true; // Accessible à tous
    return item.roles.includes(user?.role || '');
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Déterminer le titre de la page courante
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.title || 'Inventory Management';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================== */}
      {/* OVERLAY POUR MENU MOBILE */}
      {/* ================================================== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================================================== */}
      {/* SIDEBAR */}
      {/* ================================================== */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">StockManager</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          
          {/* Bouton toggle pour desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Bouton fermer pour mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu de navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.title : undefined}
              >
                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="flex-1 text-sm font-medium text-left">
                    {item.title}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profil utilisateur dans sidebar */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === 'admin' && 'Administrateur'}
                  {user?.role === 'supervisor' && 'Superviseur'}
                  {user?.role === 'cashier' && 'Caissier'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ================================================== */}
      {/* CONTENU PRINCIPAL */}
      {/* ================================================== */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Barre d'en-tête */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Bouton menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Titre de la page */}
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              {getPageTitle()}
            </h1>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Menu profil */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Mon profil
                      </button>
                      
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;