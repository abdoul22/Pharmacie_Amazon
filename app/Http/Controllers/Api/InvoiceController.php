<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Créer une nouvelle facture depuis le POS
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email',
            'customer_address' => 'nullable|string',
            'payment_method' => 'required|in:cash,bankily,masrivi,sedad,click,moov_money,bimbank,credit',
            'payment_details' => 'nullable|array',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Calculer les totaux
            $subtotalHT = 0;
            $itemsData = [];

            $stockService = app(\App\Services\StockService::class);

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                if (!$product) {
                    throw new \Exception("Produit introuvable: {$item['product_id']}");
                }

                // Vérifier le stock via StockService (initial_stock + mouvements)
                $available = $stockService->getCurrentStock($product);
                if ($available < $item['quantity']) {
                    throw new \Exception("Stock insuffisant pour {$product->name}. Stock disponible: {$available}");
                }

                $totalPrice = $item['quantity'] * $item['unit_price'];
                $discountAmount = isset($item['discount_percentage'])
                    ? ($totalPrice * $item['discount_percentage']) / 100
                    : 0;
                $netAmount = $totalPrice - $discountAmount;
                $subtotalHT += $netAmount;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_code' => $product->barcode,
                    'batch_number' => $product->batch_number ?? null,
                    'expiry_date' => $product->expiry_date ?? null,
                    'category' => $product->category->name ?? 'Non catégorisé',
                    'requires_prescription' => $product->requires_prescription ?? false,
                    'quantity' => $item['quantity'],
                    'unit' => 'pcs',
                    'unit_price' => $item['unit_price'],
                    'total_price' => $totalPrice,
                    'discount_percentage' => $item['discount_percentage'] ?? 0,
                    'discount_amount' => $discountAmount,
                    'net_amount' => $netAmount,
                ];
            }

            // Calculer TVA (14% mauritanienne)
            $tvaRate = 14.00;
            $tvaAmount = $subtotalHT * ($tvaRate / 100);
            $totalTTC = $subtotalHT + $tvaAmount;

            // Créer la facture
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'invoice_date' => now()->toDateString(),
                'invoice_time' => now()->toTimeString(),
                'status' => 'sent',
                'type' => 'sale',
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'customer_address' => $request->customer_address,
                'subtotal_ht' => $subtotalHT,
                'tva_rate' => $tvaRate,
                'tva_amount' => $tvaAmount,
                'total_ttc' => $totalTTC,
                'currency' => 'MRU',
                'payment_method' => $request->payment_method,
                'payment_status' => 'paid', // POS = paiement immédiat
                'paid_amount' => $totalTTC,
                'due_amount' => 0,
                'notes' => $request->notes,
                'payment_details' => $request->payment_details,
                'user_id' => $request->user()->id,
                'pos_terminal' => $request->header('User-Agent', 'POS-Terminal'),
            ]);

            // Créer les lignes de facture
            foreach ($itemsData as $itemData) {
                $itemData['invoice_id'] = $invoice->id;
                InvoiceItem::create($itemData);

                // Enregistrer la sortie de stock via StockService
                $product = Product::find($itemData['product_id']);
                $stockService->removeStock(
                    $product,
                    (int) $itemData['quantity'],
                    'sale',
                    $invoice->invoice_number,
                    $request->user()
                );
            }

            DB::commit();

            // Charger les relations pour la réponse
            $invoice->load(['items', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Facture créée avec succès',
                'data' => [
                    'invoice' => $invoice,
                    'pdf_url' => route('api.invoices.pdf', $invoice->id),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la facture',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lister les factures avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Invoice::with(['items', 'user'])
                ->orderBy('created_at', 'desc');

            // Filtres
            if ($request->has('date_from')) {
                $query->whereDate('invoice_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('invoice_date', '<=', $request->date_to);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->has('customer_phone')) {
                $query->where('customer_phone', 'like', '%' . $request->customer_phone . '%');
            }

            // Pagination
            $perPage = $request->input('per_page', 20);
            $invoices = $query->paginate($perPage);

            // Statistiques
            $stats = [
                'total_invoices' => Invoice::count(),
                'today_invoices' => Invoice::today()->count(),
                'today_revenue' => Invoice::today()->paid()->sum('total_ttc'),
                'pending_amount' => Invoice::where('payment_status', '!=', 'paid')->sum('due_amount'),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Factures récupérées avec succès',
                'data' => $invoices,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des factures',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Afficher une facture
     */
    public function show(Invoice $invoice): JsonResponse
    {
        try {
            $invoice->load(['items.product', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Facture récupérée avec succès',
                'data' => $invoice,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la facture',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Générer et télécharger la facture en PDF
     */
    public function generatePDF(Invoice $invoice)
    {
        try {
            $invoice->load(['items', 'user']);

            $pdf = Pdf::loadView('invoices.pdf', [
                'invoice' => $invoice,
                'company' => [
                    'name' => 'Amazon Pharmacie',
                    'address' => 'Nouakchott, Mauritanie',
                    'phone' => '+222 XX XX XX XX',
                    'email' => 'contact@amazon-pharmacie.mr',
                ]
            ]);

            return $pdf->download("facture-{$invoice->invoice_number}.pdf");
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Statistiques des ventes
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $dateFrom = $request->input('date_from', now()->startOfMonth());
            $dateTo = $request->input('date_to', now());

            $stats = [
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ],
                'totals' => [
                    'invoices' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])->count(),
                    'revenue' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                        ->where('payment_status', 'paid')
                        ->sum('total_ttc'),
                    'items_sold' => InvoiceItem::whereHas('invoice', function ($query) use ($dateFrom, $dateTo) {
                        $query->whereBetween('invoice_date', [$dateFrom, $dateTo]);
                    })->sum('quantity'),
                ],
                'by_payment_method' => Invoice::whereBetween('invoice_date', [$dateFrom, $dateTo])
                    ->groupBy('payment_method')
                    ->selectRaw('payment_method, COUNT(*) as count, SUM(total_ttc) as total')
                    ->get(),
                'top_products' => InvoiceItem::select('product_name')
                    ->selectRaw('SUM(quantity) as total_quantity, SUM(net_amount) as total_revenue')
                    ->whereHas('invoice', function ($query) use ($dateFrom, $dateTo) {
                        $query->whereBetween('invoice_date', [$dateFrom, $dateTo]);
                    })
                    ->groupBy('product_name')
                    ->orderByDesc('total_revenue')
                    ->limit(10)
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistiques récupérées avec succès',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
