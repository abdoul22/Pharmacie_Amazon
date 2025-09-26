import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Page d'accueil simple
 */
const WelcomeSimplePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            🏥 Amazon Pharmacie SPA
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Application de gestion de pharmacie moderne - React Router + Laravel API
          </p>
          
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-bold">✅ SPA React Router Fonctionnel</p>
              <p>La navigation entre les pages fonctionne correctement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Link 
                to="/auth/login" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-center block transition-colors"
              >
                🔐 Se Connecter
              </Link>
              
              <Link 
                to="/auth/register" 
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-center block transition-colors"
              >
                📝 S'Inscrire  
              </Link>
              
              <Link 
                to="/app/payments" 
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg text-center block transition-colors"
              >
                💳 Test Paiements
              </Link>
            </div>
          </div>

          <div className="mt-12 p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-4">📊 Test de Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <Link to="/app/stock" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
                📦 Stock
              </Link>
              <Link to="/app/categories" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
                📂 Catégories
              </Link>
              <Link to="/app/suppliers" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
                🚚 Fournisseurs
              </Link>
              <Link to="/app/products" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">
                💊 Produits
              </Link>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>URL actuelle: <code>{window.location.href}</code></p>
            <p>Mode: React SPA avec Laravel API Backend</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSimplePage;
