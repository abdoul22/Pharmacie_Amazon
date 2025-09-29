# 🚀 Guide de Démarrage Rapide

## Situation Actuelle

Vous utilisez actuellement **SQLite** et avez un système de gestion des utilisateurs fonctionnel.

## Options Disponibles

### Option 1 : Rester avec SQLite (Simple)

**Avantages :** Pas de configuration supplémentaire, fonctionne immédiatement
**Inconvénients :** Limité pour la production, pas de concurrence d'écriture

**Actions :**

```bash
# Créer le SuperAdmin directement
php artisan tinker
```

Puis :

```php
$superadminRole = \App\Models\Role::where('name', 'superadmin')->first();
$user = \App\Models\User::create([
    'name' => 'Super Admin',
    'email' => 'admin@pharmacie.com',
    'password' => \Hash::make('SuperAdmin123!'),
    'role_id' => $superadminRole->id,
    'is_approved' => true
]);
echo "SuperAdmin créé : " . $user->email;
exit
```

### Option 2 : Migrer vers MySQL (Recommandé)

**Avantages :** Production-ready, meilleures performances, concurrence
**Inconvénients :** Configuration MySQL nécessaire

**Actions :**

1. **Configuration automatique :**

```bash
php scripts/configure-mysql.php
```

2. **Créer la base MySQL :**

```sql
mysql -u root -p
CREATE DATABASE pharmacie_digitale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

3. **Migrer et vérifier :**

```bash
php scripts/migrate-to-mysql.php
```

## Recommandation

### Pour le Développement (Maintenant)

✅ **Option 1 (SQLite)** - Créez le SuperAdmin et testez l'application

### Pour la Production (Plus tard)

✅ **Option 2 (MySQL)** - Migrez quand vous serez prêt pour la production

## Test de l'Application

Une fois le SuperAdmin créé :

```bash
# Démarrer l'application
php artisan serve

# Ouvrir http://localhost:8000
# Se connecter avec : admin@pharmacie.com / SuperAdmin123!
# Accéder à /app/user-management
# Tester l'inscription et l'approbation d'utilisateurs
```

## Que voulez-vous faire maintenant ?

1. **Créer le SuperAdmin avec SQLite** (rapide)
2. **Configurer MySQL** (recommandé pour la production)
3. **Tester l'application** (après création SuperAdmin)

Choisissez votre option ! 🎯
