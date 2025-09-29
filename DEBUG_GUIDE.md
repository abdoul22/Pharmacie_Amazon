# 🔧 Guide de Débogage - Pages Noires

## Problème Identifié

Les pages s'affichent en noir et la console affiche des erreurs d'import.

## Solutions Appliquées

### ✅ 1. Erreur d'import corrigée

- **Problème** : `useAuth` n'existe pas, c'est `useAuthContext`
- **Solution** : Corrigé dans `UserManagement.tsx`

### ✅ 2. API d'authentification testée

- **Test** : L'API `/api/auth/user` fonctionne correctement
- **SuperAdmin** : Créé et fonctionnel

## Étapes de Débogage

### 1. Vérifier la Console du Navigateur

Ouvrez les outils de développement (F12) et vérifiez :

- **Console** : Erreurs JavaScript
- **Network** : Requêtes API qui échouent
- **Application** : Token d'authentification stocké

### 2. Tester l'Authentification

```bash
# 1. Démarrer le serveur
php artisan serve

# 2. Ouvrir http://localhost:8000
# 3. Se connecter avec :
#    Email: admin@pharmacie.com
#    Mot de passe: SuperAdmin123!
```

### 3. Vérifier les Routes

- **Page de test** : `http://localhost:8000/app/test`
- **Gestion utilisateurs** : `http://localhost:8000/app/user-management`

### 4. Vérifier le Token

Dans la console du navigateur :

```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('auth_token'));

// Tester l'API
fetch('/api/auth/user', {
    headers: {
        Authorization: 'Bearer ' + localStorage.getItem('auth_token'),
        Accept: 'application/json',
    },
})
    .then((r) => r.json())
    .then(console.log);
```

## Causes Possibles des Pages Noires

### 1. **Problème d'Authentification**

- L'utilisateur n'est pas connecté
- Le token est invalide ou expiré
- L'API d'authentification ne répond pas

### 2. **Problème de CSS/Thème**

- Variables CSS non définies
- Conflit de thème sombre/clair
- Tailwind CSS non chargé

### 3. **Problème de JavaScript**

- Erreur dans le contexte d'authentification
- Import manquant ou incorrect
- Erreur de compilation TypeScript

## Solutions par Étape

### Étape 1 : Vérifier l'Authentification

1. Ouvrir `http://localhost:8000`
2. Se connecter avec les identifiants SuperAdmin
3. Vérifier que la redirection vers `/app/dashboard` fonctionne

### Étape 2 : Tester la Page de Test

1. Aller sur `http://localhost:8000/app/test`
2. Vérifier que la page s'affiche correctement
3. Si elle fonctionne, le problème est dans l'authentification

### Étape 3 : Vérifier la Console

1. Ouvrir F12 → Console
2. Chercher les erreurs en rouge
3. Noter les erreurs d'import ou d'API

### Étape 4 : Vérifier le Token

1. F12 → Application → Local Storage
2. Vérifier que `auth_token` existe
3. Tester l'API avec le token

## Commandes de Débogage

```bash
# Vérifier les routes
php artisan route:list

# Vérifier les migrations
php artisan migrate:status

# Nettoyer le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Vérifier les logs
tail -f storage/logs/laravel.log
```

## Prochaines Étapes

1. **Tester l'authentification** avec les identifiants SuperAdmin
2. **Vérifier la console** pour les erreurs JavaScript
3. **Tester la page de test** pour isoler le problème
4. **Vérifier le token** dans le localStorage

## Contact

Si le problème persiste, fournir :

- Capture d'écran de la console
- Erreurs JavaScript exactes
- URL où le problème se produit
- Navigateur utilisé
