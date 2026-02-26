// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages publiques
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Unauthorized } from './pages/Unauthorized';

// Pages protégées
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { POS } from './pages/POS';
import { Invoices } from './pages/Invoices';
import { Customers } from './pages/Customers';
import { Stock } from './pages/Stock';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Subscriptions } from './pages/Subscriptions';
import { Teams } from './pages/Teams';
import { Profile } from './pages/Profile';
import { PrintReceipt } from './pages/PrintReceipt';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ====================================================== */}
          {/* ROUTES PUBLIQUES - Accessibles sans authentification */}
          {/* ====================================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* ====================================================== */}
          {/* ROUTES PROTÉGÉES - Nécessitent authentification */}
          {/* ====================================================== */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Redirection par défaut */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* ================================================== */}
            {/* ✅ PAGES ACCESSIBLES À TOUS LES RÔLES */}
            {/* ================================================== */}
            {/* Dashboard - accessible à tous */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Point de vente - accessible à tous (les caissiers en ont besoin) */}
            <Route path="pos" element={<POS />} />
            
            {/* Factures - accessibles à tous */}
            <Route path="invoices" element={<Invoices />} />
            
            {/* Clients - accessibles à tous */}
            <Route path="customers" element={<Customers />} />
            
            {/* Stock - accessible à tous (consultation) */}
            <Route path="stock" element={<Stock />} />
            
            {/* Profil - accessible à tous */}
            <Route path="profile" element={<Profile />} />
            
            {/* Impression - accessible à tous */}
            <Route path="print-receipt" element={<PrintReceipt />} />
            
            {/* ================================================== */}
            {/* ✅ PAGES ACCESSIBLES À ADMIN ET SUPERVISOR UNIQUEMENT */}
            {/* ================================================== */}
            {/* Produits - admin et supervisor seulement */}
            <Route path="products" element={
              <ProtectedRoute requiredRole={['admin', 'supervisor']}>
                <Products />
              </ProtectedRoute>
            } />
            
            {/* Catégories - admin et supervisor seulement */}
            <Route path="categories" element={
              <ProtectedRoute requiredRole={['admin', 'supervisor']}>
                <Categories />
              </ProtectedRoute>
            } />
            
            {/* Dépenses - admin et supervisor seulement */}
            <Route path="expenses" element={
              <ProtectedRoute requiredRole={['admin', 'supervisor']}>
                <Expenses />
              </ProtectedRoute>
            } />
            
            {/* Équipes - admin et supervisor seulement */}
            <Route path="teams" element={
              <ProtectedRoute requiredRole={['admin', 'supervisor']}>
                <Teams />
              </ProtectedRoute>
            } />
            
            {/* Rapports - admin et supervisor seulement */}
            <Route path="reports" element={
              <ProtectedRoute requiredRole={['admin', 'supervisor']}>
                <Reports />
              </ProtectedRoute>
            } />
            
            {/* ================================================== */}
            {/* ✅ PAGES ACCESSIBLES À ADMIN UNIQUEMENT */}
            {/* ================================================== */}
            {/* Utilisateurs - admin seulement */}
            <Route path="users" element={
              <ProtectedRoute requiredRole={['admin']}>
                <Users />
              </ProtectedRoute>
            } />
            
            {/* Paramètres - admin seulement */}
            <Route path="settings" element={
              <ProtectedRoute requiredRole={['admin']}>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Abonnements - admin seulement */}
            <Route path="subscriptions" element={
              <ProtectedRoute requiredRole={['admin']}>
                <Subscriptions />
              </ProtectedRoute>
            } />
            
            {/* ================================================== */}
            {/* ❌ ROUTE POUR LES PAGES NON TROUVÉES */}
            {/* ================================================== */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;