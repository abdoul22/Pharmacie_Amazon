import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, CreditCard, Package } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContextSimple';
import ProfileDropdown from './ProfileDropdown';
import DarkModeToggle from './DarkModeToggle';
import useDarkMode from '@/hooks/useDarkMode';

/**
 * Composant de navigation simplifié avec menu profil
 */
const NavigationSimple: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const { theme, setTheme } = useDarkMode();

  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">🏥 Amazon Pharmacie</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              <Link to="/auth/login">
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                  Se connecter
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/app/pharmacy" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">🏥 Amazon Pharmacie</span>
            </Link>
          </div>

          {/* Navigation et Profil */}
          <div className="flex items-center space-x-4">
            {/* Navigation rapide (desktop seulement) */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link to="/app/pharmacy">
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-800">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/app/payments">
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-800">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Paiements
                </Button>
              </Link>
              <Link to="/app/stock">
                <Button variant="ghost" size="sm" className="dark:text-gray-300 dark:hover:bg-gray-800">
                  <Package className="mr-2 h-4 w-4" />
                  Stock
                </Button>
              </Link>
            </div>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Menu Profil Dropdown */}
            <ProfileDropdown 
              darkMode={theme} 
              onThemeChange={setTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSimple;
