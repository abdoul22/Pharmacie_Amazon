import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Test Page
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Si vous voyez cette page avec un fond blanc et du texte noir, le thème fonctionne correctement.
          </p>
          <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded">
            <p className="text-blue-800 dark:text-blue-200">
              Cette boîte bleue devrait être visible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
