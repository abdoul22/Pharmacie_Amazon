<?php

/**
 * Script de configuration MySQL pour le fichier .env
 * 
 * Usage: php scripts/configure-mysql.php
 */

echo "=== Configuration MySQL pour .env ===\n\n";

$envPath = __DIR__ . '/../.env';

// Vérifier si le fichier .env existe
if (!file_exists($envPath)) {
    echo "❌ Fichier .env non trouvé dans la racine du projet\n";
    echo "Copiez .env.example vers .env et relancez ce script\n";
    exit(1);
}

// Lire le fichier .env
$envContent = file_get_contents($envPath);

echo "1. Lecture du fichier .env...\n";

// Configuration MySQL par défaut
$mysqlConfig = [
    'DB_CONNECTION' => 'mysql',
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '3306',
    'DB_DATABASE' => 'pharmacie_digitale',
    'DB_USERNAME' => 'root',
    'DB_PASSWORD' => '',
    'SESSION_DRIVER' => 'database',
    'SESSION_LIFETIME' => '120',
    'SESSION_INACTIVITY_TIMEOUT' => '60',
    'CACHE_STORE' => 'database',
    'QUEUE_CONNECTION' => 'database'
];

// Demander les informations à l'utilisateur
echo "\n2. Configuration MySQL :\n";

$mysqlConfig['DB_HOST'] = readline("   Host MySQL (127.0.0.1) : ") ?: '127.0.0.1';
$mysqlConfig['DB_PORT'] = readline("   Port MySQL (3306) : ") ?: '3306';
$mysqlConfig['DB_DATABASE'] = readline("   Nom de la base (pharmacie_digitale) : ") ?: 'pharmacie_digitale';
$mysqlConfig['DB_USERNAME'] = readline("   Nom d'utilisateur MySQL (root) : ") ?: 'root';
$mysqlConfig['DB_PASSWORD'] = readline("   Mot de passe MySQL : ");

// Demander si on veut configurer les autres paramètres
$configureAdvanced = strtolower(readline("\n   Configurer les paramètres avancés ? (y/N) : ")) === 'y';

if ($configureAdvanced) {
    $mysqlConfig['SESSION_LIFETIME'] = readline("   Durée de session en minutes (120) : ") ?: '120';
    $mysqlConfig['SESSION_INACTIVITY_TIMEOUT'] = readline("   Timeout d'inactivité en minutes (60) : ") ?: '60';
}

echo "\n3. Mise à jour du fichier .env...\n";

// Mettre à jour chaque configuration
foreach ($mysqlConfig as $key => $value) {
    // Chercher la ligne existante
    $pattern = "/^{$key}=.*/m";

    if (preg_match($pattern, $envContent)) {
        // Remplacer la ligne existante
        $envContent = preg_replace($pattern, "{$key}={$value}", $envContent);
        echo "   ✅ {$key} mis à jour\n";
    } else {
        // Ajouter une nouvelle ligne
        $envContent .= "\n{$key}={$value}";
        echo "   ➕ {$key} ajouté\n";
    }
}

// Écrire le fichier .env
if (file_put_contents($envPath, $envContent)) {
    echo "\n✅ Fichier .env mis à jour avec succès\n";
} else {
    echo "\n❌ Erreur lors de la mise à jour du fichier .env\n";
    exit(1);
}

echo "\n4. Résumé de la configuration :\n";
echo "   Host: {$mysqlConfig['DB_HOST']}\n";
echo "   Port: {$mysqlConfig['DB_PORT']}\n";
echo "   Base: {$mysqlConfig['DB_DATABASE']}\n";
echo "   Utilisateur: {$mysqlConfig['DB_USERNAME']}\n";
echo "   Mot de passe: " . (empty($mysqlConfig['DB_PASSWORD']) ? 'Aucun' : '***') . "\n";

echo "\n=== Prochaines étapes ===\n";
echo "1. Créez la base de données MySQL :\n";
echo "   mysql -u {$mysqlConfig['DB_USERNAME']} -p\n";
echo "   CREATE DATABASE {$mysqlConfig['DB_DATABASE']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
echo "   EXIT;\n\n";

echo "2. Exécutez les migrations :\n";
echo "   php artisan migrate\n\n";

echo "3. Exécutez le script de migration :\n";
echo "   php scripts/migrate-to-mysql.php\n\n";

echo "4. Créez un SuperAdmin :\n";
echo "   php artisan tinker\n";
echo "   \$superadminRole = \\App\\Models\\Role::where('name', 'superadmin')->first();\n";
echo "   \$user = \\App\\Models\\User::create([...]);\n\n";

echo "Configuration terminée ! 🎉\n";
