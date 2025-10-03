import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, Plus } from 'lucide-react';
import apiClient from '@/api/client';

const SuppliersIndexPage: React.FC = () => {
  const [items, setItems] = React.useState<Array<{ id: number; name: string }>>([]);
  const [name, setName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  // optional fields for better UX
  const [phone, setPhone] = React.useState('');
  const [contactName, setContactName] = React.useState('');

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/stock/suppliers');
      const data = (res as any)?.data?.suppliers ?? (res as any)?.data ?? [];
      setItems(data.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (e: any) {
      setError("Impossible de charger les fournisseurs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const payload: any = { name };
      if (phone) payload.phone = phone;
      if (contactName) payload.contact_name = contactName;
      const res = await apiClient.post('/stock/suppliers', payload);
      if ((res as any)?.success === false) {
        throw new Error((res as any)?.message || 'Erreur création');
      }
      setMessage('Fournisseur créé');
      setName('');
      setPhone('');
      setContactName('');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground">Gestion des fournisseurs et commandes</p>
        </div>
      </div>

      {(message || error) && (
        <Alert className={error ? 'border-red-300' : 'border-green-300'}>
          <AlertDescription>{error || message}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Ajouter un fournisseur</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Fournisseur Par Défaut" />
          </div>
          <div>
            <Label>Contact</Label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nom du contact (optionnel)" />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone (optionnel)" />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={submit} disabled={isSubmitting} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Ajout…' : 'Ajouter'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-800">
        <CardContent className="py-6">
          <div className="flex items-center mb-4">
            <Truck className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-semibold text-blue-900 dark:text-slate-100">Liste des fournisseurs</span>
          </div>
          {isLoading ? (
            <p className="text-sm text-blue-700 dark:text-slate-300">Chargement…</p>
          ) : (
            <ul className="list-disc pl-6 space-y-1 text-blue-900 dark:text-slate-100">
              {items.length === 0 && <li>Aucun fournisseur</li>}
              {items.map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersIndexPage;
