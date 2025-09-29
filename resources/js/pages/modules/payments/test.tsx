import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Page de test simple pour les paiements
 */
const PaymentsTestPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🎉 Page Paiements Fonctionne !</h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">Succès !</p>
        <p>Le routing React fonctionne correctement.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tests de Navigation :</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Link to="/app/pharmacy" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center block">
            Dashboard
          </Link>
          <Link to="/app/stock" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-center block">
            Stock
          </Link>
          <Link to="/app/payments/create" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-center block">
            Créer Paiement
          </Link>
          <Link to="/app/pharmacy" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-center block">
            Dashboard Pharmacie
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Informations de Debug :</h3>
        <ul className="text-sm space-y-1">
          <li>• URL actuelle: {window.location.pathname}</li>
          <li>• React Router: ✅ Fonctionnel</li>
          <li>• SPA Mode: ✅ Activé</li>
          <li>• TailwindCSS: ✅ Chargé</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentsTestPage;
