# Documentation des fonctionnalités de contrat

Cette documentation décrit l'architecture et les composants de la fonctionnalité de gestion des contrats dans l'application HelloPay.

## Architecture

Le système de gestion de contrats repose sur trois piliers principaux:

1. **Formulaire de création/édition de contrat** (`ContractFormPage.tsx`)
2. **Template de contrat** (`ContractTemplate.tsx`)
3. **Services de contrat** (plusieurs services dans le dossier `services/`)

## Composants principaux

### ContractFormPage

Le composant `ContractFormPage` est le composant principal pour la création et l'édition des contrats. Il gère:

- Le formulaire de saisie des données
- La validation des données
- La sauvegarde des données dans Firebase
- La génération de PDF
- La fonctionnalité d'aperçu

### ContractTemplate

Le composant `ContractTemplate` est responsable de l'affichage du contrat selon un modèle prédéfini. Il:

- Affiche les données du contrat dans un format A4
- S'adapte aux différents types de contrats (CDI, CDD)
- Gère l'inclusion/exclusion conditionnelle de certaines clauses

## Services

### company-service.ts

Service centralisé pour la gestion des entreprises, utilisé pour:
- Récupérer la liste des entreprises
- Récupérer les détails d'une entreprise
- Créer/modifier/supprimer des entreprises

### employee-service.ts

Service centralisé pour la gestion des employés, utilisé pour:
- Récupérer la liste des employés
- Récupérer les détails d'un employé
- Créer/modifier/supprimer des employés
- Filtrer les employés par entreprise

### contract-articles-service.ts

Service centralisé pour la gestion des articles de contrat, qui:
- Génère le texte des articles du contrat
- Personnalise le contenu en fonction des données fournies
- Supporte différents types de contrats et clauses

### pdf-generation-service.ts

Service optimisé pour la génération de PDF:
- Convertit le contenu HTML en PDF
- Optimise la taille et les performances
- Fournit des fonctionnalités comme les filigranes et la compression

## Flux de travail

1. L'utilisateur remplit le formulaire de contrat dans `ContractFormPage`
2. Les données sont validées et formatées
3. L'utilisateur peut prévisualiser le contrat via `ContractTemplate`
4. L'utilisateur sauvegarde le contrat, ce qui:
   - Enregistre les données dans Firestore
   - Génère un PDF via `pdf-generation-service.ts`
   - Stocke le PDF dans Firebase Storage

## Structure des données

Les contrats sont stockés dans Firestore avec la structure suivante:

```
/users/{userId}/contracts/{contractId}
```

Chaque contrat contient:
- Informations générales (type, date, etc.)
- Références à l'entreprise et à l'employé
- Articles personnalisés
- URL du PDF généré

## Types de données

Les types de données sont définis dans `src/types/contract-types.ts` et comprennent:
- `ContractData` - Structure complète d'un contrat
- `Article1Data` à `Article14Data` - Structure de chaque article du contrat

## Bonnes pratiques

1. Toujours utiliser les services centralisés pour interagir avec les données
2. Utiliser `contract-articles-service.ts` pour générer le contenu des articles
3. Éviter de modifier directement le template de contrat pour des personnalisations
4. Toujours valider les données avant de les sauvegarder

## Dépendances

- Firebase Firestore - Stockage des données
- Firebase Storage - Stockage des PDF
- pdf-lib - Génération de PDF optimisée
- React Hook Form - Gestion du formulaire
- Zod - Validation des données 