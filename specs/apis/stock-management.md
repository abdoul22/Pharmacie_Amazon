# API Specification: Stock & Products Management

## Base URL

```
/api/stock
```

## Authentication

All endpoints require authentication with `Bearer` token.

---

## Categories Endpoints

### GET /categories

Lister toutes les catégories avec pagination.

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
page: integer (optional, default: 1)
per_page: integer (optional, default: 15, max: 100)
search: string (optional) - Search by name
status: string (optional, values: active|inactive|all, default: active)
```

**Response 200 - Success:**

```json
{
    "success": true,
    "data": {
        "categories": [
            {
                "id": 1,
                "name": "Antibiotiques",
                "description": "Médicaments contre les infections",
                "status": "active",
                "products_count": 25,
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T10:00:00Z"
            }
        ],
        "meta": {
            "current_page": 1,
            "per_page": 15,
            "total": 50,
            "last_page": 4
        }
    }
}
```

### POST /categories

Créer une nouvelle catégorie (Admin seulement).

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
    "name": "string (required, max:255, unique)",
    "description": "string (optional, max:1000)",
    "status": "string (optional, values: active|inactive, default: active)"
}
```

**Response 201 - Success:**

```json
{
    "success": true,
    "message": "Category created successfully",
    "data": {
        "category": {
            "id": 1,
            "name": "Antibiotiques",
            "description": "Médicaments contre les infections",
            "status": "active",
            "created_at": "2025-01-15T10:00:00Z"
        }
    }
}
```

### PUT /categories/{id}

Modifier une catégorie existante (Admin seulement).

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
    "name": "string (required, max:255)",
    "description": "string (optional, max:1000)",
    "status": "string (optional, values: active|inactive)"
}
```

**Response 200 - Success:**

```json
{
    "success": true,
    "message": "Category updated successfully",
    "data": {
        "category": {
            "id": 1,
            "name": "Antibiotiques Modifiés",
            "description": "Description mise à jour",
            "status": "active",
            "updated_at": "2025-01-15T11:00:00Z"
        }
    }
}
```

### DELETE /categories/{id}

Désactiver une catégorie (soft delete) - Admin seulement.

**Headers:**

```
Authorization: Bearer {token}
```

**Response 200 - Success:**

```json
{
    "success": true,
    "message": "Category deactivated successfully"
}
```

---

## Suppliers Endpoints

### GET /suppliers

Lister tous les fournisseurs avec pagination.

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
page: integer (optional, default: 1)
per_page: integer (optional, default: 15, max: 100)
search: string (optional) - Search by name or contact
status: string (optional, values: active|inactive|all, default: active)
```

**Response 200 - Success:**

```json
{
    "success": true,
    "data": {
        "suppliers": [
            {
                "id": 1,
                "name": "Pharma Distribut",
                "contact_person": "Ahmed Ould Mohamed",
                "phone": "+222 45 67 89 01",
                "email": "contact@pharmadistribut.mr",
                "address": "Nouakchott, Mauritanie",
                "status": "active",
                "products_count": 150,
                "created_at": "2025-01-15T10:00:00Z"
            }
        ],
        "meta": {
            "current_page": 1,
            "per_page": 15,
            "total": 25,
            "last_page": 2
        }
    }
}
```

### POST /suppliers

Créer un nouveau fournisseur (Admin seulement).

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
    "name": "string (required, max:255)",
    "contact_person": "string (required, max:255)",
    "phone": "string (required, max:20)",
    "email": "string (optional, email, max:255)",
    "address": "string (optional, max:500)",
    "status": "string (optional, values: active|inactive, default: active)"
}
```

**Response 201 - Success:**

```json
{
    "success": true,
    "message": "Supplier created successfully",
    "data": {
        "supplier": {
            "id": 1,
            "name": "Pharma Distribut",
            "contact_person": "Ahmed Ould Mohamed",
            "phone": "+222 45 67 89 01",
            "email": "contact@pharmadistribut.mr",
            "address": "Nouakchott, Mauritanie",
            "status": "active",
            "created_at": "2025-01-15T10:00:00Z"
        }
    }
}
```

---

## Products Endpoints

### GET /products

Lister tous les produits avec filtres et pagination.

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
page: integer (optional, default: 1)
per_page: integer (optional, default: 15, max: 100)
search: string (optional) - Search by name or barcode
category_id: integer (optional) - Filter by category
supplier_id: integer (optional) - Filter by supplier
status: string (optional, values: active|inactive|all, default: active)
low_stock: boolean (optional) - Show only low stock products
expiring_soon: boolean (optional) - Show products expiring in 30 days
```

**Response 200 - Success:**

```json
{
    "success": true,
    "data": {
        "products": [
            {
                "id": 1,
                "name": "Amoxicilline 500mg",
                "generic_name": "Amoxicilline",
                "barcode": "1234567890123",
                "category": {
                    "id": 1,
                    "name": "Antibiotiques"
                },
                "supplier": {
                    "id": 1,
                    "name": "Pharma Distribut"
                },
                "purchase_price": 150.0,
                "selling_price": 200.0,
                "current_stock": 45,
                "low_stock_threshold": 10,
                "pharmaceutical_form": "Comprimé",
                "dosage": "500mg",
                "expiry_date": "2025-12-31",
                "status": "active",
                "image_url": "/storage/products/amoxicilline-500mg.jpg",
                "is_low_stock": false,
                "is_expiring_soon": false,
                "created_at": "2025-01-15T10:00:00Z"
            }
        ],
        "meta": {
            "current_page": 1,
            "per_page": 15,
            "total": 500,
            "last_page": 34
        }
    }
}
```

### POST /products

Créer un nouveau produit (Admin/Vendeur).

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**

```json
{
    "name": "string (required, max:255)",
    "generic_name": "string (optional, max:255)",
    "barcode": "string (required, max:50, unique)",
    "category_id": "integer (required, exists:categories,id)",
    "supplier_id": "integer (required, exists:suppliers,id)",
    "purchase_price": "decimal (required, min:0, max:999999.99)",
    "selling_price": "decimal (required, min:0, max:999999.99)",
    "initial_stock": "integer (required, min:0)",
    "low_stock_threshold": "integer (required, min:1)",
    "pharmaceutical_form": "string (required, max:100)",
    "dosage": "string (optional, max:100)",
    "expiry_date": "date (required, after:today)",
    "description": "string (optional, max:1000)",
    "image": "file (optional, image, max:2048kb)"
}
```

**Response 201 - Success:**

```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "product": {
            "id": 1,
            "name": "Amoxicilline 500mg",
            "generic_name": "Amoxicilline",
            "barcode": "1234567890123",
            "category_id": 1,
            "supplier_id": 1,
            "purchase_price": 150.0,
            "selling_price": 200.0,
            "current_stock": 100,
            "low_stock_threshold": 10,
            "pharmaceutical_form": "Comprimé",
            "dosage": "500mg",
            "expiry_date": "2025-12-31",
            "status": "active",
            "image_url": "/storage/products/amoxicilline-500mg.jpg",
            "created_at": "2025-01-15T10:00:00Z"
        }
    }
}
```

### PUT /products/{id}

Modifier un produit existant (Admin/Vendeur).

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:** Same as POST with optional fields

**Response 200 - Success:**

```json
{
    "success": true,
    "message": "Product updated successfully",
    "data": {
        "product": {
            "id": 1,
            "name": "Amoxicilline 500mg - Updated",
            "updated_at": "2025-01-15T11:00:00Z"
        }
    }
}
```

---

## Stock Movements Endpoints

### GET /stock-movements

Lister l'historique des mouvements de stock.

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
page: integer (optional, default: 1)
per_page: integer (optional, default: 15, max: 100)
product_id: integer (optional) - Filter by product
type: string (optional, values: in|out|adjustment) - Filter by movement type
date_from: date (optional) - Start date filter
date_to: date (optional) - End date filter
user_id: integer (optional) - Filter by user who made the movement
```

**Response 200 - Success:**

```json
{
    "success": true,
    "data": {
        "movements": [
            {
                "id": 1,
                "product": {
                    "id": 1,
                    "name": "Amoxicilline 500mg",
                    "barcode": "1234567890123"
                },
                "type": "in",
                "quantity": 50,
                "reference": "PO-2025-001",
                "reason": "Réception commande fournisseur",
                "user": {
                    "id": 2,
                    "name": "Admin Test"
                },
                "created_at": "2025-01-15T10:00:00Z"
            }
        ],
        "meta": {
            "current_page": 1,
            "per_page": 15,
            "total": 1250,
            "last_page": 84
        }
    }
}
```

### POST /stock-movements

Créer un mouvement de stock (entrée/sortie/ajustement) - Admin seulement.

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
    "product_id": "integer (required, exists:products,id)",
    "type": "string (required, values: in|out|adjustment)",
    "quantity": "integer (required, min:1)",
    "reference": "string (optional, max:100)",
    "reason": "string (required, max:255)"
}
```

**Response 201 - Success:**

```json
{
    "success": true,
    "message": "Stock movement recorded successfully",
    "data": {
        "movement": {
            "id": 1,
            "product_id": 1,
            "type": "in",
            "quantity": 50,
            "reference": "PO-2025-001",
            "reason": "Réception commande fournisseur",
            "user_id": 1,
            "created_at": "2025-01-15T10:00:00Z"
        },
        "new_stock": 95
    }
}
```

---

## Alerts Endpoints

### GET /alerts

Lister toutes les alertes de stock.

**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
type: string (optional, values: low_stock|expiring_soon|expired, default: all)
status: string (optional, values: active|seen, default: active)
page: integer (optional, default: 1)
per_page: integer (optional, default: 15, max: 100)
```

**Response 200 - Success:**

```json
{
    "success": true,
    "data": {
        "alerts": [
            {
                "id": 1,
                "type": "low_stock",
                "product": {
                    "id": 1,
                    "name": "Amoxicilline 500mg",
                    "current_stock": 5,
                    "low_stock_threshold": 10
                },
                "message": "Stock faible: 5 unités restantes",
                "priority": "medium",
                "status": "active",
                "created_at": "2025-01-15T10:00:00Z"
            },
            {
                "id": 2,
                "type": "expiring_soon",
                "product": {
                    "id": 2,
                    "name": "Paracétamol 500mg",
                    "expiry_date": "2025-02-15"
                },
                "message": "Expire dans 24 jours",
                "priority": "high",
                "status": "active",
                "created_at": "2025-01-15T10:00:00Z"
            }
        ],
        "summary": {
            "total_alerts": 15,
            "low_stock": 8,
            "expiring_soon": 5,
            "expired": 2
        }
    }
}
```

### PUT /alerts/{id}/mark-seen

Marquer une alerte comme vue.

**Headers:**

```
Authorization: Bearer {token}
```

**Response 200 - Success:**

```json
{
    "success": true,
    "message": "Alert marked as seen"
}
```

---

## Error Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict (duplicate)  |
| 422  | Validation Error      |
| 500  | Internal Server Error |

---

## Rate Limiting

| Endpoint Group | Limit                   |
| -------------- | ----------------------- |
| GET requests   | 100 requests per minute |
| POST requests  | 30 requests per minute  |
| PUT requests   | 30 requests per minute  |
| File uploads   | 10 requests per minute  |

---

## Validation Rules Summary

### Categories

- `name`: required, string, max:255, unique
- `description`: nullable, string, max:1000
- `status`: nullable, in:active,inactive

### Suppliers

- `name`: required, string, max:255
- `contact_person`: required, string, max:255
- `phone`: required, string, max:20
- `email`: nullable, email, max:255
- `address`: nullable, string, max:500

### Products

- `barcode`: required, string, max:50, unique
- `purchase_price`: required, decimal, min:0, max:999999.99
- `selling_price`: required, decimal, min:0, max:999999.99, gte:purchase_price
- `expiry_date`: required, date, after:today
- `image`: nullable, image, max:2048kb (jpg,png,gif)
