# HelloPay - Solution de fiches de paie

HelloPay est une application moderne de gestion de paie conçue pour simplifier la création et la gestion des fiches de paie pour les PME françaises.

## MVP 0.5 - Amélioration de l'UX/UI

Cette version se concentre sur l'amélioration de l'expérience utilisateur et de l'interface graphique, avec une approche "zero friction" inspirée des standards SaaS modernes comme Notion, Stripe, Deel, PayFit, Qonto et Alan.

### Nouvelles fonctionnalités

- **Parcours utilisateur complet et fluide**
  - Onboarding en plusieurs étapes guidées
  - Dashboard interactif avec statistiques en temps réel
  - Navigation améliorée sans rechargement de page
  - Formulaires intelligents avec calculs automatiques

- **Interface moderne et responsive**
  - Design inspiré des standards SaaS modernes
  - Animations et transitions fluides
  - Composants interactifs (cartes, tableaux, filtres)
  - Expérience mobile optimisée

- **Gestion des employés**
  - Interface de liste avec filtres et tri
  - Formulaire de création avec onglets organisés
  - Affichage adaptatif (liste/cartes) selon la taille d'écran
  - Fonctionnalités de recherche et de filtrage avancées

- **Gestion des fiches de paie**
  - Calculateur interactif en temps réel
  - Visualisation des charges et cotisations
  - Workflow simplifié de création de fiches de paie
  - Vue synthétique des données salariales

### Parcours utilisateur

1. **Onboarding**
   - Configuration de l'entreprise
   - Paramètres utilisateur
   - Guide de démarrage

2. **Dashboard**
   - Vue d'ensemble de l'activité
   - Statistiques des employés et des fiches de paie
   - Actions rapides et raccourcis

3. **Gestion des employés**
   - Ajout d'employés avec informations personnelles, professionnelles et salariales
   - Liste des employés avec filtre par département et type de contrat
   - Actions rapides (voir, modifier, supprimer)

4. **Création de fiches de paie**
   - Sélection d'employé
   - Configuration de la période
   - Calcul automatique des cotisations
   - Aperçu en temps réel

## Technologies utilisées

- **Framework**: Next.js avec App Router
- **Base de données**: Supabase
- **Styling**: Tailwind CSS
- **Composants**: shadcn/ui
- **Authentication**: Supabase Auth

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
# http://localhost:3000
```

## Structure des fichiers

- `app/` - Routes de l'application
  - `auth/` - Pages d'authentification et d'onboarding
  - `dashboard/` - Interface principale de l'application
    - `employees/` - Gestion des employés
    - `payslips/` - Gestion des fiches de paie

- `components/` - Composants réutilisables
  - `ui/` - Composants UI génériques

- `lib/` - Utilitaires et services
  - `supabase.ts` - Client Supabase

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
