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

// User Management
import UserManagement from '../pages/user-management/UserManagement';

// Test Page
import TestPage from '../pages/TestPage';

// Contexts et hooks
import { AuthProvider, useAuthContext } from '../contexts/AuthContextSimple';
import SessionManager from '../components/SessionManager';

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
    return <Navigate to="/app/pharmacy" replace />;
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
          {/* Redirection par défaut vers le dashboard pharmacie */}
          <Route index element={<Navigate to="pharmacy" replace />} />

          {/* 🏥 MODULE PHARMACIE - Dashboard principal avec gestion des rôles */}
          <Route path="pharmacy" element={<PharmacyDashboardPage />} />

          {/* 👥 Gestion des Utilisateurs (SuperAdmin uniquement) */}
          <Route path="user-management" element={
            <ProtectedRoute requiredRoles={['superadmin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          {/* 🧪 Page de Test */}
          <Route path="test" element={<TestPage />} />

          {/* 💳 Module Paiements - accès Admin+ */}
          <Route path="payments">
            <Route index element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <PaymentsIndexPage />
              </ProtectedRoute>
            } />
            <Route path="create" element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <PaymentsCreatePage />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <PaymentsShowPage />
              </ProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
                <PaymentsEditPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* 🛒 Module Ventes - accès Vendeur/Caissier/Admin/SuperAdmin */}
          <Route path="sales">
            <Route index element={
              <ProtectedRoute requiredRoles={["vendeur", "caissier", "admin", "superadmin"]}>
                <SalesIndexPage />
              </ProtectedRoute>
            } />
            <Route path="pos" element={
              <ProtectedRoute requiredRoles={["vendeur", "caissier", "admin", "superadmin"]}>
                <POSPage />
              </ProtectedRoute>
            } />
            <Route path="history" element={
              <ProtectedRoute requiredRoles={["vendeur", "caissier", "admin", "superadmin"]}>
                <SalesHistoryPage />
              </ProtectedRoute>
            } />
            {/* TODO: returns, reports avec protection */}
          </Route>

          {/* 📦 Module Stock - accès Pharmacien/Admin/SuperAdmin */}
          <Route path="stock">
            <Route index element={
              <ProtectedRoute requiredRoles={["pharmacien", "admin", "superadmin"]}>
                <StockIndexPage />
              </ProtectedRoute>
            } />
            <Route path="create" element={
              <ProtectedRoute requiredRoles={["pharmacien", "admin", "superadmin"]}>
                <StockCreatePage />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute requiredRoles={["pharmacien", "admin", "superadmin"]}>
                <StockShowPage />
              </ProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <ProtectedRoute requiredRoles={["pharmacien", "admin", "superadmin"]}>
                <StockEditPage />
              </ProtectedRoute>
            } />
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
        <Route path="/settings/*" element={<Navigate to="/app/settings/profile" replace />} />

        {/* Route 404 */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page non trouvée</p>
              <a
                href="/app/pharmacy"
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
 * Router principal avec AuthProvider et SessionManager
 */
const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <SessionManager
        config={{
          inactivityTimeoutMinutes: 60, // 1 heure d'inactivité
          warningTimeoutMinutes: 5,     // 5 minutes d'avertissement
          disabled: false,              // Activer le gestionnaire
        }}
      >
        <AppRouterContent />
      </SessionManager>
    </AuthProvider>
  );
};

export default AppRouter;
