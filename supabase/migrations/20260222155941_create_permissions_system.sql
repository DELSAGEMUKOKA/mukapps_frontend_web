/*
  # Create permissions system for role-based access control

  1. New Tables
    - `permissions`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Permission identifier (e.g., 'manage_users', 'view_reports')
      - `description` (text) - Human-readable description
      - `category` (text) - Permission category (e.g., 'users', 'products', 'sales')
      - `created_at` (timestamptz)
    
    - `role_permissions`
      - `id` (uuid, primary key)
      - `role` (text) - User role
      - `permission_id` (uuid) - Reference to permissions table
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Only authenticated users can read permissions
    - Only admins can modify permissions
  
  3. Initial Data
    - Create standard permissions for the system
    - Assign permissions to roles
*/

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'accountant')),
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_id)
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

INSERT INTO permissions (name, description, category) VALUES
  ('view_dashboard', 'View dashboard and statistics', 'dashboard'),
  ('view_pos', 'Access point of sale', 'sales'),
  ('create_sale', 'Create new sales', 'sales'),
  ('view_sales', 'View sales history', 'sales'),
  ('cancel_sale', 'Cancel existing sales', 'sales'),
  ('view_products', 'View product list', 'products'),
  ('create_product', 'Create new products', 'products'),
  ('edit_product', 'Edit existing products', 'products'),
  ('delete_product', 'Delete products', 'products'),
  ('view_stock', 'View stock levels', 'stock'),
  ('manage_stock', 'Manage stock movements', 'stock'),
  ('view_categories', 'View product categories', 'categories'),
  ('manage_categories', 'Create/edit/delete categories', 'categories'),
  ('view_customers', 'View customer list', 'customers'),
  ('create_customer', 'Create new customers', 'customers'),
  ('edit_customer', 'Edit customer information', 'customers'),
  ('delete_customer', 'Delete customers', 'customers'),
  ('view_invoices', 'View invoices', 'invoices'),
  ('create_invoice', 'Create new invoices', 'invoices'),
  ('edit_invoice', 'Edit invoices', 'invoices'),
  ('delete_invoice', 'Delete invoices', 'invoices'),
  ('view_expenses', 'View expenses', 'expenses'),
  ('create_expense', 'Create new expenses', 'expenses'),
  ('approve_expense', 'Approve expenses', 'expenses'),
  ('view_reports', 'View reports and analytics', 'reports'),
  ('export_reports', 'Export reports', 'reports'),
  ('view_users', 'View user list', 'users'),
  ('create_user', 'Create new users', 'users'),
  ('edit_user', 'Edit user information', 'users'),
  ('delete_user', 'Delete users', 'users'),
  ('reset_user_password', 'Reset user passwords', 'users'),
  ('view_settings', 'View system settings', 'settings'),
  ('edit_settings', 'Edit system settings', 'settings'),
  ('view_subscriptions', 'View subscription information', 'subscriptions'),
  ('manage_subscriptions', 'Manage subscriptions', 'subscriptions')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  perm_id uuid;
BEGIN
  FOR perm_id IN 
    SELECT id FROM permissions
  LOOP
    INSERT INTO role_permissions (role, permission_id)
    VALUES ('admin', perm_id)
    ON CONFLICT (role, permission_id) DO NOTHING;
  END LOOP;

  INSERT INTO role_permissions (role, permission_id)
  SELECT 'manager', id FROM permissions 
  WHERE name IN (
    'view_dashboard', 'view_pos', 'create_sale', 'view_sales',
    'view_products', 'create_product', 'edit_product',
    'view_stock', 'manage_stock',
    'view_categories', 'manage_categories',
    'view_customers', 'create_customer', 'edit_customer',
    'view_invoices', 'create_invoice', 'edit_invoice',
    'view_expenses', 'create_expense',
    'view_reports', 'export_reports',
    'view_settings'
  )
  ON CONFLICT (role, permission_id) DO NOTHING;

  INSERT INTO role_permissions (role, permission_id)
  SELECT 'cashier', id FROM permissions 
  WHERE name IN (
    'view_dashboard', 'view_pos', 'create_sale', 'view_sales',
    'view_products', 'view_customers', 'create_customer',
    'view_invoices', 'create_invoice'
  )
  ON CONFLICT (role, permission_id) DO NOTHING;

  INSERT INTO role_permissions (role, permission_id)
  SELECT 'accountant', id FROM permissions 
  WHERE name IN (
    'view_dashboard', 'view_sales',
    'view_products', 'view_stock',
    'view_customers',
    'view_invoices', 'view_expenses', 'approve_expense',
    'view_reports', 'export_reports',
    'view_subscriptions'
  )
  ON CONFLICT (role, permission_id) DO NOTHING;
END $$;