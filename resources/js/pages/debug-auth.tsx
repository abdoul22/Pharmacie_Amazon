import React from 'react';
import { useAuthContext } from '@/contexts/AuthContextSimple';

const DebugAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthContext();

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug Authentification</h1>
        
        <div className="grid gap-6">
          {/* État de chargement */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">État de chargement</h2>
            <p>isLoading: <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>
              {isLoading ? '⏳ Oui' : '✅ Non'}
            </span></p>
          </div>

          {/* État d'authentification */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">État d'authentification</h2>
            <p>isAuthenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? '✅ Connecté' : '❌ Non connecté'}
            </span></p>
          </div>

          {/* Erreurs */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">Erreur</h2>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Utilisateur */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Utilisateur</h2>
            {user ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Nom:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rôle:</strong> {user.role}</p>
                <p><strong>Vérifié:</strong> {user.email_verified_at ? '✅' : '❌'}</p>
              </div>
            ) : (
              <p className="text-gray-500">Aucun utilisateur connecté</p>
            )}
          </div>

          {/* Tokens de stockage */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tokens de stockage</h2>
            <div className="space-y-2">
              <p><strong>localStorage token:</strong> {localStorage.getItem('auth_token') ? '✅ Présent' : '❌ Absent'}</p>
              <p><strong>sessionStorage token:</strong> {sessionStorage.getItem('auth_token') ? '✅ Présent' : '❌ Absent'}</p>
              {localStorage.getItem('auth_token') && (
                <p><strong>Token value:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                  {localStorage.getItem('auth_token')?.substring(0, 20)}...
                </code></p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions de test</h2>
            <div className="space-x-4">
              <button
                onClick={() => {
                  localStorage.setItem('auth_token', 'test-token-' + Date.now());
                  window.location.reload();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ajouter token test
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  sessionStorage.removeItem('auth_token');
                  window.location.reload();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Supprimer tokens
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuthPage;
