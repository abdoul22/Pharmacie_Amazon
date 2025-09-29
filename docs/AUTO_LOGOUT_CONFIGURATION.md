# 🔒 Configuration de la Déconnexion Automatique

## Vue d'ensemble

Le système de déconnexion automatique protège votre application pharmacie en déconnectant automatiquement les utilisateurs après une période d'inactivité configurée. **Par défaut, les utilisateurs sont déconnectés après 1 heure (60 minutes) d'inactivité**.

## 🚀 Fonctionnalités

### ✅ Détection d'activité automatique

- **Mouvements de souris** et clics
- **Saisie clavier** dans tous les champs
- **Touches tactiles** (tablettes/mobiles)
- **Défilement de page** et navigation
- **Focus sur éléments** (boutons, liens, etc.)

### ⚠️ Avertissements intelligents

- **Avertissement 5 minutes** avant déconnexion
- **Compte à rebours visuel** en temps réel
- **Modal interactif** pour étendre la session
- **Possibilité de se déconnecter** immédiatement

### 🛡️ Sécurité renforcée

- **Nettoyage automatique** des tokens d'authentification
- **Suppression des données sensibles** (panier, données temporaires)
- **Logs de sécurité** pour traçabilité
- **Protection côté serveur** avec middleware Laravel

## 📋 Configuration

### 1. Variable d'environnement `.env`

Ajoutez cette ligne dans votre fichier `.env` :

```env
# Délai d'inactivité en minutes (par défaut: 60 minutes = 1 heure)
SESSION_INACTIVITY_TIMEOUT=60
```

### 2. Valeurs recommandées par contexte

```env
# Développement - 30 minutes
SESSION_INACTIVITY_TIMEOUT=30

# Production standard - 1 heure
SESSION_INACTIVITY_TIMEOUT=60

# Haute sécurité - 15 minutes
SESSION_INACTIVITY_TIMEOUT=15

# Environnement de formation - 2 heures
SESSION_INACTIVITY_TIMEOUT=120
```

### 3. Configuration avancée React

Vous pouvez personnaliser le comportement dans `resources/js/router/AppRouter.tsx` :

```typescript
<SessionManager
  config={{
    inactivityTimeoutMinutes: 60,    // Délai total avant déconnexion
    warningTimeoutMinutes: 5,        // Avertissement X minutes avant
    disabled: false,                 // Activer/désactiver le système
  }}
>
  <AppRouterContent />
</SessionManager>
```

## 🎯 Scénarios d'utilisation

### 📱 Environnement mobile/tablette

```typescript
// Configuration optimisée pour tablettes en pharmacie
<SessionManager
  config={{
    inactivityTimeoutMinutes: 30,     // Session plus courte
    warningTimeoutMinutes: 3,         // Avertissement plus court
  }}
>
```

### 🏥 Poste de travail partagé

```typescript
// Configuration sécurisée pour postes partagés
<SessionManager
  config={{
    inactivityTimeoutMinutes: 15,     // Déconnexion rapide
    warningTimeoutMinutes: 2,         // Avertissement immédiat
  }}
>
```

### 🔧 Mode développement/formation

```typescript
// Configuration souple pour développement
<SessionManager
  config={{
    inactivityTimeoutMinutes: 120,    // 2 heures
    warningTimeoutMinutes: 10,        // 10 minutes d'avertissement
  }}
>
```

## 📊 Événements trackés

Le système détecte ces activités utilisateur :

| Événement    | Description       | Fréquence     |
| ------------ | ----------------- | ------------- |
| `mousedown`  | Clic souris       | Immédiat      |
| `mousemove`  | Mouvement souris  | Throttlé à 1s |
| `keypress`   | Saisie clavier    | Immédiat      |
| `scroll`     | Défilement page   | Throttlé à 1s |
| `touchstart` | Contact tactile   | Immédiat      |
| `focus`      | Focus sur élément | Immédiat      |

## ⚙️ Personnalisation du Modal

### 1. Textes personnalisés

```typescript
<InactivityWarningModal
  config={{
    title: "⏰ Session expire bientôt",
    description: "Vous allez être déconnecté dans quelques minutes.",
    extendButtonText: "Continuer ma session",
    logoutButtonText: "Se déconnecter maintenant",
    showLogoutButton: true,
  }}
/>
```

### 2. Thème sombre/clair

Le modal s'adapte automatiquement au thème de votre application via les classes Tailwind `dark:`.

## 🛠️ Tests et validation

### Test du délai d'inactivité

1. **Connectez-vous** à l'application
2. **Ne touchez rien** pendant 55 minutes (pour un délai de 60 min)
3. **Modal d'avertissement** doit apparaître à 5 minutes
4. **Compte à rebours** doit commencer
5. **Déconnexion automatique** après 5 minutes supplémentaires

### Test de réactivation

1. **Laissez apparaître** le modal d'avertissement
2. **Cliquez sur "Continuer ma session"**
3. **Modal doit se fermer** et délai se réinitialise
4. **Aucune déconnexion** ne doit avoir lieu

### Test d'activité continue

1. **Restez actif** (bougez la souris régulièrement)
2. **Modal ne doit jamais apparaître**
3. **Session reste active** indéfiniment

## 📝 Logs et monitoring

### Logs Laravel

```php
// Logs automatiques dans storage/logs/laravel.log
[INFO] Session expirée pour inactivité: user_id=123, timeout_minutes=60
[INFO] Déconnexion automatique - Inactivité détectée
```

### Logs JavaScript Console

```javascript
// Dans la console du navigateur
⚠️ Avertissement de déconnexion - Inactivité détectée
🔒 Déconnexion automatique pour inactivité
🔓 Déconnexion réussie - Données nettoyées
🔄 Session étendue par l'utilisateur
```

## 🚨 Dépannage

### Problème: Modal n'apparaît pas

**Cause:** SessionManager désactivé ou mal configuré

**Solution:**

```typescript
// Vérifier que disabled est false
<SessionManager config={{ disabled: false }}>
```

### Problème: Déconnexion immédiate

**Cause:** Délai trop court dans .env

**Solution:**

```env
# Augmenter le délai
SESSION_INACTIVITY_TIMEOUT=60
```

### Problème: Session ne s'étend pas

**Cause:** Token Sanctum expiré côté serveur

**Solution:**

```php
// Dans config/sanctum.php
'expiration' => null, // Pas d'expiration forcée
```

## 🔒 Sécurité

### Données nettoyées lors de la déconnexion

```javascript
// Tokens d'authentification
localStorage.removeItem('auth_token');
sessionStorage.removeItem('auth_token');

// Données métier sensibles
localStorage.removeItem('user_preferences');
sessionStorage.removeItem('cart_data');
sessionStorage.removeItem('temp_sale_data');
sessionStorage.removeItem('session_last_activity');
```

### Protection côté serveur

Le middleware `SessionTimeoutMiddleware` :

- ✅ **Vérifie l'activité** côté serveur
- ✅ **Révoque les tokens** Sanctum expirés
- ✅ **Log les déconnexions** pour audit
- ✅ **Headers informatifs** pour synchronisation client

## 📚 Exemples d'intégration

### Intégration complète

```typescript
// AppRouter.tsx
import SessionManager from '../components/SessionManager';

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <SessionManager
        config={{
          inactivityTimeoutMinutes: parseInt(
            process.env.REACT_APP_SESSION_TIMEOUT || '60'
          ),
          warningTimeoutMinutes: 5,
          disabled: process.env.NODE_ENV === 'development' &&
                   process.env.REACT_APP_DISABLE_AUTO_LOGOUT === 'true',
        }}
      >
        <AppRouterContent />
      </SessionManager>
    </AuthProvider>
  );
};
```

### Hook personnalisé

```typescript
// Custom hook pour contrôler manuellement
import { useActivityTracker } from '../hooks/useActivityTracker';

export const useCustomSessionControl = () => {
    const { resetTimer, getTimeUntilLogout } = useActivityTracker({
        inactivityTimeout: 45 * 60 * 1000, // 45 minutes
        warningTimeout: 3 * 60 * 1000, // 3 minutes
        onWarning: () => {
            // Custom warning logic
            showCustomNotification('Session expire bientôt!');
        },
    });

    return {
        extendSession: resetTimer,
        getRemainingTime: getTimeUntilLogout,
    };
};
```

## ✅ Checklist de déploiement

- [ ] Variable `SESSION_INACTIVITY_TIMEOUT` configurée dans `.env`
- [ ] SessionManager intégré dans AppRouter
- [ ] Middleware `session.timeout` appliqué aux routes API
- [ ] Tests d'inactivité réalisés
- [ ] Modal d'avertissement testé
- [ ] Logs vérifiés
- [ ] Documentation utilisateur créée

---

## 💡 Conseils d'utilisation

### Pour les pharmaciens

- **Session active** tant que vous utilisez l'application
- **Avertissement 5 minutes** avant déconnexion
- **Cliquez sur "Continuer"** pour rester connecté
- **Fermeture sécurisée** en fin de journée

### Pour les administrateurs

- **Configurez le délai** selon vos besoins sécuritaires
- **Surveillez les logs** de déconnexion automatique
- **Formez les utilisateurs** au nouveau système
- **Testez régulièrement** le bon fonctionnement

Cette fonctionnalité améliore significativement la sécurité de votre pharmacie en évitant les sessions oubliées ouvertes. 🔐✨

