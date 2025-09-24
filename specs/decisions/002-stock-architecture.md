# ADR-002: Stock & Products Architecture

## Status

Accepted

## Context

Le système de pharmacie nécessite un module de gestion des stocks robuste avec suivi des médicaments, catégories, fournisseurs, mouvements de stock et alertes automatiques.

## Decision

Nous utiliserons une architecture modulaire avec des modèles séparés pour Products, Categories, Suppliers et StockMovements, avec un système d'alertes automatisé et un tracking complet des mouvements.

## Rationale

### Architecture de Base de Données

```
Categories (1) ←→ (N) Products (N) ←→ (1) Suppliers
                       ↓
                 StockMovements (N)
                       ↓
                   StockAlerts (N)
```

### Pourquoi cette structure ?

1. **Séparation des responsabilités** : Chaque entité a un rôle clair
2. **Flexibilité** : Permet l'évolution future (multi-fournisseurs par produit)
3. **Traçabilité** : Historique complet via StockMovements
4. **Performance** : Index optimisés pour les requêtes fréquentes

### Choix Techniques Clés

#### 1. Soft Deletes pour Categories et Suppliers

**Décision** : Utiliser `SoftDeletes` trait
**Justification** :

- Maintient l'intégrité des données historiques
- Évite les erreurs de référence dans les rapports
- Permet la restauration si nécessaire

#### 2. Stock Calculation Strategy

**Décision** : Calcul en temps réel basé sur les mouvements
**Justification** :

- Source de vérité unique (mouvements de stock)
- Audit trail complet
- Possibilité de recalcul en cas d'erreur

```php
// Stock actuel = stock initial + entrées - sorties + ajustements
$currentStock = $product->initial_stock +
    $product->movements()->where('type', 'in')->sum('quantity') -
    $product->movements()->where('type', 'out')->sum('quantity') +
    $product->movements()->where('type', 'adjustment')->sum('quantity');
```

#### 3. Alert System Design

**Décision** : Jobs en queue + cache pour performance
**Justification** :

- Calculs d'alertes peuvent être coûteux
- Évite la latence sur les requêtes utilisateur
- Permet la scalabilité

## Implementation Details

### Database Schema

#### Categories Table

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);
```

#### Suppliers Table

```sql
CREATE TABLE suppliers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);
```

#### Products Table

```sql
CREATE TABLE products (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    initial_stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    pharmaceutical_form VARCHAR(100) NOT NULL,
    dosage VARCHAR(100) NULL,
    expiry_date DATE NOT NULL,
    description TEXT NULL,
    image_path VARCHAR(500) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    INDEX idx_barcode (barcode),
    INDEX idx_category_id (category_id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_status (status)
);
```

#### Stock Movements Table

```sql
CREATE TABLE stock_movements (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INTEGER NOT NULL,
    reference VARCHAR(100) NULL,
    reason VARCHAR(255) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product_id (product_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);
```

#### Stock Alerts Table

```sql
CREATE TABLE stock_alerts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    type ENUM('low_stock', 'expiring_soon', 'expired') NOT NULL,
    message VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    status ENUM('active', 'seen') DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_product_id (product_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);
```

### Service Classes

#### StockService

```php
class StockService
{
    public function getCurrentStock(Product $product): int
    public function addStock(Product $product, int $quantity, string $reason, ?string $reference = null): StockMovement
    public function removeStock(Product $product, int $quantity, string $reason, ?string $reference = null): StockMovement
    public function adjustStock(Product $product, int $quantity, string $reason): StockMovement
    public function isLowStock(Product $product): bool
    public function isExpiringSoon(Product $product, int $days = 30): bool
}
```

#### AlertService

```php
class AlertService
{
    public function generateAlerts(): void
    public function getActiveAlerts(array $types = []): Collection
    public function markAsSeen(StockAlert $alert): void
    public function getAlertsSummary(): array
}
```

### Jobs & Queues

#### GenerateStockAlertsJob

```php
class GenerateStockAlertsJob implements ShouldQueue
{
    public function handle(AlertService $alertService): void
    {
        $alertService->generateAlerts();
    }
}
```

**Scheduling** : Toutes les heures via Laravel Scheduler

### Caching Strategy

#### Cache Keys

- `stock:product:{id}` : Stock actuel d'un produit (TTL: 1h)
- `alerts:summary` : Résumé des alertes (TTL: 15min)
- `alerts:active` : Liste des alertes actives (TTL: 15min)

#### Cache Invalidation

- Stock mis à jour → Invalider `stock:product:{id}`
- Nouvelle alerte → Invalider `alerts:*`

### File Storage

#### Product Images

- **Path** : `storage/app/public/products/`
- **Naming** : `{product_id}_{timestamp}.{extension}`
- **Sizes** : Original + Thumbnail (200x200)
- **Validation** : JPG, PNG, GIF, max 2MB

### Performance Optimizations

#### Database

- Index composé sur `(status, category_id)` pour filtres fréquents
- Partition de `stock_movements` par mois (si volume élevé)
- Read replicas pour rapports

#### Application

- Eager loading des relations (`with()`)
- Pagination obligatoire sur listes
- Cache des calculs coûteux
- Jobs en queue pour traitements lourds

## Alternatives Considérées

### 1. Stock en Colonne vs Calcul Dynamique

**Rejeté** : Colonne `current_stock` dans `products`
**Raison** : Risque de désynchronisation, complexité des transactions

### 2. Système d'Alertes Push vs Pull

**Rejeté** : Notifications push temps réel
**Raison** : Complexité excessive pour le MVP, jobs suffisants

### 3. Multi-fournisseurs par Produit

**Reporté** : Relation many-to-many products-suppliers
**Raison** : YAGNI pour le MVP, évolution future possible

## Consequences

### Positive

1. **Traçabilité complète** : Historique détaillé de tous les mouvements
2. **Flexibilité** : Architecture extensible pour futures fonctionnalités
3. **Performance** : Index optimisés et cache stratégique
4. **Intégrité** : Soft deletes préservent les données historiques
5. **Scalabilité** : Jobs en queue permettent la montée en charge

### Negative

1. **Complexité** : Plus de tables et relations à gérer
2. **Calculs** : Stock en temps réel peut être coûteux
3. **Storage** : Images produits consomment de l'espace
4. **Jobs** : Dépendance au système de queue

### Neutral

1. **Migration** : Évolution vers multi-fournisseurs possible
2. **Rapports** : Données riches permettent analyses avancées
3. **Maintenance** : Structure claire facilite le debug

## Monitoring & Metrics

### Performance Metrics

- Temps de réponse API stock < 200ms
- Génération alertes < 30s
- Upload images < 5s

### Business Metrics

- Nombre de produits en stock bas
- Fréquence des mouvements de stock
- Taux d'expiration des produits

### Alertes Système

- Queue jobs en échec
- Espace disque images > 80%
- Performance requêtes stock > 1s

## Migration Strategy

### Phase 1 : Core Models

- [ ] Models Product, Category, Supplier
- [ ] Migrations et seeders
- [ ] Relations Eloquent

### Phase 2 : Stock Management

- [ ] StockMovement model
- [ ] StockService avec calculs
- [ ] API CRUD basique

### Phase 3 : Alerts & Advanced

- [ ] StockAlert model et jobs
- [ ] Upload images
- [ ] Rapports et statistiques

## Review Date

Cette décision sera revue dans 3 mois ou lors de problèmes de performance significatifs.
