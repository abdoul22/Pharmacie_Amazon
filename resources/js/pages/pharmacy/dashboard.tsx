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
  ShoppingCart
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { PharmacyService, type DashboardData } from '@/api/services/pharmacy';
import { Link } from 'react-router-dom';

/**
 * Page principale du dashboard pharmacie
 */
const PharmacyDashboardPage: React.FC = () => {
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refresh
  } = useApi<DashboardData>(PharmacyService.getDashboard, { immediate: true });

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

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Pharmacie</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre pharmacie - {dashboardData.last_updated}
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

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quick_actions.map((action) => (
              <Link key={action.id} to={action.route}>
                <Button 
                  variant="outline" 
                  className={`w-full justify-start h-auto p-4 ${action.color}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <Package className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Button>
              </Link>
            ))}
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
