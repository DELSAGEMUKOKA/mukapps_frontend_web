// src/hooks/usePermissions.ts

import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_HIERARCHY } from '../types/roles';

/**
 * Hook personnalisé pour gérer les permissions
 * Fournit des fonctions utilitaires pour vérifier les droits d'accès
 */
export const usePermissions = () => {
  const { user, hasRole, isAdmin, isSupervisor, isCashier, isOperator } = useAuth();

  /**
   * Vérifie si l'utilisateur a un niveau de rôle suffisant
   */
  const hasMinimumRole = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role as UserRole] >= ROLE_HIERARCHY[requiredRole];
  };

  /**
   * Vérifie si l'utilisateur peut accéder à une ressource spécifique
   */
  const can = (action: string, resource: string): boolean => {
    if (!user) return false;

    // Admin a tous les droits
    if (isAdmin()) return true;

    switch (resource) {
      // ======================================================
      // PRODUITS
      // ======================================================
      case 'product':
        if (action === 'create' || action === 'update') {
          return isSupervisor();
        }
        if (action === 'delete') {
          return isAdmin();
        }
        if (action === 'read') {
          return true; // Tout le monde peut voir les produits
        }
        break;

      // ======================================================
      // CATÉGORIES
      // ======================================================
      case 'category':
        if (action === 'create' || action === 'update') {
          return isSupervisor();
        }
        if (action === 'delete') {
          return isAdmin();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // CLIENTS
      // ======================================================
      case 'customer':
        if (action === 'create' || action === 'update') {
          return isSupervisor() || isCashier();
        }
        if (action === 'delete') {
          return isAdmin();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // FACTURES
      // ======================================================
      case 'invoice':
        if (action === 'create') {
          return true; // Tout le monde peut créer des factures
        }
        if (action === 'cancel') {
          return isSupervisor();
        }
        if (action === 'read') {
          return true;
        }
        if (action === 'delete') {
          return isAdmin();
        }
        break;

      // ======================================================
      // DÉPENSES
      // ======================================================
      case 'expense':
        if (action === 'create') {
          return isSupervisor();
        }
        if (action === 'approve') {
          return isSupervisor();
        }
        if (action === 'update') {
          return isSupervisor();
        }
        if (action === 'delete') {
          return isAdmin();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // STOCK
      // ======================================================
      case 'stock':
        if (action === 'manage') {
          return isSupervisor();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // RAPPORTS
      // ======================================================
      case 'report':
        if (action === 'financial') {
          return isAdmin();
        }
        if (action === 'read') {
          return isSupervisor();
        }
        break;

      // ======================================================
      // UTILISATEURS
      // ======================================================
      case 'user':
        if (action === 'manage') {
          return isAdmin();
        }
        if (action === 'read') {
          return isAdmin();
        }
        break;

      // ======================================================
      // PARAMÈTRES
      // ======================================================
      case 'setting':
        if (action === 'manage') {
          return isAdmin();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // ÉQUIPES
      // ======================================================
      case 'team':
        if (action === 'manage') {
          return isSupervisor();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // ABONNEMENTS
      // ======================================================
      case 'subscription':
        if (action === 'manage') {
          return isAdmin();
        }
        if (action === 'read') {
          return true;
        }
        break;

      // ======================================================
      // TABLEAU DE BORD
      // ======================================================
      case 'dashboard':
        return true; // Tout le monde peut voir le dashboard

      default:
        return false;
    }

    return false;
  };

  /**
   * Raccourcis pour les permissions courantes
   */
  const permissions = {
    // Produits
    canViewProducts: () => can('read', 'product'),
    canCreateProduct: () => can('create', 'product'),
    canEditProduct: () => can('update', 'product'),
    canDeleteProduct: () => can('delete', 'product'),

    // Catégories
    canViewCategories: () => can('read', 'category'),
    canCreateCategory: () => can('create', 'category'),
    canEditCategory: () => can('update', 'category'),
    canDeleteCategory: () => can('delete', 'category'),

    // Clients
    canViewCustomers: () => can('read', 'customer'),
    canCreateCustomer: () => can('create', 'customer'),
    canEditCustomer: () => can('update', 'customer'),
    canDeleteCustomer: () => can('delete', 'customer'),

    // Factures
    canViewInvoices: () => can('read', 'invoice'),
    canCreateInvoice: () => can('create', 'invoice'),
    canCancelInvoice: () => can('cancel', 'invoice'),
    canDeleteInvoice: () => can('delete', 'invoice'),

    // Dépenses
    canViewExpenses: () => can('read', 'expense'),
    canCreateExpense: () => can('create', 'expense'),
    canEditExpense: () => can('update', 'expense'),
    canApproveExpense: () => can('approve', 'expense'),
    canDeleteExpense: () => can('delete', 'expense'),

    // Stock
    canViewStock: () => can('read', 'stock'),
    canManageStock: () => can('manage', 'stock'),

    // Rapports
    canViewReports: () => can('read', 'report'),
    canViewFinancialReports: () => can('financial', 'report'),

    // Utilisateurs
    canViewUsers: () => can('read', 'user'),
    canManageUsers: () => can('manage', 'user'),

    // Paramètres
    canViewSettings: () => can('read', 'setting'),
    canManageSettings: () => can('manage', 'setting'),

    // Équipes
    canViewTeams: () => can('read', 'team'),
    canManageTeams: () => can('manage', 'team'),

    // Abonnements
    canViewSubscriptions: () => can('read', 'subscription'),
    canManageSubscriptions: () => can('manage', 'subscription'),

    // Dashboard
    canViewDashboard: () => can('read', 'dashboard'),
  };

  return {
    can,
    hasMinimumRole,
    ...permissions,
  };
};