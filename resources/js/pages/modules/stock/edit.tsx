import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/api/client';

const StockEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get(`/stock/products/${id}`);
        const p = res?.data;
        setForm({
          name: p?.name || '',
          barcode: p?.barcode || '',
          category_id: p?.category_id || p?.category?.id || '',
          supplier_id: p?.supplier_id || p?.supplier?.id || '',
          current_stock: p?.initial_stock ?? 0,
          unit_price: p?.purchase_price ?? 0,
          selling_price: p?.selling_price ?? 0,
          low_stock_threshold: p?.low_stock_threshold ?? 10,
          expiry_date: p?.expiry_date || '',
        });
      } catch (e: any) {
        setError('Impossible de charger le produit');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const onChange = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const submit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name,
        barcode: form.barcode || null,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : undefined,
        current_stock: form.current_stock ? Number(form.current_stock) : 0,
        unit_price: form.unit_price ? Number(form.unit_price) : 0,
        selling_price: form.selling_price ? Number(form.selling_price) : 0,
        expiry_date: form.expiry_date || null,
      };
      await apiClient.put(`/stock/products/${id}`, payload);
      navigate(`/app/stock/${id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Échec de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/app/stock/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier le Produit #{id}</h1>
            <p className="text-muted-foreground">Modifier les informations du produit</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edition</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => onChange('name', e.target.value)} />
              </div>
              <div>
                <Label>Code-barres</Label>
                <Input value={form.barcode} onChange={(e) => onChange('barcode', e.target.value)} />
              </div>
              <div>
                <Label>Stock initial</Label>
                <Input type="number" value={form.current_stock} onChange={(e) => onChange('current_stock', e.target.value)} />
              </div>
              <div>
                <Label>Prix d'achat</Label>
                <Input type="number" value={form.unit_price} onChange={(e) => onChange('unit_price', e.target.value)} />
              </div>
              <div>
                <Label>Prix de vente</Label>
                <Input type="number" value={form.selling_price} onChange={(e) => onChange('selling_price', e.target.value)} />
              </div>
              <div>
                <Label>Date d'expiration</Label>
                <Input type="date" value={form.expiry_date} onChange={(e) => onChange('expiry_date', e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={submit} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockEditPage;
