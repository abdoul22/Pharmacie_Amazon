import React from 'react';
import { useAuthContext } from '@/contexts/AuthContextSimple';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Eye,
  Edit
} from 'lucide-react';

interface StockItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit_price: number;
  selling_price: number;
  supplier: string;
  expiry_date?: string;
  batch_number?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

/**
 * Page principale du module Stock - Liste des produits en stock
 */
const StockIndexPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  const [stockItems, setStockItems] = React.useState<StockItem[]>([]);

  React.useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    const load = async () => {
      try {
        const mod = await import('@/api/client');
        const api = mod.apiClient;
        const json = await api.get('/stock/products');
        if (json?.success && Array.isArray(json.data)) {
          const mapped: StockItem[] = (json.data as any[]).map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category?.name || '—',
            current_stock: Math.max(0, p.current_stock ?? p.initial_stock ?? 0), // Ne pas afficher de stock négatif
            min_stock: p.low_stock_threshold ?? 0,
            max_stock: p.max_stock ?? 0,
            unit_price: p.purchase_price ?? 0,
            selling_price: p.selling_price ?? 0,
            supplier: p.supplier?.name || '—',
            expiry_date: p.expiry_date || undefined,
            batch_number: p.batch_number || undefined,
            status: (p.current_stock ?? p.initial_stock ?? 0) <= 0 ? 'out_of_stock' : (p.current_stock ?? p.initial_stock ?? 0) <= (p.low_stock_threshold ?? 0) ? 'low_stock' : 'in_stock',
          }));
          setStockItems(mapped);
        }
      } catch (e) {
        console.error('Erreur chargement stock:', e);
      }
    };
    load();
  }, [isAuthenticated, isLoading]);

  const getStatusBadge = (status: string, current: number, min: number) => {
    if (status === 'out_of_stock' || current <= 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }
    if (status === 'low_stock' || current <= min) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Stock faible</Badge>;
    }
    if (status === 'expired') {
      return <Badge variant="destructive">Expiré</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">En stock</Badge>;
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total_items: stockItems.length,
    in_stock: stockItems.filter(item => item.status === 'in_stock').length,
    low_stock: stockItems.filter(item => item.status === 'low_stock' || item.current_stock <= item.min_stock).length,
    out_of_stock: stockItems.filter(item => item.status === 'out_of_stock').length,
    total_value: stockItems.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion du Stock</h1>
          <p className="text-muted-foreground">
            Gérez votre inventaire, mouvements et alertes de stock
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/stock/movements">
            <Button variant="outline">
              <TrendingDown className="mr-2 h-4 w-4" />
              Mouvements
            </Button>
          </Link>
          <Link to="/app/stock/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Produit
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_items}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.in_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stock Faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.low_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ruptures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.out_of_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valeur Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_value.toLocaleString()} MRU
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un produit ou une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="all">Tous les statuts</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
                <option value="expired">Expiré</option>
              </select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Plus de filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits en stock ({filteredItems.length})</CardTitle>
          <CardDescription>Liste complète de votre inventaire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category} • {item.supplier}</p>
                    {item.batch_number && (
                      <p className="text-xs text-muted-foreground">Lot: {item.batch_number}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-semibold">{item.current_stock}</div>
                    <div className="text-xs text-muted-foreground">Stock actuel</div>
                  </div>

                  <div className="text-center">
                    <div className="font-semibold">{item.selling_price} MRU</div>
                    <div className="text-xs text-muted-foreground">Prix de vente</div>
                  </div>

                  {item.expiry_date && (
                    <div className="text-center">
                      <div className="font-semibold text-sm">{item.expiry_date}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expiration
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    {getStatusBadge(item.status, item.current_stock, item.min_stock)}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/app/stock/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/app/stock/${item.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'Aucun produit ne correspond à votre recherche.' : 'Commencez par ajouter des produits à votre stock.'}
              </p>
              {!searchTerm && (
                <Link to="/app/stock/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockIndexPage;
