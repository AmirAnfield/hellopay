# Plan d'action pour MVP 0.20

## Objectifs
- Application 100% fonctionnelle pour présentation
- Code propre, sans redondances
- Interface utilisateur homogène
- Fonctionnalités de base entièrement testées

## Actions prioritaires

### 1. Nettoyage des fichiers redondants ✅
- [x] Marquer la route `/api/get-payslips` comme dépréciée
- [x] Supprimer le dossier `backup/` après vérification
- [x] Marquer la route `/api/generate-payslip` comme dépréciée
- [x] Mettre en place des redirections pour les anciens chemins
- [x] Supprimer les routes API obsolètes `/api/get-payslips` et `/api/generate-payslip`

### 2. Normalisation des API ⏳
- [x] Corriger les erreurs de linter dans les pages principales
- [x] Mettre à jour les chemins dans les pages de création de bulletins
- [ ] Standardiser toutes les routes API selon REST
- [ ] Assurer la cohérence des réponses d'API (format, codes d'erreur)

### 3. Correction des bugs et TODOs ⏳
- [ ] Implémenter l'envoi d'emails (vérification, réinitialisation de mot de passe)
- [ ] Corriger les problèmes de validation des formulaires
- [ ] Tester tous les flows utilisateurs principaux

### 4. Homogénéisation de l'interface ⏳
- [ ] Standardiser les composants (boutons, formulaires, tableaux)
- [ ] Assurer la cohérence des styles et de la navigation
- [ ] Améliorer la responsivité mobile
- [ ] Compléter les états de chargement et de gestion d'erreurs

## Prochaines étapes après le MVP 0.20

1. Ajouter des tests unitaires et d'intégration pour les fonctionnalités clés
2. Optimiser les performances (chargement des pages et requêtes API)
3. Documenter l'utilisation des composants partagés pour faciliter le développement futur
4. Préparer la migration vers PostgreSQL pour le déploiement en production

## Phase 7: Amélioration de l'expérience utilisateur (UX/UI)

### Objectifs
- Harmoniser l'interface graphique pour une meilleure cohérence visuelle
- Améliorer l'expérience utilisateur avec des messages de feedback et des tooltips
- Assurer la responsivité sur différents appareils
- Intégrer des tests visuels pour garantir la qualité

### Progrès
- [x] Analyse de l'existant et identification des incohérences
- [x] Création des composants partagés pour l'harmonisation de l'interface
  - [x] PageContainer: Conteneur standard pour les pages du tableau de bord
  - [x] PageHeader: Composant pour les en-têtes de page standardisés
  - [x] HeaderActions: Composant pour les actions dans l'en-tête
  - [x] SectionBlock: Organiser visuellement des sections dans une page
  - [x] LoadingState: État de chargement standardisé
  - [x] EmptyState: État vide standardisé pour les listes/tableaux sans données
  - [x] NoDataMessage: Message léger pour les tableaux vides
  - [x] SkeletonLoader: Indicateurs de chargement de type skeleton
  - [x] ToastProvider: Notifications unifiées avec le système de toast
  - [x] LoadingButton: Bouton avec indicateur de chargement
  - [x] HelpTooltip: Info-bulles d'aide contextuelle
  - [x] ConfirmationDialog: Boîtes de dialogue de confirmation standardisées
- [x] Standardisation de la mise en page du tableau de bord
  - [x] Mise à jour de la barre de navigation latérale
  - [x] Amélioration de l'indication de la page active
  - [x] Ajout de tooltips sur la navigation
- [x] Harmonisation des pages principales
  - [x] Page d'accueil du tableau de bord
  - [x] Page des contrats
  - [x] Page des bulletins de paie
  - [x] Page des entreprises
  - [x] Page des employés
  - [x] Page des documents
  - [x] Page du guide
  - [x] Page de profil utilisateur (remplace la page paramètres)
- [x] Ajout de feedback visuel cohérent
  - [x] Messages toast lors d'actions importantes
  - [x] Confirmations d'actions critiques (suppression d'entités)
- [ ] Amélioration de la responsivité
- [ ] Tests visuels avec Storybook

### Prochaines étapes
1. Tester et améliorer la responsivité mobile sur toutes les pages
   - Vérifier le comportement de la sidebar mobile
   - Optimiser les tableaux et cartes pour les petits écrans
   - Corriger les potentiels overflows horizontaux

2. Préparer la documentation des composants réutilisables
   - Documenter l'utilisation des nouveaux composants partagés
   - Créer des exemples pour faciliter l'adoption par les développeurs

### Bénéfices
- Expérience utilisateur plus cohérente et intuitive
- Réduction de la charge cognitive pour les utilisateurs
- Meilleure gestion des retours d'information
- Interface plus professionnelle et moderne 