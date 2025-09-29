# Configuration .env pour MySQL

## Configuration de base de données recommandée

Copiez ces paramètres dans votre fichier `.env` :

```env
# Configuration Base de Données MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pharmacie_digitale
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe_mysql

# Configuration Session (recommandé pour MySQL)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

# Configuration de sécurité
SESSION_INACTIVITY_TIMEOUT=60
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=15

# Configuration de l'application
APP_NAME="Pharmacie Digitale"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Configuration de cache (recommandé pour MySQL)
CACHE_STORE=database
CACHE_PREFIX=

# Configuration de queue (recommandé pour MySQL)
QUEUE_CONNECTION=database

# Configuration spécifique à la pharmacie
PHARMACY_NAME="Pharmacie Digitale"
PHARMACY_ADDRESS="Nouakchott, Mauritanie"
PHARMACY_PHONE="+222 XX XX XX XX"
PHARMACY_EMAIL="contact@pharmacie.com"

# Configuration des paiements
PAYMENT_CURRENCY=MRU
PAYMENT_DECIMAL_PLACES=0
```

## Étapes de configuration

### 1. Créer la base de données MySQL

```sql
CREATE DATABASE pharmacie_digitale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pharmacie_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON pharmacie_digitale.* TO 'pharmacie_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configurer le fichier .env

Remplacez `votre_mot_de_passe_mysql` par votre mot de passe MySQL réel.

### 3. Générer la clé d'application

```bash
php artisan key:generate
```

### 4. Exécuter les migrations

```bash
php artisan migrate
```

### 5. Créer le SuperAdmin

```bash
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

## Configuration pour la production

### Variables d'environnement de production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

DB_HOST=votre-serveur-mysql.com
DB_DATABASE=pharmacie_production
DB_USERNAME=pharmacie_user
DB_PASSWORD=mot_de_passe_tres_securise

SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

# Configuration SSL pour MySQL (recommandé)
DB_SSLMODE=require
```

### Sécurité recommandée

1. **Mot de passe fort** pour l'utilisateur MySQL
2. **Connexion SSL** pour MySQL
3. **Limitation des IP** autorisées
4. **Sauvegardes automatiques**
5. **Monitoring des connexions**

## Dépannage

### Erreur de connexion MySQL

```
SQLSTATE[HY000] [2002] Connection refused
```

**Solutions :**

- Vérifiez que MySQL est démarré
- Vérifiez l'host et le port dans .env
- Vérifiez les identifiants

### Erreur de permissions

```
SQLSTATE[42000] [1044] Access denied for user
```

**Solutions :**

- Vérifiez les permissions de l'utilisateur MySQL
- Vérifiez que la base de données existe
- Vérifiez les privilèges GRANT

### Erreur de charset

```
SQLSTATE[42000] [1267] Illegal mix of collations
```

**Solutions :**

- Utilisez utf8mb4_unicode_ci
- Vérifiez la configuration MySQL
- Recréez la base avec le bon charset
