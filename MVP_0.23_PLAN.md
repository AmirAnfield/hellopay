# Plan de stabilisation MVP 0.23

## 🔴 BLOQUANT (Doit être corrigé en priorité absolue)

### AUTH-01: Unification du système d'authentification
- **Description**: Supprimer le système d'authentification personnalisé et n'utiliser que NextAuth
- **Tâches**:
  - Supprimer le contexte Auth personnalisé dans `/src/app/providers.tsx`
  - Vérifier que toutes les références utilisent NextAuth uniquement
  - Tester le flux complet login/logout
- **Critères d'acceptation**:
  - Session utilisateur persistante et cohérente
  - Routes protégées correctement sécurisées
  - Aucune erreur de console liée à l'authentification

### FORM-01: Correction des schémas Zod dans les formulaires
- **Description**: Les schémas Zod présentent des problèmes d'ordre des méthodes (.trim(), .default(), etc.)
- **Tâches**:
  - Corriger CompanyForm.tsx (ordre des méthodes)
  - Vérifier tous les autres schémas Zod similaires
  - Standardiser l'approche dans tous les formulaires
- **Critères d'acceptation**:
  - Aucune erreur de runtime sur les formulaires
  - Validation fonctionnelle sur tous les champs
  - Cohérence entre validation front/back

### NAV-01: Correction des erreurs de routage et navigation
- **Description**: Problèmes de conflit entre composants client et métadonnées
- **Tâches**:
  - Séparer correctement métadonnées et composants client
  - Vérifier toutes les pages avec directive use client
  - Corriger les chemins des liens dans la navbar et le dashboard
- **Critères d'acceptation**:
  - Construction sans erreur
  - Navigation fluide entre toutes les sections
  - État actif correct dans les menus

## 🟠 CRITIQUE (Impact sérieux sur l'usage)

### EMP-01: Finalisation du formulaire d'employé
- **Description**: Le formulaire d'employé a des problèmes de validation et d'intégration API
- **Tâches**:
  - Corriger la structure du formulaire EmployeeForm
  - Vérifier l'intégration avec l'API
  - Tester création et modification
- **Critères d'acceptation**:
  - Formulaire s'affiche sans erreur
  - Validation des champs fonctionne
  - Création/mise à jour réussies en BDD

### PAY-01: Stabilisation du système de génération PDF
- **Description**: La génération et prévisualisation des bulletins est instable
- **Tâches**:
  - Vérifier l'intégration avec le service PDF
  - Corriger la prévisualisation dans l'interface
  - Sécuriser le téléchargement
- **Critères d'acceptation**:
  - Génération PDF fiable
  - Prévisualisation fonctionnelle
  - Téléchargement sans erreur

### CONT-01: Formulaire de contact fonctionnel
- **Description**: Le formulaire de contact ne déclenche aucune action
- **Tâches**:
  - Implémenter la logique de soumission
  - Ajouter validation et feedback
  - Configurer endpoint API (simulé ou réel)
- **Critères d'acceptation**:
  - Validation des champs
  - Soumission avec feedback
  - Gestion des erreurs

## 🟡 IMPORTANT (Améliore l'expérience utilisateur)

### UI-01: Feedback utilisateur cohérent
- **Description**: Manque de feedback sur les actions utilisateur
- **Tâches**:
  - Standardiser les toast de succès/erreur
  - Ajouter indicateurs de chargement
  - Améliorer messages d'erreur
- **Critères d'acceptation**:
  - Toasts visibles après actions importantes
  - Indicateurs de chargement sur actions longues
  - Messages d'erreur explicites et actionnables

### DASH-01: Actions du dashboard fonctionnelles
- **Description**: Certaines actions rapides du dashboard ne fonctionnent pas
- **Tâches**:
  - Vérifier tous les boutons d'action rapide
  - Connecter aux fonctionnalités correspondantes
  - Tester le flux complet
- **Critères d'acceptation**:
  - Toutes les actions déclenchent la fonctionnalité attendue
  - Navigation contextuelle cohérente
  - Feedback visible sur chaque action

### API-01: Gestion d'erreurs API robuste
- **Description**: Manque de gestion des erreurs API cohérente
- **Tâches**:
  - Standardiser format des réponses d'erreur
  - Implémenter gestion côté client
  - Ajouter retry automatique quand pertinent
- **Critères d'acceptation**:
  - Erreurs API affichées clairement
  - Options de récupération offertes à l'utilisateur
  - Aucune erreur non traitée dans la console

## 🔄 Flux de travail

Pour chaque issue:

1. **Création branche**: `git checkout -b fix/[ID-ISSUE]`
2. **Correction**: Implémenter les changements requis
3. **Tests**: Valider selon les critères de la checklist
4. **Pull Request**: Détailler les changements et critères validés
5. **Review**: Vérifier avant merge

## 📅 Planning prévisionnel

### Phase 1: Corrections bloquantes (2 jours)
- Jour 1: AUTH-01, FORM-01
- Jour 2: NAV-01, tests de régression

### Phase 2: Corrections critiques (2 jours)
- Jour 3: EMP-01, PAY-01
- Jour 4: CONT-01, tests fonctionnels

### Phase 3: Améliorations importantes (2 jours)
- Jour 5: UI-01, DASH-01
- Jour 6: API-01, tests finaux

### Phase 4: Validation complète (1 jour)
- Jour 7: Vérification complète de la checklist
- Préparation release 0.23 