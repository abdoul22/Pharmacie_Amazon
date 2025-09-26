import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Wallet,
  Activity,
  Plus,
  Settings,
  Eye,
  Edit
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { PharmacyService, type PaymentMethodsResponse } from '@/api/services/pharmacy';

/**
 * Page principale du module Payments - Liste des modes de paiement
 */
const PaymentsIndexPage: React.FC = () => {
  // Données mock temporaires pour éviter les erreurs d'authentification API
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const paymentData = {
    currency: 'MRU',
    methods: [
      {
        id: 'cash',
        name: 'Cash',
        name_ar: 'نقد',
        category: 'physical',
        description: 'Paiement en espèces mauritanien',
        color: 'bg-green-500',
        is_digital: false,
        requires_phone: false,
        instant: true,
        enabled: true
      },
      {
        id: 'bankily',
        name: 'Bankily',
        name_ar: 'بانكيلي',
        category: 'mobile_money',
        description: 'Service de paiement mobile le plus populaire en Mauritanie',
        color: 'bg-blue-500',
        is_digital: true,
        requires_phone: true,
        instant: true,
        enabled: true
      },
      {
        id: 'masrivi',
        name: 'Masrivi',
        name_ar: 'مصريفي',
        category: 'mobile_money',
        description: 'Service de paiement mobile mauritanien',
        color: 'bg-purple-500',
        is_digital: true,
        requires_phone: true,
        instant: true,
        enabled: true
      },
      {
        id: 'sedad',
        name: 'Sedad',
        name_ar: 'سداد',
        category: 'mobile_money',
        description: 'Plateforme de paiement électronique',
        color: 'bg-red-500',
        is_digital: true,
        requires_phone: true,
        instant: true,
        enabled: true
      },
      {
        id: 'click',
        name: 'Click',
        name_ar: 'كليك',
        category: 'digital_wallet',
        description: 'Portefeuille digital mauritanien',
        color: 'bg-yellow-500',
        is_digital: true,
        requires_phone: false,
        instant: true,
        enabled: true
      },
      {
        id: 'moov_money',
        name: 'Moov Money',
        name_ar: 'موف موني',
        category: 'mobile_money',
        description: 'Service de transfert d\'argent mobile',
        color: 'bg-indigo-500',
        is_digital: true,
        requires_phone: true,
        instant: true,
        enabled: true
      },
      {
        id: 'bimbank',
        name: 'BimBank',
        name_ar: 'بيم بنك',
        category: 'banking',
        description: 'Services bancaires mauritaniens',
        color: 'bg-teal-500',
        is_digital: true,
        requires_phone: false,
        instant: false,
        enabled: true
      }
    ],
    stats: {
      total_methods: 7,
      digital_methods: 6,
      instant_methods: 6,
      mobile_methods: 4
    }
  };

  const refresh = () => {
    console.log('Refresh payments data');
  };

  const getMethodIcon = (method: any) => {
    switch (method.category) {
      case 'physical':
        return <Banknote className="h-5 w-5" />;
      case 'mobile_money':
        return <Smartphone className="h-5 w-5" />;
      case 'banking':
        return <CreditCard className="h-5 w-5" />;
      case 'digital_wallet':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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

  if (!paymentData) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Aucune donnée disponible</CardTitle>
            <CardDescription>Les modes de paiement ne peuvent pas être affichés.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { methods, stats } = paymentData;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modes de Paiement</h1>
          <p className="text-muted-foreground">
            Gestion des méthodes de paiement mauritaniennes - {paymentData.currency}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Link to="/app/payments/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Mode
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Méthodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_methods}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Digitales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.digital_methods}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Instantanées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.instant_methods}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mobile Money</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.mobile_methods}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des modes de paiement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <Card key={method.id} className={`transition-all hover:shadow-lg ${
            method.enabled ? 'border-green-200' : 'border-gray-200 opacity-50'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${method.color} text-white`}>
                    {getMethodIcon(method)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>{method.name_ar}</CardDescription>
                  </div>
                </div>
                <Badge variant={method.enabled ? "default" : "secondary"}>
                  {method.enabled ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {method.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {method.is_digital && (
                    <Badge variant="outline" className="text-xs">Digital</Badge>
                  )}
                  {method.instant && (
                    <Badge variant="outline" className="text-xs">Instantané</Badge>
                  )}
                  {method.requires_phone && (
                    <Badge variant="outline" className="text-xs">Tél requis</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Link to={`/app/payments/${method.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-1 h-3 w-3" />
                      Voir
                    </Button>
                  </Link>
                  <Link to={`/app/payments/${method.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-1 h-3 w-3" />
                      Modifier
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucune méthode */}
      {methods.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun mode de paiement configuré
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par ajouter votre premier mode de paiement.
            </p>
            <Link to="/app/payments/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un mode de paiement
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentsIndexPage;
