import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  ShoppingCart,
  UserCog,
  Settings,
  Shield,
  BarChart3,
  FileText,
  CreditCard,
  Truck,
  Pill
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NavigationSimple from '@/components/NavigationSimple';
import { useAuthContext } from '@/contexts/AuthContextSimple';

/**
 * Page principale du dashboard pharmacie
 */
const PharmacyDashboardPage: React.FC = () => {
  // Utiliser le context d'authentification
  const { user } = useAuthContext();
  
  // Données mock temporaires (éviter les appels API pour le moment)
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const dashboardData = {
    overview: {
      total_products: 125,
      total_categories: 8,
      total_suppliers: 12,
      stock_value: {
        amount: 2850000,
        formatted: '2,850,000 MRU'
      }
    },
    alerts: {
      low_stock: 5,
      near_expiry: 3,
      out_of_stock: 2
    },
    recent_movements: [
      {
        id: 1,
        product_name: 'Paracétamol 500mg',
        type: 'in' as const,
        quantity: 50,
        user_name: 'Admin',
        created_at: '2025-09-25 14:30',
        reference: 'MOV-001'
      }
    ],
    top_products: [
      {
        product_name: 'Paracétamol 500mg',
        total_sold: 25,
        current_stock: 150
      }
    ],
    sales_stats: [],
    quick_actions: [
      {
        id: 'stock',
        label: 'Gestion Stock',
        icon: 'package',
        route: '/app/stock',
        color: 'bg-blue-500'
      },
      {
        id: 'payments',
        label: 'Paiements',
        icon: 'credit-card',
        route: '/app/payments',
        color: 'bg-green-500'
      }
    ],
    currency: 'MRU',
    last_updated: '2025-09-25 14:35'
  };
  
  const refresh = () => {
    console.log('Refresh dashboard data');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Erreur de chargement</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refresh} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Aucune donnée disponible</CardTitle>
            <CardDescription>Le dashboard ne peut pas être affiché pour le moment.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { overview, alerts, recent_movements, top_products, quick_actions } = dashboardData;

  // Définir les modules selon le rôle
  const getRoleModules = () => {
    const baseModules = [
      {
        title: 'Gestion Stock',
        description: 'Gérer les produits et le stock',
        icon: Package,
        color: 'bg-blue-500',
        link: '/app/stock',
        stats: `${overview.total_products} produits`
      },
      {
        title: 'Ventes',
        description: 'Point de vente et historique',
        icon: ShoppingCart,
        color: 'bg-green-500',
        link: '/app/sales',
        stats: 'Point de vente'
      }
    ];

    // Modules spécifiques selon le rôle
    switch (user?.role) {
      case 'superadmin':
        return [
          {
            title: 'Gestion Utilisateurs',
            description: 'Approuver, créer et gérer tous les comptes',
            icon: UserCog,
            color: 'bg-purple-500',
            link: '/app/user-management',
            stats: 'Gestion complète'
          },
          {
            title: 'Configuration Système',
            description: 'Paramètres avancés et configuration',
            icon: Settings,
            color: 'bg-gray-600',
            link: '/app/admin/system-config',
            stats: 'Configuration'
          },
          ...baseModules
        ];
      
      case 'admin':
        return [
          {
            title: 'Rapports & Analytics',
            description: 'Tableaux de bord et analyses',
            icon: BarChart3,
            color: 'bg-indigo-500',
            link: '/app/reports',
            stats: 'Analyses'
          },
          {
            title: 'Configuration',
            description: 'Paramètres de l\'application',
            icon: Settings,
            color: 'bg-gray-600',
            link: '/app/admin/config',
            stats: 'Paramètres'
          },
          ...baseModules
        ];
      
      case 'pharmacien':
        return [
          {
            title: 'Prescriptions',
            description: 'Gérer les ordonnances',
            icon: FileText,
            color: 'bg-red-500',
            link: '/app/prescriptions',
            stats: 'Ordonnances'
          },
          {
            title: 'Produits Pharmaceutiques',
            description: 'Gestion des médicaments',
            icon: Pill,
            color: 'bg-blue-600',
            link: '/app/products',
            stats: 'Médicaments'
          },
          ...baseModules
        ];
      
      case 'vendeur':
        return [
          {
            title: 'Point de Vente',
            description: 'Interface de vente',
            icon: ShoppingCart,
            color: 'bg-green-500',
            link: '/app/sales/pos',
            stats: 'Ventes'
          },
          {
            title: 'Clients',
            description: 'Gestion des clients',
            icon: Users,
            color: 'bg-cyan-500',
            link: '/app/customers',
            stats: 'Clients'
          },
          ...baseModules
        ];
      
      case 'caissier':
        return [
          {
            title: 'Paiements',
            description: 'Gérer les paiements et encaissements',
            icon: CreditCard,
            color: 'bg-yellow-500',
            link: '/app/payments',
            stats: 'Paiements'
          },
          {
            title: 'Rapports Financiers',
            description: 'Rapports de caisse',
            icon: BarChart3,
            color: 'bg-indigo-500',
            link: '/app/reports/financial',
            stats: 'Finances'
          },
          ...baseModules
        ];
      
      default:
        return baseModules;
    }
  };

  const roleModules = getRoleModules();


  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard {user?.role === 'superadmin' ? 'SuperAdmin' : 
                     user?.role === 'admin' ? 'Administration' :
                     user?.role === 'pharmacien' ? 'Pharmacien' :
                     user?.role === 'vendeur' ? 'Vendeur' :
                     user?.role === 'caissier' ? 'Caissier' : 'Pharmacie'}
          </h1>
          <p className="text-muted-foreground">
            Bienvenue {user?.name} - {dashboardData.last_updated}
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <Activity className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_products}</div>
            <p className="text-xs text-muted-foreground">
              {overview.total_categories} catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.stock_value.formatted}</div>
            <p className="text-xs text-muted-foreground">
              {overview.total_suppliers} fournisseurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alerts.low_stock}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.out_of_stock} en rupture
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Péremption Proche</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.near_expiry}</div>
            <p className="text-xs text-muted-foreground">
              Nécessite attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modules selon le rôle */}
      <Card>
        <CardHeader>
          <CardTitle>Modules Disponibles</CardTitle>
          <CardDescription>Fonctionnalités adaptées à votre rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleModules.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <Link key={index} to={module.link}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${module.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{module.title}</h3>
                          <p className="text-xs text-muted-foreground">{module.description}</p>
                          <p className="text-xs font-medium text-primary mt-1">{module.stats}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mouvements récents */}
        <Card>
          <CardHeader>
            <CardTitle>Mouvements Récents</CardTitle>
            <CardDescription>Dernières entrées et sorties de stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent_movements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      movement.type === 'in' ? 'bg-green-500' : 
                      movement.type === 'out' ? 'bg-red-500' : 
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{movement.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.user_name} - {movement.created_at}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      movement.type === 'in' ? 'default' : 
                      movement.type === 'out' ? 'destructive' : 
                      'secondary'
                    }>
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {recent_movements.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun mouvement récent
                </p>
              )}
              
              {recent_movements.length > 5 && (
                <div className="pt-2">
                  <Link to="/app/pharmacy/movements">
                    <Button variant="ghost" size="sm" className="w-full">
                      Voir tous les mouvements
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Produits les plus vendus */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produits</CardTitle>
            <CardDescription>Produits les plus vendus cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top_products.slice(0, 5).map((product, index) => (
                <div key={product.product_name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.current_stock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {product.total_sold} vendus
                    </Badge>
                  </div>
                </div>
              ))}
              
              {top_products.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune vente enregistrée
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
