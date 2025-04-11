# Architecture de HelloPay

Ce document présente l'architecture technique du projet HelloPay, expliquant comment les différents composants interagissent entre eux.

## Vue d'ensemble

HelloPay est une application Next.js qui offre des fonctionnalités de gestion RH, notamment :
- Création et gestion de contrats de travail
- Gestion des bulletins de paie
- Gestion des employés et des entreprises
- Génération de documents administratifs

L'application utilise Firebase (Authentication, Firestore, Storage) comme backend.

## Structure du projet

```
/src
├── app/                 # Routes et pages (Next.js App Router)
├── components/          # Composants React
├── contexts/            # Contextes React pour le state global
├── hooks/               # Hooks personnalisés
├── lib/                 # Bibliothèques et utilitaires
├── services/            # Services d'accès aux données
├── types/               # Définitions de types TypeScript
├── utils/               # Fonctions utilitaires
└── schemas/             # Schémas de validation (Zod)
```

## Principaux modules

### Authentification

Géré par le service `auth-service.ts` et le hook `useAuth.tsx`. S'appuie sur Firebase Authentication.

### Gestion des contrats

- **Création** : Formulaire de création de contrat (`ContractFormPage.tsx`)
- **Template** : Affichage du contrat (`ContractTemplate.tsx`)
- **Services** : Accès aux données et génération de PDF (`contract-articles-service.ts`, `pdf-generation-service.ts`)

### Gestion des employés

- **Formulaires** : Création/édition d'employés (`EmployeeForm.tsx`)
- **Services** : Accès aux données (`employee-service.ts`)

### Gestion des entreprises

- **Formulaires** : Création/édition d'entreprises (`CompanyForm.tsx`)
- **Services** : Accès aux données (`company-service.ts`)

### Gestion des documents

- **Certificats** : Génération de certificats administratifs (`certificate-service.ts`)
- **Stockage** : Gestion des fichiers dans Firebase Storage (`storage-service.ts`)

## Flux de données

1. **Interface utilisateur** : Les composants React dans `/components` et les pages dans `/app`
2. **Logique métier** : Implémentée dans les hooks et services
3. **Accès aux données** : Services qui interagissent avec Firebase
4. **Stockage** : Firebase Firestore et Storage

## Conventions de code

### Organisation des composants

- **Composants UI** : Composants de base réutilisables (`/components/ui`)
- **Composants fonctionnels** : Composants spécifiques à une fonctionnalité

### Gestion d'état

- **État local** : Hooks React (`useState`, `useReducer`)
- **État global** : Contextes React (`/contexts`)
- **État serveur** : Services pour l'interaction avec le backend

### Validation des données

Utilisation de Zod pour la validation des formulaires et des données.

## Optimisations

### Performances

- Mise en cache des données fréquemment utilisées
- Composants memoïsés pour éviter les re-rendus inutiles

### Sécurité

- Validation des entrées utilisateur avec Zod
- Règles de sécurité Firebase pour l'autorisation

## Architecture cible

Transition progressive vers une architecture modulaire basée sur les fonctionnalités :

```
/src
├── features/               # Organisé par fonctionnalité
│   ├── auth/               # Authentification
│   ├── contracts/          # Contrats
│   ├── employees/          # Employés
│   └── companies/          # Entreprises
├── shared/                 # Composants, hooks et utils partagés
└── core/                   # Services et utilitaires centraux
```

Cette organisation facilite la maintenance et l'évolution du projet. 