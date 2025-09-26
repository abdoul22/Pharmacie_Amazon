import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContextSimple';
import {
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Home,
  CreditCard,
  Package,
  FileText,
  Shield,
  BarChart3,
  Users,
  Building2,
  Pill,
  Calendar,
  Bell,
  HelpCircle,
  ShoppingCart,
} from 'lucide-react';

interface ProfileDropdownProps {
  darkMode?: 'light' | 'dark' | 'system';
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
  darkMode = 'system', 
  onThemeChange 
}) => {
  const { user, logout, hasAnyRole } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      case 'admin': return 'bg-orange-500 text-white';
      case 'pharmacien': return 'bg-blue-500 text-white';
      case 'vendeur': return 'bg-green-500 text-white';
      case 'caissier': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Administrateur';
      case 'pharmacien': return 'Pharmacien';
      case 'vendeur': return 'Vendeur';
      case 'caissier': return 'Caissier';
      default: return role;
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none">
          {/* Avatar seulement - pas de texte */}
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff`} />
            <AvatarFallback className="bg-blue-500 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        {/* Header utilisateur */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff`} />
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              <Badge className={`text-xs mt-1 ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Principale */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </DropdownMenuLabel>
          
          <DropdownMenuItem asChild>
            <Link to="/app/pharmacy" className="flex items-center space-x-3 p-2 cursor-pointer">
              <Home className="h-4 w-4 text-blue-600" />
              <span>Dashboard Pharmacie</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/app/sales" className="flex items-center space-x-3 p-2 cursor-pointer">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span>Point de Vente</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/app/payments" className="flex items-center space-x-3 p-2 cursor-pointer">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span>Modes de Paiement</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/app/stock" className="flex items-center space-x-3 p-2 cursor-pointer">
              <Package className="h-4 w-4 text-orange-600" />
              <span>Gestion Stock</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/app/products" className="flex items-center space-x-3 p-2 cursor-pointer">
              <Pill className="h-4 w-4 text-purple-600" />
              <span>Produits & Médicaments</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Modules Avancés (selon rôle) */}
        {hasAnyRole(['admin', 'superadmin', 'pharmacien']) && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Gestion Avancée
              </DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link to="/app/categories" className="flex items-center space-x-3 p-2 cursor-pointer">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <span>Catégories</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/app/suppliers" className="flex items-center space-x-3 p-2 cursor-pointer">
                  <Users className="h-4 w-4 text-teal-600" />
                  <span>Fournisseurs</span>
                </Link>
              </DropdownMenuItem>

              {hasAnyRole(['admin', 'superadmin', 'pharmacien']) && (
                <DropdownMenuItem asChild>
                  <Link to="/app/insurance" className="flex items-center space-x-3 p-2 cursor-pointer">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Assurances CNAM</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {hasAnyRole(['pharmacien', 'admin', 'superadmin']) && (
                <DropdownMenuItem asChild>
                  <Link to="/app/prescriptions" className="flex items-center space-x-3 p-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>Ordonnances</span>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link to="/app/movements" className="flex items-center space-x-3 p-2 cursor-pointer">
                  <BarChart3 className="h-4 w-4 text-yellow-600" />
                  <span>Mouvements Stock</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        {/* Paramètres */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Paramètres
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link to="/app/settings/profile" className="flex items-center space-x-3 p-2 cursor-pointer">
              <User className="h-4 w-4 text-gray-600" />
              <span>Mon Profil</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/app/settings/password" className="flex items-center space-x-3 p-2 cursor-pointer">
              <Settings className="h-4 w-4 text-gray-600" />
              <span>Mot de Passe</span>
            </Link>
          </DropdownMenuItem>

          {/* Dark Mode Toggle */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">
              Apparence
            </DropdownMenuLabel>
            
            <DropdownMenuItem 
              onClick={() => onThemeChange?.('light')}
              className="flex items-center space-x-3 p-2 cursor-pointer"
            >
              <Sun className="h-4 w-4 text-yellow-500" />
              <span>Mode Clair</span>
              {darkMode === 'light' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => onThemeChange?.('dark')}
              className="flex items-center space-x-3 p-2 cursor-pointer"
            >
              <Moon className="h-4 w-4 text-blue-500" />
              <span>Mode Sombre</span>
              {darkMode === 'dark' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => onThemeChange?.('system')}
              className="flex items-center space-x-3 p-2 cursor-pointer"
            >
              <Monitor className="h-4 w-4 text-gray-500" />
              <span>Système</span>
              {darkMode === 'system' && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Support */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center space-x-3 p-2 cursor-pointer">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span>Aide & Support</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center space-x-3 p-2 cursor-pointer">
            <Bell className="h-4 w-4 text-green-600" />
            <span>Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Déconnexion */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center space-x-3 p-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
