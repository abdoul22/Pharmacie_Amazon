# Configuration Base de Données MySQL

## Configuration requise pour MySQL

### 1. Installation de MySQL

**Windows:**

```bash
# Télécharger MySQL Community Server depuis https://dev.mysql.com/downloads/
# Ou utiliser XAMPP/WAMP qui inclut MySQL
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Configuration du fichier .env

Copiez le fichier `.env.example` vers `.env` et modifiez les paramètres suivants :

```env
# Configuration Base de Données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pharmacie_digitale
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe_mysql

# Configuration Session
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_INACTIVITY_TIMEOUT=60

# Configuration Sécurité
SESSION_TIMEOUT_MINUTES=60
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=15
```

### 3. Création de la base de données

Connectez-vous à MySQL et créez la base de données :

```sql
mysql -u root -p

CREATE DATABASE pharmacie_digitale CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pharmacie_user'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON pharmacie_digitale.* TO 'pharmacie_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Exécution des migrations

```bash
# Générer la clé d'application
php artisan key:generate

# Exécuter les migrations
php artisan migrate

# Optionnel : Seeder les données de base
php artisan db:seed
```

### 5. Création du SuperAdmin via Tinker

⚠️ **IMPORTANT** : Le SuperAdmin ne peut être créé que via Tinker pour des raisons de sécurité.

```bash
php artisan tinker
```

Puis exécutez :

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

1. Connectez-vous avec les identifiants SuperAdmin
2. Accédez à `/app/user-management` pour gérer les utilisateurs
3. Testez l'inscription d'un nouvel utilisateur sur `/auth/register`

### 7. Sauvegarde et Restauration

**Sauvegarde :**

```bash
mysqldump -u root -p pharmacie_digitale > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restauration :**

```bash
mysql -u root -p pharmacie_digitale < backup_file.sql
```

### 8. Sécurité Production

Pour la production, assurez-vous de :

1. **Changer le mot de passe SuperAdmin** après la première connexion
2. **Configurer SSL/TLS** pour la connexion MySQL
3. **Limiter les accès** aux utilisateurs de base de données
4. **Activer les logs** de connexion MySQL
5. **Configurer les sauvegardes automatiques**

### 9. Dépannage

**Erreur de connexion MySQL :**

- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `.env`
- Vérifiez que le port 3306 est ouvert

**Erreur de migration :**

- Vérifiez que la base de données existe
- Vérifiez les permissions de l'utilisateur MySQL
- Vérifiez la version de MySQL (minimum 8.0)

**Erreur de création SuperAdmin :**

- Vérifiez que les migrations ont été exécutées
- Vérifiez que la table `roles` contient le rôle superadmin
- Vérifiez la syntaxe de la commande Tinker
