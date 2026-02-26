import { UserRole, Permission } from './api/users.service';

export const rolePermissionsMap: Record<UserRole, string[]> = {
  admin: [
    'view_dashboard',
    'view_pos',
    'create_sale',
    'view_sales',
    'cancel_sale',
    'view_products',
    'create_product',
    'edit_product',
    'delete_product',
    'view_stock',
    'manage_stock',
    'view_categories',
    'manage_categories',
    'view_customers',
    'create_customer',
    'edit_customer',
    'delete_customer',
    'view_invoices',
    'create_invoice',
    'edit_invoice',
    'delete_invoice',
    'view_expenses',
    'create_expense',
    'approve_expense',
    'view_reports',
    'export_reports',
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'reset_user_password',
    'view_settings',
    'edit_settings',
    'view_subscriptions',
    'manage_subscriptions',
  ],
  manager: [
    'view_dashboard',
    'view_pos',
    'create_sale',
    'view_sales',
    'view_products',
    'create_product',
    'edit_product',
    'view_stock',
    'manage_stock',
    'view_categories',
    'manage_categories',
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_invoices',
    'create_invoice',
    'edit_invoice',
    'view_expenses',
    'create_expense',
    'view_reports',
    'export_reports',
    'view_settings',
  ],
  cashier: [
    'view_dashboard',
    'view_pos',
    'create_sale',
    'view_sales',
    'view_products',
    'view_customers',
    'create_customer',
    'view_invoices',
    'create_invoice',
  ],
  accountant: [
    'view_dashboard',
    'view_sales',
    'view_products',
    'view_stock',
    'view_customers',
    'view_invoices',
    'view_expenses',
    'approve_expense',
    'view_reports',
    'export_reports',
    'view_subscriptions',
  ],
};

export const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full access to all features including user management and system settings',
  manager: 'Manage products, stock, sales, customers, and view reports',
  cashier: 'Access to point of sale, create sales, and manage customers',
  accountant: 'View financial data, approve expenses, and generate reports',
};

export const permissionCategories = {
  dashboard: 'Dashboard',
  sales: 'Sales & POS',
  products: 'Products',
  stock: 'Stock Management',
  categories: 'Categories',
  customers: 'Customers',
  invoices: 'Invoices',
  expenses: 'Expenses',
  reports: 'Reports',
  users: 'User Management',
  settings: 'Settings',
  subscriptions: 'Subscriptions',
};

export const permissionDescriptions: Record<string, string> = {
  view_dashboard: 'Access dashboard with statistics and overview',
  view_pos: 'Access the point of sale interface',
  create_sale: 'Create new sales transactions',
  view_sales: 'View sales history and details',
  cancel_sale: 'Cancel or void existing sales',
  view_products: 'View product catalog',
  create_product: 'Add new products to inventory',
  edit_product: 'Modify existing product information',
  delete_product: 'Remove products from inventory',
  view_stock: 'View stock levels and movements',
  manage_stock: 'Add, remove, or adjust stock quantities',
  view_categories: 'View product categories',
  manage_categories: 'Create, edit, or delete categories',
  view_customers: 'View customer database',
  create_customer: 'Add new customers',
  edit_customer: 'Modify customer information',
  delete_customer: 'Remove customers from database',
  view_invoices: 'View invoices and billing',
  create_invoice: 'Generate new invoices',
  edit_invoice: 'Modify existing invoices',
  delete_invoice: 'Delete invoices',
  view_expenses: 'View expense records',
  create_expense: 'Record new expenses',
  approve_expense: 'Approve or reject expense requests',
  view_reports: 'Access reports and analytics',
  export_reports: 'Export reports to various formats',
  view_users: 'View user accounts',
  create_user: 'Create new user accounts',
  edit_user: 'Modify user information and roles',
  delete_user: 'Remove user accounts',
  reset_user_password: 'Reset passwords for users',
  view_settings: 'View system configuration',
  edit_settings: 'Modify system settings',
  view_subscriptions: 'View subscription status',
  manage_subscriptions: 'Manage subscription plans',
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return rolePermissionsMap[userRole]?.includes(permission) || false;
}

export function getUserPermissions(userRole: UserRole): string[] {
  return rolePermissionsMap[userRole] || [];
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, string> = {
    '/': 'view_dashboard',
    '/pos': 'view_pos',
    '/products': 'view_products',
    '/stock': 'view_stock',
    '/categories': 'view_categories',
    '/customers': 'view_customers',
    '/invoices': 'view_invoices',
    '/expenses': 'view_expenses',
    '/reports': 'view_reports',
    '/users': 'view_users',
    '/settings': 'view_settings',
    '/subscriptions': 'view_subscriptions',
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true;

  return hasPermission(userRole, requiredPermission);
}
