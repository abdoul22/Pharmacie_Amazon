import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, X } from 'lucide-react';

interface PaymentMethodFormData {
  name: string;
  name_ar: string;
  category: 'physical' | 'mobile_money' | 'banking' | 'digital_wallet';
  description: string;
  color: string;
  is_digital: boolean;
  requires_phone: boolean;
  instant: boolean;
  enabled: boolean;
  phone_format?: string;
  account_format?: string;
}

/**
 * Page de création d'un nouveau mode de paiement
 */
const PaymentsCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: '',
    name_ar: '',
    category: 'mobile_money',
    description: '',
    color: 'bg-blue-500',
    is_digital: true,
    requires_phone: false,
    instant: true,
    enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Implémenter l'appel API pour créer le mode de paiement
      console.log('Creating payment method:', formData);
      
      // Simulation d'un délai API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirection vers la liste
      navigate('/app/payments');
    } catch (error: any) {
      setErrors(error.response?.data?.errors || { general: 'Erreur lors de la création' });
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'physical', label: 'Physique (Cash)' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'banking', label: 'Bancaire' },
    { value: 'digital_wallet', label: 'Portefeuille Digital' },
  ];

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Bleu', color: '#3B82F6' },
    { value: 'bg-green-500', label: 'Vert', color: '#10B981' },
    { value: 'bg-purple-500', label: 'Violet', color: '#8B5CF6' },
    { value: 'bg-red-500', label: 'Rouge', color: '#EF4444' },
    { value: 'bg-yellow-500', label: 'Jaune', color: '#F59E0B' },
    { value: 'bg-indigo-500', label: 'Indigo', color: '#6366F1' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/payments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouveau Mode de Paiement</h1>
            <p className="text-muted-foreground">
              Ajouter une nouvelle méthode de paiement mauritanienne
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de base */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>Détails principaux du mode de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom (Français) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Bankily"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="name_ar">Nom (Arabe)</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="ex: بانكيلي"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du mode de paiement..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Couleur</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: option.color }}
                            />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Paramètres du mode de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: Boolean(checked) }))}
                />
                <Label htmlFor="enabled">Activé</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_digital"
                  checked={formData.is_digital}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_digital: Boolean(checked) }))}
                />
                <Label htmlFor="is_digital">Mode digital</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instant"
                  checked={formData.instant}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, instant: Boolean(checked) }))}
                />
                <Label htmlFor="instant">Traitement instantané</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requires_phone"
                  checked={formData.requires_phone}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_phone: Boolean(checked) }))}
                />
                <Label htmlFor="requires_phone">Numéro de téléphone requis</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formats optionnels */}
        {(formData.requires_phone || formData.category === 'banking') && (
          <Card>
            <CardHeader>
              <CardTitle>Formats de validation</CardTitle>
              <CardDescription>Formats requis pour les données d'entrée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.requires_phone && (
                  <div>
                    <Label htmlFor="phone_format">Format du téléphone</Label>
                    <Input
                      id="phone_format"
                      value={formData.phone_format || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_format: e.target.value }))}
                      placeholder="ex: +222 XX XX XX XX"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format d'affichage pour le numéro de téléphone
                    </p>
                  </div>
                )}

                {formData.category === 'banking' && (
                  <div>
                    <Label htmlFor="account_format">Format du compte</Label>
                    <Input
                      id="account_format"
                      value={formData.account_format || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_format: e.target.value }))}
                      placeholder="ex: XXXX-XXXX-XXXX-XXXX"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format d'affichage pour le numéro de compte
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link to="/app/payments">
            <Button type="button" variant="outline">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>Création en cours...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Créer le mode de paiement
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentsCreatePage;
