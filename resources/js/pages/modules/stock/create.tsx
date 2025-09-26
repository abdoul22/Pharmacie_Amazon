import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const StockCreatePage: React.FC = () => {
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
            <h1 className="text-3xl font-bold tracking-tight">Nouveau Produit</h1>
            <p className="text-muted-foreground">Ajouter un produit au stock</p>
          </div>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="text-center py-8">
          <Plus className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Module en développement</h3>
          <p className="text-blue-700">Formulaire de création de produit à implémenter</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockCreatePage;
