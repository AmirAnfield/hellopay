# Objectifs MVP 0.59

Suite à l'audit du projet HelloPay, cette version a pour objectif d'améliorer la qualité du code et l'architecture globale du projet. Le MVP 0.59 se concentre sur les améliorations suivantes :

## 1. Consolidation des services

- [ ] Regrouper les services liés aux articles de contrat
- [ ] Unifier les services d'entreprise et d'employé
- [ ] Centraliser la logique commune

## 2. Standardisation des nommages

- [ ] Adopter une convention unique (kebab-case) pour tous les fichiers de services
- [ ] Normaliser les noms d'exportation/importation
- [ ] Mettre à jour les imports dans les composants

## 3. Réduction de la duplication

- [ ] Factoriser les fonctions communes dans les composants dashboard
- [ ] Créer des hooks pour les logiques répétitives (fetchCompanies, fetchEmployees, etc.)
- [ ] Éliminer les doublons de code

## 4. Nettoyage des fichiers obsolètes

- [ ] Archiver correctement les versions antérieures
- [ ] Nettoyer le dossier /archive
- [ ] Documenter l'historique des versions

## 5. Optimisation des performances

- [ ] Réviser les dépendances pour éliminer celles non utilisées
- [ ] Implémenter plus de chargement paresseux (lazy loading)
- [ ] Optimiser les requêtes Firestore

Cette version ne vise pas à ajouter de nouvelles fonctionnalités mais à améliorer la base de code existante pour faciliter les développements futurs. 