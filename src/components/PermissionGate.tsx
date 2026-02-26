// src/components/PermissionGate.tsx

import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  action: string;
  resource: string;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  action,
  resource,
  fallback = null,
}) => {
  const { can } = usePermissions();

  if (!can(action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Version avec fonction de rendu conditionnel
 */
interface PermissionGateRenderProps {
  children: (hasPermission: boolean) => React.ReactNode;
  action: string;
  resource: string;
}

export const PermissionGateRender: React.FC<PermissionGateRenderProps> = ({
  children,
  action,
  resource,
}) => {
  const { can } = usePermissions();
  const hasPermission = can(action, resource);

  return <>{children(hasPermission)}</>;
};

/**
 * Composant pour cacher un élément si pas de permission
 */
export const ShowIfPermitted: React.FC<PermissionGateProps> = ({
  children,
  action,
  resource,
}) => {
  const { can } = usePermissions();

  if (!can(action, resource)) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Composant pour les permissions de produits
 */
export const ProductPermissionGate: React.FC<{
  action: 'create' | 'update' | 'delete' | 'read';
  children: React.ReactNode;
}> = ({ action, children }) => {
  return (
    <PermissionGate action={action} resource="product">
      {children}
    </PermissionGate>
  );
};

/**
 * Composant pour les permissions de clients
 */
export const CustomerPermissionGate: React.FC<{
  action: 'create' | 'update' | 'delete' | 'read';
  children: React.ReactNode;
}> = ({ action, children }) => {
  return (
    <PermissionGate action={action} resource="customer">
      {children}
    </PermissionGate>
  );
};

/**
 * Composant pour les permissions de factures
 */
export const InvoicePermissionGate: React.FC<{
  action: 'create' | 'cancel' | 'delete' | 'read';
  children: React.ReactNode;
}> = ({ action, children }) => {
  return (
    <PermissionGate action={action} resource="invoice">
      {children}
    </PermissionGate>
  );
};

/**
 * Composant pour les permissions de dépenses
 */
export const ExpensePermissionGate: React.FC<{
  action: 'create' | 'update' | 'approve' | 'delete' | 'read';
  children: React.ReactNode;
}> = ({ action, children }) => {
  return (
    <PermissionGate action={action} resource="expense">
      {children}
    </PermissionGate>
  );
};

export default PermissionGate;