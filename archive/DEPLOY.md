# Guide de déploiement d'HelloPay

## Prérequis

1. Compte Firebase
2. Node.js v18 ou supérieur
3. npm v8 ou supérieur
4. Git

## Configuration de l'environnement

1. Cloner le dépôt
   ```bash
   git clone https://github.com/votre-compte/hellopay.git
   cd hellopay
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   ```bash
   cp .env.example .env.local
   ```
   
   Modifier le fichier `.env.local` avec vos propres clés Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (Compte de service Firebase au format JSON)

## Problèmes connus et solutions

### Problème de middleware avec Edge Runtime

L'application utilise Firebase Admin qui n'est pas compatible avec l'environnement Edge Runtime de Next.js. Pour déployer l'application:

1. Assurez-vous que `firebase-admin-node.ts` est configuré correctement
2. Vérifiez les imports dans le middleware.ts
3. Assurez-vous que le fichier `next.config.js` est correctement configuré

### Erreurs de build

En cas d'erreurs de build liées aux modules Node.js natifs (comme `node:stream`), assurez-vous d'avoir installé:

```bash
npm install --save-dev stream-browserify crypto-browserify process
```

## Déploiement local pour test

Pour tester l'application localement:

```bash
npm run dev
```

L'application sera disponible à l'adresse: http://localhost:3000

## Déploiement sur Firebase Hosting

1. Connectez-vous à Firebase
   ```bash
   npx firebase login
   ```

2. Sélectionnez votre projet
   ```bash
   npx firebase use votre-projet-id
   ```

3. Construisez et déployez
   ```bash
   npm run deploy
   ```

Cette commande va:
- Construire l'application Next.js
- Générer les fichiers de configuration de routage
- Déployer sur Firebase Hosting

## Vérification du déploiement

Une fois déployée, l'application sera disponible à l'URL:
- https://votre-projet-id.web.app
- https://votre-projet-id.firebaseapp.com

## Dépannage

En cas de problèmes lors du déploiement:

1. Vérifiez les journaux d'erreur
   ```bash
   npm run build
   ```

2. Assurez-vous que toutes les variables d'environnement sont correctement définies

3. Vérifiez la compatibilité des modules et dépendances

4. Pour les problèmes liés à Firebase, utilisez l'émulateur Firebase
   ```bash
   npx firebase emulators:start
   ```

5. Si l'erreur persiste avec Firebase Admin, envisagez d'utiliser une approche API pour les fonctionnalités d'administration
