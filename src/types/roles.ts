// src/types/roles.ts

/**
 * Types de rôles disponibles dans l'application
 */
export type UserRole = 'admin' | 'supervisor' | 'cashier' | 'operator';

/**
 * Interface pour les permissions
 */
export interface Permission {
  action: string;
  resource: string;
}

/**
 * Mapping des permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'create', resource: 'all' },
    { action: 'read', resource: 'all' },
    { action: 'update', resource: 'all' },
    { action: 'delete', resource: 'all' },
    { action: 'manage', resource: 'all' },
  ],
  supervisor: [
    { action: 'create', resource: 'product' },
    { action: 'read', resource: 'product' },
    { action: 'update', resource: 'product' },
    { action: 'create', resource: 'category' },
    { action: 'read', resource: 'category' },
    { action: 'update', resource: 'category' },
    { action: 'create', resource: 'customer' },
    { action: 'read', resource: 'customer' },
    { action: 'update', resource: 'customer' },
    { action: 'read', resource: 'report' },
    { action: 'create', resource: 'expense' },
    { action: 'approve', resource: 'expense' },
    { action: 'manage', resource: 'stock' },
    { action: 'manage', resource: 'team' },
  ],
  cashier: [
    { action: 'read', resource: 'product' },
    { action: 'read', resource: 'category' },
    { action: 'create', resource: 'customer' },
    { action: 'read', resource: 'customer' },
    { action: 'update', resource: 'customer' },
    { action: 'create', resource: 'invoice' },
    { action: 'read', resource: 'invoice' },
    { action: 'read', resource: 'stock' },
    { action: 'read', resource: 'dashboard' },
  ],
  operator: [
    { action: 'read', resource: 'product' },
    { action: 'read', resource: 'category' },
    { action: 'read', resource: 'customer' },
    { action: 'create', resource: 'invoice' },
    { action: 'read', resource: 'invoice' },
    { action: 'read', resource: 'stock' },
    { action: 'read', resource: 'dashboard' },
  ],
};

/**
 * Interface pour les routes protégées
 */
export interface ProtectedRouteProps {
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Constantes pour les noms de rôles
 */
export const ROLES = {
  ADMIN: 'admin' as UserRole,
  SUPERVISOR: 'supervisor' as UserRole,
  CASHIER: 'cashier' as UserRole,
  OPERATOR: 'operator' as UserRole,
};

/**
 * Hiérarchie des rôles (pour les comparaisons)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  supervisor: 80,
  cashier: 50,
  operator: 40,
};

/**
 * Vérifie si un rôle a un niveau supérieur ou égal à un autre
 */
export const hasRoleLevel = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Traductions des rôles pour l'affichage
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  supervisor: 'Superviseur',
  cashier: 'Caissier',
  operator: 'Opérateur',
};

/**
 * Couleurs pour les badges de rôle
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  supervisor: 'bg-blue-100 text-blue-800 border-blue-200',
  cashier: 'bg-green-100 text-green-800 border-green-200',
  operator: 'bg-purple-100 text-purple-800 border-purple-200',
};