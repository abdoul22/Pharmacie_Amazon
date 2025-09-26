import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance.tsx';

// Importation du Router principal
import AppRouter from './router/AppRouter';

const appName = import.meta.env.VITE_APP_NAME || 'Amazon Pharmacie';

// Créer l'application React avec React Router
const root = createRoot(document.getElementById('app')!);

root.render(<AppRouter />);

// Initialiser le thème dark/light
initializeTheme();
