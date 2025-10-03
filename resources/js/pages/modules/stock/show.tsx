import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '@/api/client';

const StockShowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/stock/products/${id}`);
        const p = res?.data;
        setItem(p);
      } catch (e: any) {
        setError('Impossible de charger le produit');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/stock">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produit #{id}</h1>
            <p className="text-muted-foreground">Informations détaillées du produit</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{item?.name}</div>
                  <div className="text-sm text-muted-foreground">{item?.category?.name || '—'} • {item?.supplier?.name || '—'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Stock initial</div>
                <div className="font-semibold">{item?.initial_stock}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Prix d'achat</div>
                <div className="font-semibold">{item?.purchase_price} MRU</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Prix de vente</div>
                <div className="font-semibold">{item?.selling_price} MRU</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Seuil alerte</div>
                <div className="font-semibold">{item?.low_stock_threshold}</div>
              </div>

              {item?.expiry_date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" /> {item.expiry_date}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockShowPage;
