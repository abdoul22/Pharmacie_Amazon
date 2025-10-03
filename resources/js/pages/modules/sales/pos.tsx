import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  ScanLine,
  CreditCard,
  DollarSign,
  Users,
  Receipt,
  X
} from 'lucide-react';

// Types pour le POS
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  enabled: boolean;
}

/**
 * Interface Point de Vente - Caisse
 */
const POSPage: React.FC = () => {
  // États du POS
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  // Produits chargés depuis l'API
  const [products, setProducts] = useState<Product[]>([]);
  // État local pour le stock des produits (pour mise à jour immédiate)
  const [productStock, setProductStock] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { default: apiClient } = await import('@/api/client');
        const resp: any = await apiClient.get('/stock/products');
        const data = Array.isArray(resp?.data) ? resp.data : [];
        // Mapper les champs backend -> POS Product
        const mapped: Product[] = data.map((p: any) => {
          const currentStock = p.current_stock ?? p.initial_stock ?? 0;
          return {
            id: p.id,
            name: p.name,
            price: Number(p.selling_price ?? p.purchase_price ?? 0),
            stock: Number(currentStock),
            barcode: p.barcode ?? '',
            category: p.category?.name ?? ''
          };
        });
        setProducts(mapped);
        // Initialiser l'état local du stock
        const stockMap: Record<number, number> = {};
        mapped.forEach(p => {
          stockMap[p.id] = p.stock;
        });
        setProductStock(stockMap);
      } catch (e) {
        console.error('Erreur chargement produits POS:', e);
      }
    };
    loadProducts();
  }, []);

  // Modes de paiement mauritaniens
  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Espèces', icon: DollarSign, color: 'bg-green-500', enabled: true },
    { id: 'bankily', name: 'Bankily', icon: CreditCard, color: 'bg-blue-500', enabled: true },
    { id: 'masrivi', name: 'Masrivi', icon: CreditCard, color: 'bg-purple-500', enabled: true },
    { id: 'sedad', name: 'Sedad', icon: CreditCard, color: 'bg-red-500', enabled: true },
    { id: 'click', name: 'Click', icon: CreditCard, color: 'bg-orange-500', enabled: true },
  ];

  // Produits filtrés par recherche
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  // Calculs du panier
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const tva = cartTotal * 0.14; // TVA mauritanienne 14%
  const totalTTC = cartTotal + tva;

  // Ajouter un produit au panier
  const addToCart = (product: Product) => {
    const currentStock = productStock[product.id] ?? product.stock;
    if (currentStock <= 0) {
      alert('Produit en rupture de stock');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        const availableStock = productStock[product.id] ?? product.stock;
        if (newQuantity > availableStock) {
          alert(`Stock insuffisant. Stock disponible: ${availableStock}`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
            : item
        );
      } else {
        return [...prevCart, {
          ...product,
          quantity: 1,
          subtotal: product.price
        }];
      }
    });
  };

  // Modifier quantité dans le panier
  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    const availableStock = productStock[productId] ?? product?.stock ?? 0;
    if (product && newQuantity > availableStock) {
      alert(`Stock insuffisant. Stock disponible: ${availableStock}`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  // Supprimer du panier
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
    setSelectedPayment(null);
    setCustomerPhone('');
  };

  // Finaliser la vente
  const finalizeSale = async () => {
    if (!selectedPayment) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (selectedPayment !== 'cash' && !customerPhone) {
      alert('Numéro de téléphone requis pour les paiements mobiles');
      return;
    }

    try {
      // Préparer les données pour l'API
      const invoiceData = {
        payment_method: selectedPayment,
        customer_phone: customerPhone || undefined,
        payment_details: selectedPayment !== 'cash' && customerPhone ? {
          phone: customerPhone
        } : undefined,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        }))
      };

      // Utiliser le client API centralisé (Axios) qui ajoute le token automatiquement
      try {
        const mod = await import('@/api/services/invoice');
        const { invoice, pdf_url } = await mod.InvoiceService.createInvoice(invoiceData as any);

        // Mettre à jour le stock local immédiatement
        cart.forEach(item => {
          setProductStock(prev => ({
            ...prev,
            [item.id]: Math.max(0, (prev[item.id] ?? 0) - item.quantity)
          }));
        });

        alert(`Vente réalisée avec succès !\nFacture: ${invoice.invoice_number}`);
        if (confirm('Souhaitez-vous télécharger la facture PDF ?')) {
          window.open(pdf_url, '_blank');
        }
        clearCart();
        return;
      } catch (apiErr: any) {
        const status = apiErr?.response?.status;
        const data = apiErr?.response?.data;
        console.error('Invoice API error:', status, data || apiErr);
        if (status === 401) {
          alert('Votre session a expiré. Veuillez vous reconnecter.');
          return;
        }
        if (status === 422) {
          alert('Erreurs de validation: ' + JSON.stringify(data?.errors));
          return;
        }
        // Fallback: tentative via fetch si Axios indisponible
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        const result = await fetch('/api/pharmacy/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(invoiceData)
        });
        const response = await result.json();
        if (response?.success) {
          alert(`Vente réalisée avec succès !\nFacture: ${response.data.invoice.invoice_number}`);
          clearCart();
          return;
        }
        alert(`Erreur: ${response?.message || 'Création de facture échouée'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      alert('Erreur lors de la création de la facture');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">

        {/* En-tête POS */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Point de Vente</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              Caissier: Admin Test
            </Badge>
            <Button variant="outline" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Vider
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Section produits (2/3) */}
          <div className="lg:col-span-2">

            {/* Barre de recherche */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par nom ou code-barres..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <ScanLine className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Liste des produits */}
            <Card>
              <CardHeader>
                <CardTitle>Produits Disponibles</CardTitle>
                <CardDescription>
                  Cliquez sur un produit pour l'ajouter au panier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        product.stock > 0
                          ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-200 dark:border-gray-700'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{product.name}</h3>
                          <p className="text-xs text-gray-500">{product.category}</p>
                          <p className="text-lg font-bold text-green-600">
                            {product.price.toLocaleString()} MRU
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={(productStock[product.id] ?? product.stock) > 10 ? 'default' : (productStock[product.id] ?? product.stock) > 0 ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {(productStock[product.id] ?? product.stock) > 0 ? `Stock: ${productStock[product.id] ?? product.stock}` : 'Rupture'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section panier (1/3) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Panier ({cartItems})
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Panier vide</p>
                  </div>
                ) : (
                  <>
                    {/* Articles du panier */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.price.toLocaleString()} MRU × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">
                              {item.subtotal.toLocaleString()} MRU
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Totaux */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total HT:</span>
                        <span>{cartTotal.toLocaleString()} MRU</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>TVA (14%):</span>
                        <span>{tva.toLocaleString()} MRU</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total TTC:</span>
                        <span className="text-green-600">{totalTTC.toLocaleString()} MRU</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Modes de paiement */}
                    {!showPayment ? (
                      <Button
                        onClick={() => setShowPayment(true)}
                        className="w-full"
                        size="lg"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Procéder au Paiement
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-medium">Mode de Paiement</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {paymentMethods.filter(p => p.enabled).map((method) => (
                            <Button
                              key={method.id}
                              variant={selectedPayment === method.id ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedPayment(method.id)}
                              className="flex flex-col items-center p-3 h-auto"
                            >
                              <method.icon className="h-4 w-4 mb-1" />
                              <span className="text-xs">{method.name}</span>
                            </Button>
                          ))}
                        </div>

                        {/* Numéro de téléphone pour paiements mobiles */}
                        {selectedPayment && selectedPayment !== 'cash' && (
                          <div>
                            <label className="text-sm font-medium">Numéro de téléphone</label>
                            <Input
                              placeholder="+222 XX XX XX XX"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowPayment(false)}
                            className="flex-1"
                          >
                            Retour
                          </Button>
                          <Button
                            onClick={finalizeSale}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Receipt className="mr-2 h-4 w-4" />
                            Valider
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
