import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Package,
  Receipt,
  CreditCard,
  History
} from 'lucide-react';

/**
 * Page principale du module Sales - Point de Vente
 */
const SalesIndexPage: React.FC = () => {
  // Statistiques réelles (ou 0 si aucune donnée)
  const [salesStats, setSalesStats] = React.useState({
    today_sales: 0,
    today_revenue: 0,
    pending_transactions: 0,
    average_ticket: 0,
    top_products: [] as Array<{ name: string; quantity: number; revenue: number }>,
    payment_methods_today: { cash: 0, bankily: 0, masrivi: 0, sedad: 0 },
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        const mod = await import('@/api/client');
        const api = mod.apiClient;
        const json = await api.get('/pharmacy/sales-stats');
        const d: any = json?.data || {};
        setSalesStats((prev) => ({
          ...prev,
          today_sales: d?.today?.transactions ?? 0,
          today_revenue: d?.today?.revenue ?? 0,
          average_ticket: d?.today?.average_ticket ?? 0,
          pending_transactions: d?.today?.pending ?? 0,
          top_products: d?.top_products?.map((p: any) => ({
            name: p.product_name,
            quantity: p.total_sold,
            revenue: 0 // Pas de revenu dans l'API actuelle
          })) ?? [],
          payment_methods_today: d?.payment_methods?.reduce((acc: any, pm: any) => {
            acc[pm.method] = pm.count;
            return acc;
          }, { cash: 0, bankily: 0, masrivi: 0, sedad: 0 }) ?? prev.payment_methods_today,
        }));
      } catch (e) {
        console.warn('Stats POS indisponibles, affichage par défaut.');
      }
    };
    load();
  }, []);

  const quickActions = [
    {
      title: 'Nouvelle Vente',
      description: 'Lancer une nouvelle transaction',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      link: '/app/sales/pos'
    },
    {
      title: 'Historique Ventes',
      description: 'Voir toutes les ventes',
      icon: History,
      color: 'bg-green-500 hover:bg-green-600',
      link: '/app/sales/history'
    },
    {
      title: 'Retours',
      description: 'Gérer les retours produits',
      icon: Receipt,
      color: 'bg-orange-500 hover:bg-orange-600',
      link: '/app/sales/returns'
    },
    {
      title: 'Rapports',
      description: 'Rapports de vente',
      icon: TrendingUp,
      color: 'bg-purple-500 hover:bg-purple-600',
      link: '/app/sales/reports'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point de Vente</h1>
          <p className="text-muted-foreground">
            Interface de caisse et gestion des ventes
          </p>
        </div>
        <Link to="/app/sales/pos">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-5 w-5" />
            Nouvelle Vente
          </Button>
        </Link>
      </div>

      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Aujourd'hui</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.today_sales}</div>
            <p className="text-xs text-muted-foreground">Transactions réalisées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {salesStats.today_revenue.toLocaleString()} MRU
            </div>
            <p className="text-xs text-muted-foreground">Revenus du jour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Moyen</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {salesStats.average_ticket.toLocaleString()} MRU
            </div>
            <p className="text-xs text-muted-foreground">Par transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {salesStats.pending_transactions}
            </div>
            <p className="text-xs text-muted-foreground">Transactions suspendues</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités principales du point de vente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className={`p-3 rounded-full ${action.color} text-white mb-3`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-center mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produits les plus vendus */}
        <Card>
          <CardHeader>
            <CardTitle>Produits Populaires</CardTitle>
            <CardDescription>Top ventes du jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesStats.top_products.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity} unités vendues
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {product.revenue.toLocaleString()} MRU
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition des paiements */}
        <Card>
          <CardHeader>
            <CardTitle>Modes de Paiement</CardTitle>
            <CardDescription>Répartition des paiements du jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                  <span>Espèces</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{salesStats.payment_methods_today.cash}%</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <span>Bankily</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{salesStats.payment_methods_today.bankily}%</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                    <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <span>Masrivi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{salesStats.payment_methods_today.masrivi}%</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full">
                    <CreditCard className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </div>
                  <span>Sedad</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{salesStats.payment_methods_today.sedad}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesIndexPage;
