import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Search } from 'lucide-react';

/**
 * Page de gestion du stock (placeholder)
 */
const StockManagementPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion du Stock</h1>
          <p className="text-muted-foreground">
            Gérez votre inventaire, mouvements et alertes de stock
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Mouvement
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Module en développement
          </h3>
          <p className="text-blue-700">
            La gestion avancée du stock sera disponible dans la prochaine version.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManagementPage;
