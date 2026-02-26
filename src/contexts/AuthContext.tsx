// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../lib/api/auth.service';

// ✅ Type pour les rôles possibles
export type UserRole = 'admin' | 'supervisor' | 'cashier' | 'operator';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  
  // ✅ NOUVELLES MÉTHODES D'AUTH
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  
  // ✅ Fonctions de vérification des rôles
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSupervisor: () => boolean;
  isCashier: () => boolean;
  isOperator: () => boolean;
  
  // ✅ Vérification des permissions spécifiques
  canCreateProduct: () => boolean;
  canEditProduct: () => boolean;
  canDeleteProduct: () => boolean;
  canManageUsers: () => boolean;
  canViewReports: () => boolean;
  canManageExpenses: () => boolean;
  canApproveExpenses: () => boolean;
  canViewSettings: () => boolean;
  canManageSettings: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        loadCurrentUser();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { error: null };
      }
      return { error: new Error('Login failed') };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      const response = await authService.register({
        name: fullName,
        email,
        password,
        companyName,
      });
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { error: null };
      }
      return { error: new Error('Registration failed') };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // ======================================================
  // ✅ NOUVELLES MÉTHODES D'AUTHENTIFICATION
  // ======================================================

  /**
   * Demande de réinitialisation de mot de passe
   */
  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Une erreur est survenue' 
      };
    }
  };

  /**
   * Réinitialisation du mot de passe avec token
   */
  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Une erreur est survenue' 
      };
    }
  };

  /**
   * Changement de mot de passe (utilisateur connecté)
   */
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error: any) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Une erreur est survenue' 
      };
    }
  };

  // ======================================================
  // ✅ FONCTIONS DE VÉRIFICATION DES RÔLES
  // ======================================================

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole);
    }
    
    return user.role === role;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isSupervisor = (): boolean => hasRole(['admin', 'supervisor']);
  const isCashier = (): boolean => hasRole(['admin', 'supervisor', 'cashier']);
  const isOperator = (): boolean => hasRole(['admin', 'supervisor', 'operator']);

  // ======================================================
  // ✅ FONCTIONS DE PERMISSIONS SPÉCIFIQUES
  // ======================================================

  // Produits
  const canCreateProduct = (): boolean => hasRole(['admin', 'supervisor']);
  const canEditProduct = (): boolean => hasRole(['admin', 'supervisor']);
  const canDeleteProduct = (): boolean => hasRole(['admin']);

  // Utilisateurs
  const canManageUsers = (): boolean => hasRole(['admin']);

  // Rapports
  const canViewReports = (): boolean => hasRole(['admin', 'supervisor']);
  const canViewFinancialReports = (): boolean => hasRole(['admin']);

  // Dépenses
  const canCreateExpense = (): boolean => hasRole(['admin', 'supervisor']);
  const canManageExpenses = (): boolean => hasRole(['admin', 'supervisor']);
  const canApproveExpenses = (): boolean => hasRole(['admin', 'supervisor']);
  const canDeleteExpense = (): boolean => hasRole(['admin']);

  // Paramètres
  const canViewSettings = (): boolean => true;
  const canManageSettings = (): boolean => hasRole(['admin']);

  // Stock
  const canManageStock = (): boolean => hasRole(['admin', 'supervisor']);
  const canViewStock = (): boolean => true;

  // Clients
  const canManageCustomers = (): boolean => hasRole(['admin', 'supervisor', 'cashier']);
  const canDeleteCustomer = (): boolean => hasRole(['admin']);

  // Factures
  const canCreateInvoice = (): boolean => true;
  const canCancelInvoice = (): boolean => hasRole(['admin', 'supervisor']);

  // Équipes
  const canManageTeams = (): boolean => hasRole(['admin', 'supervisor']);

  // Abonnements
  const canManageSubscriptions = (): boolean => hasRole(['admin']);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,      // ✅ AJOUTÉ
    resetPassword,       // ✅ AJOUTÉ
    changePassword,      // ✅ AJOUTÉ
    isAuthenticated: !!user,
    
    // Fonctions de rôles
    hasRole,
    isAdmin,
    isSupervisor,
    isCashier,
    isOperator,
    
    // Permissions produits
    canCreateProduct,
    canEditProduct,
    canDeleteProduct,
    
    // Permissions utilisateurs
    canManageUsers,
    
    // Permissions rapports
    canViewReports,
    canViewFinancialReports,
    
    // Permissions dépenses
    canCreateExpense,
    canManageExpenses,
    canApproveExpenses,
    canDeleteExpense,
    
    // Permissions paramètres
    canViewSettings,
    canManageSettings,
    
    // Permissions stock
    canManageStock,
    canViewStock,
    
    // Permissions clients
    canManageCustomers,
    canDeleteCustomer,
    
    // Permissions factures
    canCreateInvoice,
    canCancelInvoice,
    
    // Permissions équipes
    canManageTeams,
    
    // Permissions abonnements
    canManageSubscriptions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};