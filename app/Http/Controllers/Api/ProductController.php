<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->with(['category', 'supplier', 'stockMovements'])
            ->orderByDesc('id')
            ->get()
            ->map(function ($product) {
                // Ajouter le current_stock calculé à la réponse
                $product->current_stock = $product->current_stock;
                return $product;
            });

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'max:50', 'unique:products,barcode'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            // Le formulaire envoie unit_price et current_stock: on les mappe
            'unit_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
            'batch_number' => ['nullable', 'string', 'max:100'], // non stocké mais accepté
            'expiry_date' => ['required', 'date'],
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'generic_name' => null,
            'barcode' => $validated['barcode'] ?? null,
            'category_id' => $validated['category_id'],
            'supplier_id' => $validated['supplier_id'],
            'purchase_price' => (float) ($validated['unit_price'] ?? 0),
            'selling_price' => (float) ($validated['selling_price'] ?? 0),
            'initial_stock' => (int) ($validated['current_stock'] ?? 0),
            'low_stock_threshold' => 10,
            'pharmaceutical_form' => 'Unspecified',
            'dosage' => null,
            'expiry_date' => $validated['expiry_date'],
            'description' => null,
            'image_path' => null,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'data' => $product,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['category', 'supplier', 'stockMovements'])->findOrFail($id);
        // Ajouter le current_stock calculé à la réponse
        $product->current_stock = $product->current_stock;

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:products,barcode,' . $product->id],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'supplier_id' => ['sometimes', 'integer', 'exists:suppliers,id'],
            'unit_price' => ['sometimes', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'numeric', 'min:0'],
            'current_stock' => ['sometimes', 'integer', 'min:0'],
            'expiry_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $product->fill([
            'name' => $validated['name'] ?? $product->name,
            'barcode' => array_key_exists('barcode', $validated) ? $validated['barcode'] : $product->barcode,
            'category_id' => $validated['category_id'] ?? $product->category_id,
            'supplier_id' => $validated['supplier_id'] ?? $product->supplier_id,
            'purchase_price' => array_key_exists('unit_price', $validated) ? (float) $validated['unit_price'] : $product->purchase_price,
            'selling_price' => array_key_exists('selling_price', $validated) ? (float) $validated['selling_price'] : $product->selling_price,
            'initial_stock' => array_key_exists('current_stock', $validated) ? (int) $validated['current_stock'] : $product->initial_stock,
            'expiry_date' => $validated['expiry_date'] ?? $product->expiry_date,
            'status' => $validated['status'] ?? $product->status,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Produit mis à jour',
            'data' => $product->fresh(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé',
        ]);
    }
}
