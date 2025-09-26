import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Shield, 
  Clock, 
  Users, 
  Smartphone, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  CreditCard,
  FileText,
  AlertTriangle,
  Zap,
  Heart,
  Award
} from 'lucide-react';

const WelcomePharmacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Pill className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Amazon Pharmacie</h1>
                <p className="text-blue-100 text-sm">Solutions pharmaceutiques modernes</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-blue-100">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+222 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@amazon-pharmacie.mr</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-green-100 text-green-800 border-green-200 px-4 py-2">
              <CheckCircle className="mr-2 h-4 w-4" />
              Système certifié et sécurisé 🇲🇷
            </Badge>
            
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gestion Moderne de
              <span className="text-blue-600"> Pharmacie</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Système complet de gestion pharmaceutique conçu spécialement pour les pharmacies mauritaniennes. 
              Stock intelligent, paiements mobiles intégrés (Bankily, Masrivi, Sedad) et conformité assurances CNAM.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth/login">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  <Users className="mr-2 h-5 w-5" />
                  Accès Professionnel
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Heart className="mr-2 h-5 w-5" />
                  Demander l'Accès
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium">Données Sécurisées SSL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Support 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Conforme Ministère Santé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Solutions Complètes pour Pharmacies 🇲🇷
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre pharmacie moderne en Mauritanie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gestion Stock */}
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Package className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Gestion du Stock Intelligente</CardTitle>
                <CardDescription className="text-base">
                  Suivi automatique des médicaments avec alertes péremption et ruptures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Gestion des lots avec dates d'expiration</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Alertes stock faible automatiques</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Code-barres et traçabilité complète</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Paiements Mobiles */}
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">Paiements Mobile Money 🇲🇷</CardTitle>
                <CardDescription className="text-base">
                  Intégration complète des services de paiement mauritaniens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span><strong>Bankily, Masrivi, Sedad</strong></span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span><strong>Moov Money, Click, BimBank</strong></span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Paiements fractionnés multi-méthodes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Assurances */}
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Assurances CNAM</CardTitle>
                <CardDescription className="text-base">
                  Support complet assurances et mutuelles mauritaniennes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span><strong>CNAM</strong> intégration directe</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>Mutuelles privées</strong> (MGMO, etc.)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Calcul automatique remboursements</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
              <CardHeader>
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-red-600" />
                </div>
                <CardTitle className="text-xl">Ordonnances Digitales</CardTitle>
                <CardDescription className="text-base">
                  Gestion sécurisée des prescriptions médicales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span>Validation ordonnances médecins</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>Médicaments contrôlés & stupéfiants</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Historique complet patients</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Reporting */}
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-7 w-7 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Rapports & Analytics</CardTitle>
                <CardDescription className="text-base">
                  Tableaux de bord et analyses de performance détaillées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center space-x-3">
                    <BarChart3 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Ventes et chiffre d'affaires</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>Rotation et valorisation stocks</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Exports comptables Excel/PDF</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Mode Offline */}
            <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-indigo-500">
              <CardHeader>
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Mode Hors-Ligne</CardTitle>
                <CardDescription className="text-base">
                  Continuité d'activité même sans internet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <span>Ventes continues hors connexion</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Synchronisation automatique</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Sauvegarde locale chiffrée</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Pharmacies nous font confiance 🇲🇷</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-200">Pharmacies actives</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">50k+</div>
              <div className="text-blue-200">Médicaments gérés</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">Disponibilité système</div>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Support technique</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold mb-6">
              Prêt à moderniser votre pharmacie ? 🚀
            </h3>
            <p className="text-xl text-green-100 mb-8">
              Rejoignez les pharmacies mauritaniennes qui ont choisi l'excellence technologique
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-green-600 hover:bg-gray-100">
                  <Star className="mr-2 h-5 w-5" />
                  Demande d'Accès Gratuite
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-green-600">
                  <Users className="mr-2 h-5 w-5" />
                  Se Connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Amazon Pharmacie</span>
              </div>
              <p className="text-gray-400 mb-4">
                Solution pharmaceutique moderne pensée pour la Mauritanie 🇲🇷
              </p>
              <p className="text-sm text-gray-500">
                Système certifié conforme aux normes du Ministère de la Santé
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Contact & Support</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>Nouakchott, Tevragh-Zeina</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-green-400" />
                  <span>+222 XX XX XX XX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>support@amazon-pharmacie.mr</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Fonctionnalités</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Gestion Stock Intelligente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Paiements Mobile Money</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Assurances CNAM/MGMO</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Mode Hors-Ligne</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Liens Utiles</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formation en ligne</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support technique</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 Amazon Pharmacie. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-4 md:mt-0">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>pour les pharmacies mauritaniennes</span>
              <span className="text-lg">🇲🇷</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePharmacyPage;
