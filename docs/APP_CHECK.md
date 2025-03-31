# Firebase App Check - HelloPay

Ce document explique la mise en œuvre de Firebase App Check dans l'application HelloPay pour sécuriser nos ressources Firebase contre les abus.

## Qu'est-ce que Firebase App Check ?

Firebase App Check est un service qui aide à protéger les ressources Firebase (Storage, Firestore, Functions, etc.) contre les accès non autorisés, le scraping, les attaques par déni de service, et autres abus. Il fonctionne en vérifiant que les requêtes proviennent bien de votre application authentique, et non d'un environnement non autorisé.

## Notre implémentation

Dans HelloPay, nous utilisons **reCAPTCHA v3** comme fournisseur d'attestation App Check. Cela offre plusieurs avantages :

1. **Invisibilité pour l'utilisateur** - Aucune interaction n'est requise (contrairement à reCAPTCHA v2)
2. **Protection efficace** - Analyse comportementale pour détecter les robots et les activités suspectes
3. **Intégration simple** - S'intègre facilement à notre stack Next.js/Firebase

## Configuration technique

Notre implémentation d'App Check se trouve dans le fichier `src/lib/firebase.ts` :

```typescript
// Initialiser AppCheck seulement côté client
let appCheck = null;
if (typeof window !== 'undefined') {
  // Activer le mode debug en développement
  if (process.env.NODE_ENV === 'development') {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  // Initialiser AppCheck avec reCAPTCHA v3
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('SITE_KEY'), // Clé site web reCAPTCHA v3
    isTokenAutoRefreshEnabled: true // Renouvellement automatique des tokens
  });
}
```

## Mode debug

En environnement de développement, nous activons le mode debug d'App Check pour faciliter les tests locaux. Ce mode génère un jeton de débogage qui est automatiquement accepté par les services Firebase en développement.

## Règles de sécurité

Nous avons également mis à jour nos règles de sécurité Firebase Storage pour exiger App Check :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règle globale exigeant App Check
    match /{allPaths=**} {
      allow read, write: if request.auth != null && appCheck.token.token_verified;
    }
    
    // Autres règles spécifiques...
  }
}
```

## Configuration côté console Firebase

1. App Check a été activé dans la console Firebase pour le projet HelloPay
2. Le fournisseur reCAPTCHA v3 a été configuré
3. Les services protégés incluent : Storage, Firestore et Hosting

## Tester App Check

Pour tester l'intégration d'App Check :

1. En développement : le token de débogage est automatiquement activé
2. En production : tout fonctionne normalement pour les utilisateurs légitimes
3. Pour simuler un accès non autorisé : tentez d'accéder aux ressources Firebase depuis une application non enregistrée

## Surveillance et maintenance

- Surveiller les journaux Firebase pour les rejets App Check (section "App Check" dans la console)
- Rester attentif aux mises à jour de reCAPTCHA et d'App Check
- Vérifier périodiquement l'efficacité de la protection

## Notes sur le plan Blaze

Avec le plan de facturation Blaze :
- App Check lui-même inclut un niveau d'utilisation gratuite
- reCAPTCHA v3 standard est gratuit jusqu'à 1 million de requêtes par mois
- Au-delà, consulter la [tarification Google Cloud](https://cloud.google.com/recaptcha-enterprise/pricing) pour reCAPTCHA Enterprise 