import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../layouts/app-layout';
import AuthLayout from '../layouts/auth-layout';

// Pages d'authentification avec shadcn/ui
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';

// Page de debug
import DebugAuthPage from '../pages/debug-auth';

// Pages principales
import WelcomePharmacyPage from '../pages/welcome-pharmacy';

// Pages Settings
import SettingsProfilePage from '../pages/settings/profile';
import SettingsPasswordPage from '../pages/settings/password';
import SettingsAppearancePage from '../pages/settings/appearance';

// Pages Pharmacy Dashboard
import PharmacyDashboardPage from '../pages/modules/dashboard/index';

// Pages des modules - Structure CRUD
import PaymentsTestPage from '../pages/modules/payments/test';  // Version test simple
import PaymentsIndexPage from '../pages/modules/payments/index';
import PaymentsCreatePage from '../pages/modules/payments/create';
import PaymentsShowPage from '../pages/modules/payments/show';
import PaymentsEditPage from '../pages/modules/payments/edit';

import StockIndexPage from '../pages/modules/stock/index';
import StockCreatePage from '../pages/modules/stock/create';
import StockShowPage from '../pages/modules/stock/show';
import StockEditPage from '../pages/modules/stock/edit';

// Pages Sales - Point de Vente
import SalesIndexPage from '../pages/modules/sales/index';
import POSPage from '../pages/modules/sales/pos';
import SalesHistoryPage from '../pages/modules/sales/history';

// Placeholder pages (à implémenter)
import CategoriesIndexPage from '../pages/modules/categories/index';
import SuppliersIndexPage from '../pages/modules/suppliers/index';
import ProductsIndexPage from '../pages/modules/products/index';
import MovementsIndexPage from '../pages/modules/movements/index';
import InsuranceIndexPage from '../pages/modules/insurance/index';
import PrescriptionsIndexPage from '../pages/modules/prescriptions/index';

// Contexts et hooks
import { AuthProvider, useAuthContext } from '../contexts/AuthContextSimple';

// Route Guard pour les pages protégées
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl">
        Accès refusé. Vous n'avez pas les permissions nécessaires.
      </div>
    );
  }

  return <>{children}</>;
};

// Route Guard pour les pages d'authentification (redirection si déjà connecté)
interface AuthOnlyRouteProps {
  children: React.ReactNode;
}

const AuthOnlyRoute: React.FC<AuthOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Composant interne du Router (avec Context disponible)
 */
const AppRouterContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil moderne pour pharmacie */}
        <Route path="/" element={<WelcomePharmacyPage />} />

            {/* Routes d'authentification avec shadcn/ui */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Route de debug */}
            <Route path="/debug/auth" element={<DebugAuthPage />} />

        {/* Routes compatibilité (redirection vers /auth) */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

        {/* Routes protégées avec authentification */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard général - placeholder */}
          <Route path="dashboard" element={
            <div className="p-6">
              <h1 className="text-3xl font-bold">📊 Dashboard</h1>
              <p>Dashboard principal en développement</p>
            </div>
          } />

          {/* 🏥 MODULE PHARMACIE - Structure CRUD */}
          
          {/* Dashboard pharmacie */}
          <Route path="pharmacy" element={<PharmacyDashboardPage />} />
          
          {/* 💳 Module Paiements */}
          <Route path="payments">
            <Route index element={<PaymentsIndexPage />} />
            <Route path="create" element={<PaymentsCreatePage />} />
            <Route path=":id" element={<PaymentsShowPage />} />
            <Route path=":id/edit" element={<PaymentsEditPage />} />
          </Route>
          
          {/* 🛒 Module Ventes - Point de Vente */}
          <Route path="sales">
            <Route index element={<SalesIndexPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="history" element={<SalesHistoryPage />} />
            {/* TODO: Ajouter returns, reports */}
          </Route>
          
          {/* 📦 Module Stock */}
          <Route path="stock">
            <Route index element={<StockIndexPage />} />
            <Route path="create" element={<StockCreatePage />} />
            <Route path=":id" element={<StockShowPage />} />
            <Route path=":id/edit" element={<StockEditPage />} />
          </Route>
          
          {/* 📂 Module Catégories */}
          <Route path="categories">
            <Route index element={<CategoriesIndexPage />} />
            {/* TODO: Ajouter create, show, edit */}
          </Route>
          
          {/* 🚚 Module Fournisseurs */}
          <Route path="suppliers">
            <Route index element={<SuppliersIndexPage />} />
            {/* TODO: Ajouter create, show, edit */}
          </Route>
          
          {/* 💊 Module Produits */}
          <Route path="products">
            <Route index element={<ProductsIndexPage />} />
            {/* TODO: Ajouter create, show, edit */}
          </Route>
          
          {/* 📊 Module Mouvements */}
          <Route path="movements">
            <Route index element={<MovementsIndexPage />} />
            {/* TODO: Ajouter create, show, edit */}
          </Route>
          
          {/* 🛡️ Module Assurances (Admin+ seulement) */}
          <Route path="insurance">
            <Route index element={
              <ProtectedRoute requiredRoles={['admin', 'superadmin', 'pharmacien']}>
                <InsuranceIndexPage />
              </ProtectedRoute>
            } />
            {/* TODO: Ajouter create, show, edit avec protection */}
          </Route>
          
          {/* 📋 Module Prescriptions (Pharmacien+ seulement) */}
          <Route path="prescriptions">
            <Route index element={
              <ProtectedRoute requiredRoles={['pharmacien', 'admin', 'superadmin']}>
                <PrescriptionsIndexPage />
              </ProtectedRoute>
            } />
            {/* TODO: Ajouter create, show, edit avec protection */}
          </Route>
          
          {/* Redirection par défaut */}
          <Route index element={<Navigate to="pharmacy" replace />} />
        </Route>

        {/* Routes compatibilité (redirection vers /app) */}
        <Route path="/dashboard" element={<Navigate to="/app/pharmacy" replace />} />
        <Route path="/settings/*" element={<Navigate to="/app/settings/profile" replace />} />

        {/* Route 404 */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page non trouvée</p>
              <a 
                href="/app/dashboard" 
                className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retour au tableau de bord
              </a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

/**
 * Router principal avec AuthProvider
 */
const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouterContent />
    </AuthProvider>
  );
};

export default AppRouter;
