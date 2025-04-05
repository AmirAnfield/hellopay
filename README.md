# HelloPay - Solution de gestion RH et paie

HelloPay est une application moderne de gestion RH qui simplifie la gestion des bulletins de paie, des contrats et des documents administratifs pour les PME françaises.

## Comptes de test pour les utilisateurs

Pour faciliter les tests, vous pouvez utiliser les comptes suivants:

| Email | Mot de passe | Notes |
|-------|-------------|-------|
| test@hellopay.fr | password123 | Compte déjà configuré avec entreprises et employés |
| demo@hellopay.fr | password123 | Compte avec plusieurs bulletins de paie générés |

⚠️ **Note importante pour les testeurs**: La vérification d'email a été temporairement désactivée pour faciliter les tests. Dans un environnement de production, cette vérification serait obligatoire.

## Fonctionnalités principales (MVP 0.21)

- **Génération automatique de bulletins de paie**
  - Calcul automatique des cotisations sociales selon les règles françaises
  - Interface de sélection des mois par année avec résumé visuel
  - Validation et verrouillage des bulletins avec gestion des statuts
  - Export multiple au format ZIP avec génération optimisée
  - Prévisualisation avant génération finale

- **Gestion des employés**
  - Création et gestion des profils employés
  - Historique des bulletins par employé
  - Gestion des informations professionnelles et contractuelles
  - Cumuls annuels par employé pour suivi budgétaire

- **Gestion des contrats** ✨ *Nouveau*
  - Création et modification de contrats
  - Classification par type (travail, service, confidentialité, etc.)
  - Suivi des statuts (brouillon, actif, résilié, expiré)
  - Stockage sécurisé des documents
  - Recherche avancée et filtrage

- **Tableau de bord complet**
  - Vue d'ensemble des activités avec statistiques
  - Accès rapide aux fonctionnalités
  - Gestion des entreprises et des employés
  - Section d'aide et support intégrée

- **Sécurité et compte utilisateur**
  - Authentification complète avec vérification email
  - Récupération de mot de passe sécurisée
  - Gestion des droits d'accès
  - Espace profil utilisateur

## Guide d'installation et de test

### Prérequis

- Node.js 18.x ou supérieur
- Base de données (PostgreSQL recommandé, SQLite supporté pour le développement)
- Service de stockage de fichiers (Supabase ou UploadThing)

### Installation en développement

1. **Cloner le dépôt**

```bash
git clone https://github.com/votre-compte/hellopay.git
cd hellopay
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration des variables d'environnement**

Copier le fichier d'exemple et le remplir avec vos propres valeurs:

```bash
cp .env.example .env.local
```

4. **Configurer la base de données**

```bash
npx prisma generate
npx prisma db push
```

5. **Remplir la base de données avec des données de test (optionnel)**

```bash
npm run seed
```

6. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Compile l'application pour la production
- `npm run start` : Démarre l'application compilée en mode production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run test` : Lance les tests unitaires et d'intégration
- `npm run test:watch` : Lance les tests en mode watch
- `npm run seed` : Remplit la base de données avec des données de test
- `npm run prisma:studio` : Lance l'interface Prisma Studio pour explorer la base de données

## Parcours de test

### Bulletins de paie

1. Créer une entreprise et ajouter des employés
2. Générer des bulletins de paie pour les employés
3. Valider et télécharger les bulletins au format PDF

### Gestion des contrats ✨

1. Accéder à la section "Contrats" depuis le tableau de bord
2. Créer un nouveau contrat en remplissant le formulaire
3. Télécharger un document PDF ou Word comme pièce jointe au contrat
4. Consulter la liste des contrats et utiliser les filtres de recherche
5. Visualiser, modifier ou supprimer un contrat existant

## Tests automatisés

Le projet dispose d'une suite de tests automatisés pour garantir la qualité du code.

### Tests unitaires

Les tests unitaires vérifient le bon fonctionnement des composants et des fonctions indépendamment.

```bash
npm run test
```

### Tests d'intégration

Les tests d'intégration vérifient l'interaction entre les différentes parties de l'application.

```bash
npm run test:integration
```

## Technologies utilisées

- **Framework**: Next.js 15 avec App Router
- **Base de données**: PostgreSQL/SQLite avec Prisma ORM
- **Authentication**: NextAuth.js
- **UI/UX**: Tailwind CSS avec shadcn/ui
- **Stockage**: Supabase Storage / UploadThing (PDF et documents)
- **Formulaires**: React Hook Form avec validation Zod
- **État global**: React Context API
- **Tests**: Jest et React Testing Library

## Architecture du projet (actualisée MVP 0.50)

- `src/app/` - Routes et pages de l'application
  - `src/app/(public)/` - Pages publiques (tarifs, démo, contact)
  - `src/app/api/` - Routes API avec gestion des requêtes
  - `src/app/auth/` - Système d'authentification
  - `src/app/dashboard/` - Interface principale après connexion
    - `src/app/dashboard/contracts/` - Gestion des contrats
    - `src/app/dashboard/payslips/` - Gestion des bulletins de paie
    - `src/app/dashboard/companies/` - Gestion des entreprises
    - `src/app/dashboard/employees/` - Gestion des employés
    - `src/app/dashboard/certificates/` - Génération d'attestations
- `src/components/` - Composants réutilisables
  - `src/components/ui/` - Éléments d'interface (shadcn/ui)
  - `src/components/shared/` - Composants partagés entre fonctionnalités
  - `src/components/payslip/` - Composants spécifiques aux bulletins
  - `src/components/contracts/` - Composants spécifiques aux contrats
- `src/lib/` - Utilitaires et services
  - `src/lib/firebase/` - Configuration centralisée de Firebase (à privilégier)
  - `src/lib/utils/` - Fonctions utilitaires
  - `src/lib/security/` - Fonctions de sécurité et authentification
- `src/services/` - Services métier
  - Importation via l'index centralisé: `import { AuthService, EmployeeService } from '@/services';`
- `src/hooks/` - Hooks personnalisés
  - Importation via l'index centralisé: `import { useAuth, useFirestoreDocument } from '@/hooks';`
- `src/schemas/` - Schémas de validation
- `src/types/` - Types TypeScript

## Bonnes pratiques de développement

### Structure et organisation

1. **Éviter les duplications**
   - Centraliser les définitions de types dans `src/types/`
   - Utiliser les utilitaires communs dans `src/lib/utils.ts`
   - Ne pas réimplémenter des fonctionnalités existantes

2. **Nomenclature standardisée**
   - Components: `PascalCase` (ex: `EmployeeList.tsx`)
   - Hooks: `useCamelCase` (ex: `useFirestoreDocument.tsx`)
   - Pages: Suffixe `Page` (ex: `export default function PayrollGuidePage()`)
   - Services: Suffixe `Service` (ex: `employee-service.ts`)

3. **Firebase/Firestore**
   - Utiliser uniquement `src/lib/firebase/config.ts` pour l'initialisation
   - Accéder aux services via les services dédiés, pas directement
   - Le fichier `src/lib/firebase-admin.ts` est le point unique d'initialisation du SDK Admin

### Performance et optimisation

1. **Requêtes Firestore**
   - Limiter les requêtes avec pagination (`limit()`)
   - Mettre en cache les résultats quand c'est possible
   - Utiliser les hooks `useFirestoreDocument` et `useFirestoreCollection`

2. **Formulaires et validation**
   - Utiliser les schémas dans `src/schemas/` pour valider les données
   - Préférer la validation côté client pour une meilleure UX

3. **Sécurité**
   - Ne pas stocker de secrets dans le code client
   - Toujours vérifier les permissions dans le middleware et les règles Firestore
   - Utiliser les fonctions Firebase pour les opérations sensibles

## Contribution

Les contributions sont les bienvenues ! Voici comment contribuer au projet :

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'Add some amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## License

MIT

## Nouveautés de la version 0.51

Cette version introduit plusieurs améliorations importantes pour renforcer l'architecture du projet et optimiser les performances :

### Pagination avancée

- ✅ Nouveau système de pagination optimisé pour Firestore
- ✅ Support de la pagination par curseurs pour de meilleures performances
- ✅ Hook personnalisé `useFirestorePagination` pour faciliter l'implémentation
- ✅ Composants UI réutilisables (`Pagination`, `PaginationInfo`, `PageSizeSelector`)
- ✅ Support de la pagination infinie avec "Charger plus"

### Structure du projet

- ✅ Centralisation des services avec point d'accès unique (`@/services`)
- ✅ Hooks personnalisés regroupés et exposés via un index central (`@/hooks`) 
- ✅ Refactorisation du middleware avec unification des règles de sécurité
- ✅ Élimination des composants en double et du code mort

### Types et vérifications

- ✅ Types cohérents pour les entités principales (Employee, Company, etc.)
- ✅ Vérification adéquate des paramètres nuls ou optionnels
- ✅ Consolidation des schémas de validation

Cette version pose les bases d'une architecture solide et maintenable pour le développement futur.
