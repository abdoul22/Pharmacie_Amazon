import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Receipt, 
  Search, 
  Eye, 
  RefreshCw,
  Calendar,
  DollarSign,
  User,
  Filter
} from 'lucide-react';

// Types pour l'historique des ventes
interface Sale {
  id: number;
  date: string;
  time: string;
  total: number;
  items_count: number;
  payment_method: string;
  customer_phone?: string;
  cashier: string;
  status: 'completed' | 'refunded' | 'partial_refund';
}

/**
 * Page historique des ventes
 */
const SalesHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Données mock des ventes
  const sales: Sale[] = [
    {
      id: 1001,
      date: '2025-09-25',
      time: '14:35',
      total: 2500,
      items_count: 3,
      payment_method: 'Bankily',
      customer_phone: '+222 XX XX 12 34',
      cashier: 'Admin Test',
      status: 'completed'
    },
    {
      id: 1002,
      date: '2025-09-25',
      time: '14:20',
      total: 850,
      items_count: 1,
      payment_method: 'Espèces',
      cashier: 'Admin Test',
      status: 'completed'
    },
    {
      id: 1003,
      date: '2025-09-25',
      time: '13:45',
      total: 4200,
      items_count: 5,
      payment_method: 'Masrivi',
      customer_phone: '+222 XX XX 56 78',
      cashier: 'Admin Test',
      status: 'refunded'
    },
    {
      id: 1004,
      date: '2025-09-25',
      time: '12:30',
      total: 1800,
      items_count: 2,
      payment_method: 'Sedad',
      customer_phone: '+222 XX XX 90 12',
      cashier: 'Vendeur Test',
      status: 'completed'
    },
    {
      id: 1005,
      date: '2025-09-25',
      time: '11:15',
      total: 3600,
      items_count: 4,
      payment_method: 'Espèces',
      cashier: 'Admin Test',
      status: 'partial_refund'
    }
  ];

  const filteredSales = sales.filter(sale =>
    sale.id.toString().includes(searchTerm) ||
    sale.customer_phone?.includes(searchTerm) ||
    sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Terminée</Badge>;
      case 'refunded':
        return <Badge variant="destructive">Remboursée</Badge>;
      case 'partial_refund':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Remb. Partiel</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'espèces':
        return 'text-green-600';
      case 'bankily':
        return 'text-blue-600';
      case 'masrivi':
        return 'text-purple-600';
      case 'sedad':
        return 'text-red-600';
      case 'click':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalSales = filteredSales.filter(s => s.status === 'completed').length;
  const totalRevenue = filteredSales
    .filter(s => s.status === 'completed')
    .reduce((sum, sale) => sum + sale.total, 0);
  const refundedSales = filteredSales.filter(s => s.status === 'refunded').length;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Ventes</h1>
          <p className="text-muted-foreground">
            Consultez toutes les transactions effectuées
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Terminées</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Transactions réussies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString()} MRU
            </div>
            <p className="text-xs text-muted-foreground">Revenus totaux</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remboursements</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{refundedSales}</div>
            <p className="text-xs text-muted-foreground">Ventes remboursées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Moyen</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSales > 0 ? Math.round(totalRevenue / totalSales).toLocaleString() : 0} MRU
            </div>
            <p className="text-xs text-muted-foreground">Par transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par numéro de vente, téléphone ou mode de paiement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredSales.length})</CardTitle>
          <CardDescription>
            Historique complet des ventes avec détails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Vente #{sale.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sale.date} à {sale.time} • {sale.items_count} articles
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-muted-foreground">{sale.cashier}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className={`font-semibold ${getPaymentMethodColor(sale.payment_method)}`}>
                      {sale.payment_method}
                    </div>
                    {sale.customer_phone && (
                      <div className="text-xs text-muted-foreground">
                        {sale.customer_phone}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="font-semibold text-lg">{sale.total.toLocaleString()} MRU</div>
                    <div className="text-xs text-muted-foreground">Total TTC</div>
                  </div>

                  <div className="text-center">
                    {getStatusBadge(sale.status)}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredSales.length === 0 && (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Aucune vente trouvée
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Aucune vente ne correspond à votre recherche.' : 'Aucune vente enregistrée.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistoryPage;
