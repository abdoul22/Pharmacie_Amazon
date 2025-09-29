# Migration de SQLite vers MySQL

## Étapes de migration

### 1. Sauvegarde des données SQLite

Avant de migrer vers MySQL, sauvegardez vos données SQLite :

```bash
# Créer une sauvegarde de la base SQLite
cp database/database.sqlite database/database_backup_$(date +%Y%m%d).sqlite
```

### 2. Configuration MySQL

#### Installation MySQL (si nécessaire)

**Windows :**

- Télécharger MySQL Community Server
- Ou utiliser XAMPP/WAMP

**Linux :**

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### Création de la base de données

```sql
mysql -u root -p

CREATE DATABASE pharmacie_digitale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pharmacie_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON pharmacie_digitale.* TO 'pharmacie_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configuration du fichier .env

Modifiez votre fichier `.env` existant :

```env
# Ancienne configuration SQLite (à remplacer)
# DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite

# Nouvelle configuration MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pharmacie_digitale
DB_USERNAME=pharmacie_user
DB_PASSWORD=mot_de_passe_securise

# Configuration Session (recommandé pour MySQL)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_INACTIVITY_TIMEOUT=60

# Configuration Cache (recommandé pour MySQL)
CACHE_STORE=database
CACHE_PREFIX=

# Configuration Queue (recommandé pour MySQL)
QUEUE_CONNECTION=database
```

### 4. Migration des données

#### Option A : Migration propre (recommandée)

```bash
# 1. Vider la base MySQL (si elle contient des données)
php artisan migrate:fresh

# 2. Exécuter les seeders
php artisan db:seed
```

#### Option B : Migration avec données existantes

Si vous avez des données importantes dans SQLite :

```bash
# 1. Exporter les données SQLite
sqlite3 database/database.sqlite .dump > sqlite_backup.sql

# 2. Nettoyer le dump pour MySQL
# (Supprimer les commandes SQLite spécifiques)

# 3. Importer dans MySQL
mysql -u pharmacie_user -p pharmacie_digitale < sqlite_backup_cleaned.sql
```

### 5. Création du SuperAdmin

```bash
php artisan tinker
```

```php
// Récupérer le rôle superadmin
$superadminRole = \App\Models\Role::where('name', 'superadmin')->first();

// Créer l'utilisateur superadmin
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

### 6. Vérification

```bash
# Vérifier la connexion
php artisan tinker --execute="echo 'Connexion MySQL OK: ' . \DB::connection()->getDatabaseName();"

# Vérifier les rôles
php artisan tinker --execute="echo 'Rôles: ' . \App\Models\Role::count();"

# Vérifier les utilisateurs
php artisan tinker --execute="echo 'Utilisateurs: ' . \App\Models\User::count();"
```

### 7. Nettoyage

```bash
# Supprimer la base SQLite (optionnel)
rm database/database.sqlite

# Supprimer les fichiers de cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Avantages de MySQL vs SQLite

### MySQL

- ✅ **Concurrence** : Gestion multi-utilisateurs
- ✅ **Performance** : Index optimisés, requêtes complexes
- ✅ **Sécurité** : Permissions granulaires
- ✅ **Scalabilité** : Gestion de gros volumes
- ✅ **Réplication** : Sauvegardes et haute disponibilité

### SQLite

- ✅ **Simplicité** : Pas de serveur à configurer
- ✅ **Portabilité** : Un seul fichier
- ❌ **Limitations** : Pas de concurrence d'écriture
- ❌ **Performance** : Limité pour les gros volumes

## Dépannage

### Erreur de connexion MySQL

```
SQLSTATE[HY000] [2002] Connection refused
```

**Solutions :**

1. Vérifier que MySQL est démarré
2. Vérifier l'host et le port dans .env
3. Vérifier les identifiants

### Erreur de permissions

```
SQLSTATE[42000] [1044] Access denied for user
```

**Solutions :**

1. Vérifier les permissions GRANT
2. Vérifier que la base existe
3. Vérifier le mot de passe

### Erreur de charset

```
SQLSTATE[42000] [1267] Illegal mix of collations
```

**Solutions :**

1. Utiliser utf8mb4_unicode_ci
2. Recréer la base avec le bon charset
3. Vérifier la configuration MySQL

## Configuration de production

### Variables d'environnement recommandées

```env
APP_ENV=production
APP_DEBUG=false
DB_HOST=votre-serveur-mysql.com
DB_DATABASE=pharmacie_production
DB_USERNAME=pharmacie_user
DB_PASSWORD=mot_de_passe_tres_securise

# SSL pour MySQL (recommandé)
DB_SSLMODE=require

# Sessions sécurisées
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict
```

### Sécurité

1. **Mot de passe fort** pour l'utilisateur MySQL
2. **Connexion SSL** pour MySQL
3. **Limitation des IP** autorisées
4. **Sauvegardes automatiques**
5. **Monitoring des connexions**
