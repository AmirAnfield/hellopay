# HelloPay - Solution de bulletins de paie

HelloPay est une application moderne de gestion de bulletins de paie conçue pour simplifier la création, la gestion et l'émission des fiches de paie pour les PME françaises.

## Fonctionnalités principales (MVP 0.11)

- **Génération automatique de bulletins de paie**
  - Calcul automatique des cotisations sociales selon les règles françaises
  - Interface de sélection des mois par année
  - Validation et verrouillage des bulletins
  - Export multiple au format ZIP

- **Gestion des employés**
  - Création et gestion des profils employés
  - Historique des bulletins par employé
  - Gestion des informations professionnelles et contractuelles

- **Tableau de bord complet**
  - Vue d'ensemble des activités
  - Accès rapide aux fonctionnalités
  - Gestion des entreprises et des employés

## Guide d'installation et de test

### Prérequis

- Node.js 18.x ou supérieur
- PostgreSQL 14.x ou supérieur
- Compte Supabase (pour le stockage)

### Installation

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

5. **Lancer le serveur de développement**

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Parcours de test complet

Pour tester toutes les fonctionnalités de l'application:

1. **Créer un compte**
   - Accéder à `/auth/register`
   - Remplir le formulaire d'inscription
   - Valider votre compte via le lien reçu par email

2. **Configurer votre entreprise**
   - Depuis le tableau de bord, aller à "Entreprises" > "Nouvelle entreprise"
   - Remplir les informations de l'entreprise (SIRET, adresse, etc.)

3. **Ajouter un employé**
   - Aller à "Employés" > "Nouvel employé"
   - Remplir les informations personnelles et professionnelles
   - Définir le salaire brut et le type de contrat

4. **Générer des bulletins**
   - Aller à "Générer des bulletins"
   - Sélectionner l'entreprise et l'employé
   - Choisir les mois à générer (2023-2024)
   - Modifier le salaire brut si nécessaire
   - Générer les bulletins

5. **Valider et verrouiller les bulletins**
   - Accéder aux bulletins générés
   - Utiliser l'API pour valider et verrouiller les bulletins
   - Vérifier que les bulletins validés sont bien marqués comme tels

6. **Télécharger des bulletins**
   - Sélectionner plusieurs bulletins
   - Cliquer sur "Télécharger tous les bulletins"
   - Vérifier que le ZIP contient tous les bulletins sélectionnés

## Technologies utilisées

- **Framework**: Next.js 14 avec App Router
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS avec shadcn/ui
- **Stockage**: Supabase Storage

## Structure du projet

- `src/app/` - Routes et pages de l'application
- `src/components/` - Composants réutilisables
- `src/lib/` - Utilitaires et services
- `prisma/` - Schéma de base de données et migrations

## Contributions

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request pour suggérer des améliorations.
