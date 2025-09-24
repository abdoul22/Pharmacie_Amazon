# Feature: Stock & Products Management

## Overview

Système complet de gestion des stocks, produits (médicaments), catégories et fournisseurs pour la pharmacie en ligne.

## User Stories

### US-010: Category Management

**En tant qu'** admin  
**Je veux** gérer les catégories de médicaments  
**Afin de** organiser efficacement l'inventaire

**Acceptance Criteria:**

- [ ] Créer une nouvelle catégorie (nom, description, statut actif/inactif)
- [ ] Modifier les informations d'une catégorie existante
- [ ] Désactiver/Activer une catégorie (soft delete)
- [ ] Lister toutes les catégories avec pagination
- [ ] Rechercher des catégories par nom
- [ ] Une catégorie peut contenir plusieurs produits
- [ ] Validation : nom unique et obligatoire

### US-011: Supplier Management

**En tant qu'** admin  
**Je veux** gérer les fournisseurs  
**Afin de** maintenir les relations commerciales et traçabilité

**Acceptance Criteria:**

- [ ] Créer un nouveau fournisseur (nom, contact, adresse, téléphone, email)
- [ ] Modifier les informations d'un fournisseur
- [ ] Désactiver/Activer un fournisseur
- [ ] Lister tous les fournisseurs avec pagination
- [ ] Rechercher des fournisseurs par nom ou contact
- [ ] Un fournisseur peut fournir plusieurs produits
- [ ] Validation : nom et contact obligatoires, email valide

### US-012: Product (Medication) Management

**En tant qu'** admin ou vendeur  
**Je veux** gérer les médicaments  
**Afin de** maintenir un inventaire précis

**Acceptance Criteria:**

- [ ] Créer un nouveau médicament avec :
    - Nom commercial et générique
    - Code-barres unique
    - Catégorie associée
    - Fournisseur principal
    - Prix d'achat et de vente
    - Stock initial
    - Seuil d'alerte stock bas
    - Date d'expiration
    - Forme pharmaceutique (comprimé, sirop, etc.)
    - Dosage et unité
- [ ] Modifier les informations d'un médicament
- [ ] Désactiver/Activer un médicament
- [ ] Lister tous les médicaments avec filtres (catégorie, fournisseur, statut)
- [ ] Recherche avancée (nom, code-barres, forme)
- [ ] Upload d'image du produit

### US-013: Stock Movement Tracking

**En tant qu'** admin ou vendeur  
**Je veux** suivre les mouvements de stock  
**Afin de** maintenir la traçabilité

**Acceptance Criteria:**

- [ ] Enregistrer automatiquement les entrées de stock (réception)
- [ ] Enregistrer automatiquement les sorties de stock (vente)
- [ ] Enregistrer les ajustements manuels de stock
- [ ] Historique complet des mouvements avec :
    - Date et heure
    - Type de mouvement (entrée/sortie/ajustement)
    - Quantité
    - Utilisateur responsable
    - Motif/Référence
- [ ] Calcul automatique du stock actuel
- [ ] Validation : quantités positives pour entrées

### US-014: Stock Alerts System

**En tant qu'** admin ou vendeur  
**Je veux** recevoir des alertes de stock  
**Afin de** éviter les ruptures et gérer les expirations

**Acceptance Criteria:**

- [ ] Alerte stock bas quand quantité ≤ seuil défini
- [ ] Alerte expiration proche (30 jours avant expiration)
- [ ] Alerte expiration critique (7 jours avant expiration)
- [ ] Dashboard avec compteurs d'alertes
- [ ] Liste des produits en alerte avec filtres
- [ ] Notification visuelle dans l'interface
- [ ] Possibilité de marquer une alerte comme "vue"

### US-015: Inventory Reports

**En tant qu'** admin  
**Je veux** générer des rapports d'inventaire  
**Afin de** analyser la performance des stocks

**Acceptance Criteria:**

- [ ] Rapport de stock actuel (tous produits avec quantités)
- [ ] Rapport des mouvements par période
- [ ] Rapport des produits les plus vendus
- [ ] Rapport des produits en rupture
- [ ] Rapport des produits proches d'expiration
- [ ] Export en PDF et Excel
- [ ] Filtres par catégorie, fournisseur, période

## Business Rules

### BR-010: Stock Calculation

- Stock actuel = Stock initial + Total entrées - Total sorties + Ajustements
- Les quantités négatives ne sont pas autorisées
- Les mouvements de stock sont immutables une fois créés

### BR-011: Product Validation

- Code-barres unique dans le système
- Prix de vente ≥ prix d'achat
- Seuil d'alerte > 0
- Date d'expiration > date actuelle (pour nouveaux produits)

### BR-012: Category & Supplier Rules

- Impossible de supprimer une catégorie avec des produits actifs
- Impossible de supprimer un fournisseur avec des produits actifs
- Soft delete pour maintenir l'intégrité des données historiques

### BR-013: Alert Thresholds

- Stock bas : quantité ≤ seuil défini par produit
- Expiration proche : 30 jours avant date d'expiration
- Expiration critique : 7 jours avant date d'expiration
- Produit expiré : date d'expiration dépassée

### BR-014: User Permissions

- Admin : CRUD complet sur tous les éléments
- Vendeur : Lecture seule + ajout de produits
- Caissier : Lecture seule uniquement
- Superadmin : Tous les droits

## Technical Notes

- Utilisation de soft deletes pour catégories et fournisseurs
- Index sur code-barres pour performance
- Stockage des images produits dans storage/app/public/products
- Cache des alertes pour performance
- Jobs en queue pour calculs de stock intensifs

## Definition of Done

- [ ] Toutes les US implémentées et testées
- [ ] Tests unitaires et fonctionnels passent (>95% couverture)
- [ ] API documentée et testée
- [ ] Interface utilisateur responsive
- [ ] Validation côté client et serveur
- [ ] Gestion d'erreurs complète
- [ ] Performance optimisée (requêtes < 100ms)
- [ ] Code review validé
- [ ] Documentation utilisateur mise à jour
