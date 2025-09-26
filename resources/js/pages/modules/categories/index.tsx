import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus } from 'lucide-react';

const CategoriesIndexPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground">Gestion des catégories de produits</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Catégorie
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="text-center py-8">
          <FolderOpen className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Module en développement</h3>
          <p className="text-blue-700">Pages CRUD pour les catégories: index, create, show, edit</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesIndexPage;
