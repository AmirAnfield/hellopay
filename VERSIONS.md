# Historique des versions HelloPay

Ce document présente l'historique des versions du projet HelloPay et les changements majeurs apportés à chaque version.

## Version 0.59 (Actuelle)

**Objectif principal** : Refactorisation et optimisation de l'architecture.

### Améliorations
- Consolidation des services liés aux articles de contrat
- Unification des services d'entreprise et d'employé
- Création de hooks personnalisés pour factoriser les logiques communes
- Standardisation des nommages (convention kebab-case)
- Documentation et nettoyage du code

### Changements techniques
- Refactorisation des services avec une approche plus modulaire
- Centralisation des types dans des fichiers dédiés
- Amélioration de la gestion des erreurs et des messages utilisateur
- Mise en place de documentation pour faciliter la migration progressive

## Version 0.58 (Précédente)

**Objectif principal** : Stabilisation et préparation pour la refactorisation.

### Améliorations
- Correctifs de bugs dans la génération des contrats
- Améliorations des performances générales
- Préparation pour la refactorisation de l'architecture

## Version 0.51

**Objectif principal** : Générateur de contrat amélioré.

### Fonctionnalités
- Pagination avancée pour Firestore
- Support de la pagination par curseurs
- Hook personnalisé `useFirestorePagination`
- Composants UI réutilisables pour la pagination
- Support de la pagination infinie avec "Charger plus"

### Structure
- Centralisation des services
- Hooks personnalisés regroupés et exposés via un index central
- Refactorisation du middleware
- Élimination des composants en double et du code mort
- Types cohérents pour les entités principales

## Version 0.50

**Objectif principal** : Générateur de contrat avec fonctionnalités d'exportation.

### Fonctionnalités
- Génération dynamique de contrat
- Export PDF
- Format standardisé avec mise en page professionnelle
- Contenu juridiquement valide basé sur le Code du travail

## Versions antérieures

Pour les versions antérieures, consultez les archives et les rapports de MVP dans le dossier `/archive`. 