<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Supplier::query();

            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $perPage = min($request->get('per_page', 15), 100);
            $suppliers = $query->orderBy('name')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'suppliers' => $suppliers->items(),
                    'meta' => [
                        'current_page' => $suppliers->currentPage(),
                        'per_page' => $suppliers->perPage(),
                        'total' => $suppliers->total(),
                        'last_page' => $suppliers->lastPage(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'contact_name' => ['nullable', 'string', 'max:255'],
                'phone' => ['required', 'string', 'max:50'],
                'email' => ['nullable', 'email', 'max:255'],
                'address' => ['nullable', 'string', 'max:500'],
                'status' => ['nullable', 'in:active,inactive'],
            ]);

            $supplier = Supplier::create([
                'name' => $validated['name'],
                // DB column is contact_person
                'contact_person' => $validated['contact_name'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'address' => $validated['address'] ?? null,
                'status' => $validated['status'] ?? 'active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => [
                    'supplier' => $supplier
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => [
                'supplier' => $supplier
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'contact_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $supplier->fill([
            'name' => $validated['name'] ?? $supplier->name,
            'contact_person' => array_key_exists('contact_name', $validated) ? $validated['contact_name'] : $supplier->contact_person,
            'phone' => $validated['phone'] ?? $supplier->phone,
            'email' => $validated['email'] ?? $supplier->email,
            'address' => $validated['address'] ?? $supplier->address,
            'status' => $validated['status'] ?? $supplier->status,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Supplier updated successfully',
            'data' => [
                'supplier' => $supplier->fresh()
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();
        return response()->json([
            'success' => true,
            'message' => 'Supplier deleted successfully'
        ]);
    }
}
