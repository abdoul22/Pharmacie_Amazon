import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiClient from '@/api/client';

const StockCreatePage: React.FC = () => {
  const [categories, setCategories] = React.useState<Array<{ id: number; name: string }>>([]);
  const [suppliers, setSuppliers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingMeta, setIsLoadingMeta] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    barcode: '',
    category_id: '',
    supplier_id: '',
    current_stock: '',
    unit_price: '',
    selling_price: '',
    batch_number: '',
    expiry_date: '',
  });
  const [message, setMessage] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadMeta = async () => {
      setIsLoadingMeta(true);
      try {
        const [cats, sups] = await Promise.all([
          apiClient.get('/stock/categories?per_page=100'),
          apiClient.get('/stock/suppliers?per_page=100'),
        ]);
        const catsRoot = (cats as any)?.data;
        const supsRoot = (sups as any)?.data;
        const catData = Array.isArray(catsRoot)
          ? catsRoot
          : (catsRoot?.categories ?? catsRoot?.data ?? []);
        const supData = Array.isArray(supsRoot)
          ? supsRoot
          : (supsRoot?.suppliers ?? supsRoot?.data ?? []);
        setCategories((catData || []).map((c: any) => ({ id: c.id, name: c.name || `Catégorie #${c.id}` })));
        setSuppliers((supData || []).map((s: any) => ({ id: s.id, name: s.name || `Fournisseur #${s.id}` })));
      } catch (e) {
        // silencieux: la page reste utilisable mais sans listes
      } finally {
        setIsLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const submit = async () => {
    setMessage(null);
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        barcode: form.barcode || undefined,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : undefined,
        current_stock: form.current_stock ? Number(form.current_stock) : 0,
        unit_price: form.unit_price ? Number(form.unit_price) : 0,
        selling_price: form.selling_price ? Number(form.selling_price) : 0,
        batch_number: form.batch_number || undefined,
        expiry_date: form.expiry_date || undefined,
      };

      const res = await apiClient.post('/stock/products', payload);
      const json: any = res;
      if (!json?.success) {
        if (json?.errors) {
          const flat: Record<string, string> = {};
          Object.entries(json.errors).forEach(([k, v]: any) => (flat[k] = (v as any)?.[0] ?? 'Champ invalide'));
          setErrors(flat);
        } else {
          setMessage(json?.message || 'Erreur lors de la création');
        }
        return;
      }

      setMessage('Produit créé avec succès');
      setForm({ name: '', barcode: '', category_id: '', supplier_id: '', current_stock: '', unit_price: '', selling_price: '', batch_number: '', expiry_date: '' });
    } catch (e: any) {
      setMessage('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Détails du produit</CardTitle>
          <CardDescription>Renseignez les informations principales</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nom</Label>
            <Input value={form.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Ex: Paracétamol 500mg" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Code-barres</Label>
            <Input value={form.barcode} onChange={(e) => onChange('barcode', e.target.value)} placeholder="EAN/UPC" />
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={form.category_id} onValueChange={(v) => onChange('category_id', v)}>
              <SelectTrigger disabled={isLoadingMeta}>
                <SelectValue placeholder={isLoadingMeta ? 'Chargement…' : 'Sélectionner une catégorie'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
          </div>
          <div>
            <Label>Fournisseur</Label>
            <Select value={form.supplier_id} onValueChange={(v) => onChange('supplier_id', v)}>
              <SelectTrigger disabled={isLoadingMeta}>
                <SelectValue placeholder={isLoadingMeta ? 'Chargement…' : 'Sélectionner un fournisseur'} />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((sup) => (
                  <SelectItem key={sup.id} value={String(sup.id)}>
                    {sup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplier_id && <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>}
          </div>

          <div>
            <Label>Stock initial</Label>
            <Input type="number" value={form.current_stock} onChange={(e) => onChange('current_stock', e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Prix d'achat (unitaire)</Label>
            <Input type="number" value={form.unit_price} onChange={(e) => onChange('unit_price', e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Prix de vente</Label>
            <Input type="number" value={form.selling_price} onChange={(e) => onChange('selling_price', e.target.value)} placeholder="0" />
          </div>

          <div>
            <Label>Lot</Label>
            <Input value={form.batch_number} onChange={(e) => onChange('batch_number', e.target.value)} placeholder="Numéro de lot" />
          </div>
          <div>
            <Label>Date d'expiration</Label>
            <Input type="date" value={form.expiry_date} onChange={(e) => onChange('expiry_date', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
};

export default StockCreatePage;
