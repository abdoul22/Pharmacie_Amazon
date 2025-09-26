import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Wallet,
  Activity,
  CheckCircle2,
  Clock,
  Phone
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { PharmacyService, type PaymentMethodsResponse } from '@/api/services/pharmacy';

/**
 * Page des modes de paiement
 */
const PaymentMethodsPage: React.FC = () => {
  const { 
    data: paymentData, 
    isLoading, 
    error,
    refresh
  } = useApi<PaymentMethodsResponse>(PharmacyService.getPaymentMethods, { immediate: true });

  const getMethodIcon = (method: any) => {
    switch (method.category) {
      case 'physical':
        return <Banknote className="h-6 w-6" />;
      case 'mobile_money':
        return <Smartphone className="h-6 w-6" />;
      case 'banking':
        return <CreditCard className="h-6 w-6" />;
      case 'digital_wallet':
        return <Wallet className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      physical: 'Physique',
      mobile_money: 'Mobile Money',
      banking: 'Bancaire',
      digital_wallet: 'Portefeuille Digital'
    };
    return names[category as keyof typeof names] || category;
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
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modes de Paiement</h1>
          <p className="text-muted-foreground">
            Gestion des méthodes de paiement mauritaniennes - {paymentData.currency}
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <Activity className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Méthodes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_methods}</div>
            <p className="text-xs text-muted-foreground">
              Méthodes disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digitales</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.digital_methods}</div>
            <p className="text-xs text-muted-foreground">
              Paiements électroniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instantanées</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.instant_methods}</div>
            <p className="text-xs text-muted-foreground">
              Traitement immédiat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Money</CardTitle>
            <Phone className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.mobile_methods}</div>
            <p className="text-xs text-muted-foreground">
              Services mobiles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information sur les paiements divisés */}
      {paymentData.split_payments_enabled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Paiements Divisés Activés
            </CardTitle>
            <CardDescription className="text-blue-700">
              Les clients peuvent payer avec jusqu'à {paymentData.max_split_methods} méthodes différentes 
              pour une seule transaction.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {getCategoryName(method.category)}
                  </Badge>
                  
                  {method.is_digital && (
                    <Badge variant="outline" className="text-blue-600">
                      Digital
                    </Badge>
                  )}
                  
                  {method.instant && (
                    <Badge variant="outline" className="text-green-600">
                      Instantané
                    </Badge>
                  )}
                  
                  {method.requires_phone && (
                    <Badge variant="outline" className="text-purple-600">
                      Téléphone requis
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de traitement:</span>
                    <span className="font-medium">
                      {method.processing_fee}% {method.currency}
                    </span>
                  </div>
                  
                  {method.phone_format && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Format téléphone:</span>
                      <span className="font-mono text-xs">{method.phone_format}</span>
                    </div>
                  )}
                  
                  {method.account_format && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Format compte:</span>
                      <span className="font-mono text-xs">{method.account_format}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {methods.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun mode de paiement configuré
            </h3>
            <p className="text-gray-500">
              Contactez l'administrateur pour configurer les modes de paiement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodsPage;
