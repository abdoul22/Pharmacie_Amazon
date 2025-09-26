import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Home } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContextSimple';

/**
 * Composant de navigation principal avec authentification
 */
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-blue-600">🏥 Amazon Pharmacie</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="outline">Se connecter</Button>
              </Link>
              <Link to="/auth/register">
                <Button>S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-600">🏥 Amazon Pharmacie</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation rapide */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/app/pharmacy">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/app/payments">
                <Button variant="ghost" size="sm">💳 Paiements</Button>
              </Link>
              <Link to="/app/stock">
                <Button variant="ghost" size="sm">📦 Stock</Button>
              </Link>
            </div>

            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Rôle: {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings/profile" className="w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="w-full flex items-center text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
