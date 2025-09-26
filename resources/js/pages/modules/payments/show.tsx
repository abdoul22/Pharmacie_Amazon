import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Settings, Activity } from 'lucide-react';

/**
 * Page de détails d'un mode de paiement
 */
const PaymentsShowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // TODO: Récupérer les données depuis l'API
  const paymentMethod = {
    id: id,
    name: 'Bankily',
    name_ar: 'بانكيلي',
    category: 'mobile_money',
    description: 'Service de paiement mobile le plus populaire en Mauritanie',
    color: 'bg-blue-500',
    is_digital: true,
    requires_phone: true,
    instant: true,
    enabled: true,
    phone_format: '+222 XX XX XX XX',
    created_at: '2024-01-15',
    updated_at: '2024-09-20',
    stats: {
      total_transactions: 1250,
      total_amount: 850000,
      success_rate: 98.5,
      avg_transaction: 680,
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/payments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className={`p-2 rounded-full ${paymentMethod.color} text-white`}>
                <Activity className="h-6 w-6" />
              </div>
              {paymentMethod.name}
            </h1>
            <p className="text-muted-foreground">{paymentMethod.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/app/payments/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations détaillées</CardTitle>
            <CardDescription>Détails complets du mode de paiement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Identification</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom français:</span>
                    <span className="font-medium">{paymentMethod.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom arabe:</span>
                    <span className="font-medium" dir="rtl">{paymentMethod.name_ar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie:</span>
                    <Badge variant="outline">{getCategoryName(paymentMethod.category)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut:</span>
                    <Badge variant={paymentMethod.enabled ? "default" : "secondary"}>
                      {paymentMethod.enabled ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Caractéristiques</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant={paymentMethod.is_digital ? "default" : "secondary"}>
                      {paymentMethod.is_digital ? "Digital" : "Physique"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Traitement:</span>
                    <Badge variant={paymentMethod.instant ? "default" : "secondary"}>
                      {paymentMethod.instant ? "Instantané" : "Différé"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Téléphone requis:</span>
                    <Badge variant={paymentMethod.requires_phone ? "default" : "secondary"}>
                      {paymentMethod.requires_phone ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  {paymentMethod.phone_format && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format tél:</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {paymentMethod.phone_format}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground">{paymentMethod.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h3 className="font-semibold mb-3">Dates importantes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé le:</span>
                    <span className="font-medium">{paymentMethod.created_at}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modifié le:</span>
                    <span className="font-medium">{paymentMethod.updated_at}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques d'usage</CardTitle>
              <CardDescription>Données d'utilisation du mode de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {paymentMethod.stats.total_transactions}
                </div>
                <p className="text-sm text-muted-foreground">Transactions totales</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {paymentMethod.stats.total_amount.toLocaleString()} MRU
                </div>
                <p className="text-sm text-muted-foreground">Montant total</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {paymentMethod.stats.success_rate}%
                </div>
                <p className="text-sm text-muted-foreground">Taux de réussite</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {paymentMethod.stats.avg_transaction} MRU
                </div>
                <p className="text-sm text-muted-foreground">Transaction moyenne</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/app/payments/${id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier les détails
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Voir les transactions
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Configuration avancée
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentsShowPage;
