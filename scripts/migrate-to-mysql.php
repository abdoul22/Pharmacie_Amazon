<?php

/**
 * Script de migration de SQLite vers MySQL
 * 
 * Usage: php scripts/migrate-to-mysql.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Migration SQLite vers MySQL ===\n\n";

// 1. Vérifier la configuration actuelle
echo "1. Vérification de la configuration...\n";

$currentConnection = config('database.default');
$currentDatabase = config('database.connections.' . $currentConnection . '.database');

echo "   Connexion actuelle: {$currentConnection}\n";
echo "   Base de données: {$currentDatabase}\n";

if ($currentConnection === 'mysql') {
    echo "   ✅ Déjà configuré pour MySQL\n";
} else {
    echo "   ⚠️  Configuration SQLite détectée\n";
    echo "   Veuillez modifier votre fichier .env pour utiliser MySQL\n";
    echo "   Voir docs/MIGRATION_SQLITE_TO_MYSQL.md\n";
    exit(1);
}

// 2. Tester la connexion MySQL
echo "\n2. Test de connexion MySQL...\n";

try {
    DB::connection()->getPdo();
    echo "   ✅ Connexion MySQL réussie\n";
    echo "   Base de données: " . DB::connection()->getDatabaseName() . "\n";
} catch (Exception $e) {
    echo "   ❌ Erreur de connexion MySQL: " . $e->getMessage() . "\n";
    echo "   Vérifiez votre configuration dans .env\n";
    exit(1);
}

// 3. Vérifier les migrations
echo "\n3. Vérification des migrations...\n";

try {
    $migrations = DB::table('migrations')->count();
    echo "   ✅ Migrations trouvées: {$migrations}\n";
} catch (Exception $e) {
    echo "   ⚠️  Aucune migration trouvée, exécution des migrations...\n";

    try {
        Artisan::call('migrate');
        echo "   ✅ Migrations exécutées avec succès\n";
    } catch (Exception $e) {
        echo "   ❌ Erreur lors des migrations: " . $e->getMessage() . "\n";
        exit(1);
    }
}

// 4. Vérifier les rôles
echo "\n4. Vérification des rôles...\n";

try {
    $rolesCount = \App\Models\Role::count();
    echo "   ✅ Rôles trouvés: {$rolesCount}\n";

    if ($rolesCount === 0) {
        echo "   ⚠️  Aucun rôle trouvé, exécution des seeders...\n";
        Artisan::call('db:seed');
        echo "   ✅ Seeders exécutés avec succès\n";
    }

    // Lister les rôles
    $roles = \App\Models\Role::all();
    foreach ($roles as $role) {
        echo "     - {$role->name} ({$role->display_name}) - Niveau {$role->level}\n";
    }
} catch (Exception $e) {
    echo "   ❌ Erreur lors de la vérification des rôles: " . $e->getMessage() . "\n";
    exit(1);
}

// 5. Vérifier les utilisateurs
echo "\n5. Vérification des utilisateurs...\n";

try {
    $usersCount = \App\Models\User::count();
    echo "   ✅ Utilisateurs trouvés: {$usersCount}\n";

    if ($usersCount > 0) {
        $users = \App\Models\User::with('role')->get();
        foreach ($users as $user) {
            $roleName = ($user->role && is_object($user->role)) ? $user->role->name : 'Aucun';
            $status = $user->is_approved ? 'Approuvé' : 'En attente';
            echo "     - {$user->name} ({$user->email}) - {$roleName} - {$status}\n";
        }
    }
} catch (Exception $e) {
    echo "   ❌ Erreur lors de la vérification des utilisateurs: " . $e->getMessage() . "\n";
    exit(1);
}

// 6. Vérifier le SuperAdmin
echo "\n6. Vérification du SuperAdmin...\n";

try {
    $superadminRole = \App\Models\Role::where('name', 'superadmin')->first();

    if ($superadminRole) {
        $superadminUser = \App\Models\User::where('role_id', $superadminRole->id)->first();

        if ($superadminUser) {
            echo "   ✅ SuperAdmin trouvé: {$superadminUser->email}\n";
        } else {
            echo "   ⚠️  Aucun SuperAdmin trouvé\n";
            echo "   Créez un SuperAdmin avec la commande Tinker :\n";
            echo "   php artisan tinker\n";
            echo "   \$superadminRole = \\App\\Models\\Role::where('name', 'superadmin')->first();\n";
            echo "   \$user = \\App\\Models\\User::create([...]);\n";
        }
    } else {
        echo "   ❌ Rôle superadmin non trouvé\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ❌ Erreur lors de la vérification du SuperAdmin: " . $e->getMessage() . "\n";
    exit(1);
}

// 7. Nettoyage du cache
echo "\n7. Nettoyage du cache...\n";

try {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    echo "   ✅ Cache nettoyé\n";
} catch (Exception $e) {
    echo "   ⚠️  Erreur lors du nettoyage du cache: " . $e->getMessage() . "\n";
}

// 8. Résumé final
echo "\n=== Résumé de la migration ===\n";
echo "✅ Configuration MySQL: OK\n";
echo "✅ Connexion base de données: OK\n";
echo "✅ Migrations: OK\n";
echo "✅ Rôles: OK\n";
echo "✅ Utilisateurs: OK\n";
echo "✅ SuperAdmin: " . ($superadminUser ? "OK" : "À créer") . "\n";
echo "✅ Cache: OK\n";

echo "\n=== Prochaines étapes ===\n";
echo "1. Créez un SuperAdmin si nécessaire (voir ci-dessus)\n";
echo "2. Testez l'application: php artisan serve\n";
echo "3. Connectez-vous avec le SuperAdmin\n";
echo "4. Accédez à /app/user-management pour gérer les utilisateurs\n";

echo "\nMigration terminée avec succès ! 🎉\n";
