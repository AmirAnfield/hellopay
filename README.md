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

## Générateur de Contrat HelloPay

Le générateur de contrat est un assistant étape par étape (wizard) qui permet de créer des contrats de travail personnalisés en suivant un processus guidé.

### Structure du Contrat
Le contrat est organisé en sections:
- Introduction optionnelle (préambule)
- Articles obligatoires (Section 1)
- Modules recommandés par défaut (Section 2)
- Modules avancés facultatifs (Section 3)

### Processus du Wizard
Le wizard suit le processus suivant:
1. **Configuration de base**
   - Type de contrat (CDI/CDD)
   - Heures hebdomadaires (24h, 28h, 30h ou 35h)
   - Sélection de l'entreprise (via Firestore)
   - Sélection de l'employé (via Firestore)
   - Choix d'inclure le préambule

2. **Articles Obligatoires**
   - Article 1: Nature du contrat
   - Article 2: Date d'entrée en fonction
   - Article 3: Fonctions
   - Article 4: Lieu de travail
   - Article 5: Durée et organisation du travail
   - Article 6: Rémunération
   - Article 7: Avantages
   - Article 8: Congés et absences

3. **Clauses Additionnelles**
   - Article 9: Données personnelles et droit à l'image
   - Article 10: Tenue et règles internes
   - Article 11: Confidentialité et propriété intellectuelle
   - Article 12: Non-concurrence (CDI uniquement)
   - Article 13: Télétravail
   - Article 14: Rupture du contrat et préavis

4. **Finalisation**
   - Aperçu du contrat complet
   - Validation finale

### Stockage des Données
- Les données du contrat sont stockées dans Firestore
- Chemins: `users/{userId}/contracts/config` pour la configuration
- Chaque article est stocké séparément dans une collection appropriée
- Les entreprises sont stockées dans `users/{userId}/companies`
- Les employés sont stockés dans `users/{userId}/employees`

### Fonctionnalités Supplémentaires
- Sauvegarde automatique de la progression
- Possibilité de sauvegarder différentes versions
- Chargement des sauvegardes précédentes
- Mode aperçu pour prévisualiser le contrat à tout moment

## Générateur de Contrat HelloPay - Améliorations

### Fonctionnalités implémentées
1. **Structure complète du wizard**
   - Processus étape par étape pour créer un contrat
   - Navigation entre les différentes sections
   - Sauvegarde de la progression
   - Prévisualisation du contrat

2. **Types d'articles normalisés**
   - Interfaces TypeScript pour tous les articles du contrat
   - Support pour les différents types de contrat (CDI/CDD)
   - Gestion des options conditionnelles selon le type de contrat

3. **Services de sauvegarde**
   - Fonctions de sauvegarde spécifiques à chaque article
   - Validation des données obligatoires pour chaque article
   - Stockage structuré dans Firestore

4. **Cohérence des données**
   - Vérification des champs requis avant sauvegarde
   - Validation spécifique selon le type de contrat
   - Gestion des erreurs avec feedback utilisateur

### Améliorations à venir
1. **Harmonisation des interfaces de composants**
   - Aligner les props de tous les composants d'étape
   - Résoudre les conflits de typage entre les services et les composants
   - Standardiser les validations côté client

2. **Optimisation des performances**
   - Mise en cache des données pour réduire les appels à Firestore
   - Chargement asynchrone des composants d'étape
   - Préchargement des données des prochaines étapes

3. **Tests et débogage**
   - Tests unitaires pour les services
   - Tests d'intégration pour le flux complet
   - Gestion avancée des erreurs

4. **Fonctionnalités additionnelles**
   - Exportation du contrat en PDF
   - Templates prédéfinis pour accélérer la création
   - Système de révision et commentaires
   - Signature électronique

## Générateur de Contrat HelloPay - Fonctionnalités d'exportation

### Export PDF
Le générateur de contrat inclut maintenant une fonctionnalité d'exportation PDF qui permet de générer un document professionnel à partir des données saisies. Cette fonctionnalité offre:

1. **Génération dynamique de contrat**
   - Création automatique d'un document formaté selon les standards professionnels
   - Intégration des données spécifiques de l'entreprise et de l'employé
   - Adaptation du contenu selon le type de contrat (CDI/CDD)

2. **Documents prêts à l'emploi**
   - Format standardisé avec mise en page professionnelle
   - Contenu juridiquement valide basé sur le Code du travail
   - Signature électronique à venir dans les prochaines versions

3. **Personnalisation avancée**
   - Adaptation en fonction des articles remplis
   - Clause conditionnelles qui s'affichent uniquement si nécessaires
   - Structure claire et organisée par sections

### Comment utiliser l'export PDF
1. Remplissez le contrat en suivant toutes les étapes du wizard
2. À l'étape de prévisualisation, cliquez sur "Exporter en PDF"
3. Le document s'ouvre dans un nouvel onglet pour impression ou sauvegarde

### Exportations supplémentaires (à venir)
- Export au format Word (.docx) pour modification supplémentaire
- Export des annexes et pièces jointes
- Génération de documents associés (attestations, avenants)

### Sécurité et confidentialité
- Les documents générés sont privés et ne sont pas stockés sur nos serveurs
- Le processus de génération se fait entièrement côté client
- Les informations sensibles ne transitent pas par Internet lors de l'export
