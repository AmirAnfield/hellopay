# Checklist de validation MVP 0.23 HelloPay

## 🔐 Authentification

| Fonctionnalité | Critères de validation | Statut | Commentaire |
|----------------|------------------------|--------|------------|
| **Inscription** | - Formulaire s'affiche correctement<br>- Validation des champs fonctionne<br>- Soumission crée un nouvel utilisateur<br>- Redirection vers dashboard après succès<br>- Gestion des erreurs (email existant, etc.) | ❌ | |
| **Connexion** | - Formulaire s'affiche correctement<br>- Validation fonctionne<br>- Connexion réussie redirige vers dashboard<br>- Gestion des erreurs (mauvais mdp, etc.)<br>- Persistance de session fonctionne | ❌ | |
| **Déconnexion** | - Bouton déconnexion fonctionne<br>- Session terminée<br>- Redirection vers accueil<br>- Accès protégés bloqués après déconnexion | ❌ | |
| **Récupération mot de passe** | - Formulaire s'affiche correctement<br>- Email de réinitialisation envoyé<br>- Token de réinitialisation fonctionne<br>- Nouveau mot de passe accepté | ❌ | |
| **Protection des routes** | - Routes /dashboard/* protégées<br>- Tentative d'accès sans auth redirige vers login<br>- API routes protégées correctement | ❌ | |

## 💼 Gestion des entreprises

| Fonctionnalité | Critères de validation | Statut | Commentaire |
|----------------|------------------------|--------|------------|
| **Liste des entreprises** | - Tableau affiche correctement les données<br>- Pagination fonctionne<br>- Recherche/filtrage fonctionne<br>- Boutons d'action fonctionnels | ❌ | |
| **Création d'entreprise** | - Formulaire s'affiche correctement<br>- Validation Zod fonctionne (tous les champs)<br>- Soumission crée l'entreprise en BDD<br>- Retour utilisateur (toast) fonctionne<br>- Redirection après création | ❌ | |
| **Modification d'entreprise** | - Formulaire préremplit les données<br>- Modifications sauvegardées en BDD<br>- Validation fonctionne<br>- Feedback utilisateur fonctionnel | ❌ | |
| **Suppression d'entreprise** | - Confirmation demandée<br>- Suppression effective en BDD<br>- Gestion des contraintes (employés liés)<br>- Feedback utilisateur fonctionnel | ❌ | |
| **Détails entreprise** | - Affichage correct des informations<br>- Liste des employés associés<br>- Actions contextuelles fonctionnelles | ❌ | |

## 👥 Gestion des employés

| Fonctionnalité | Critères de validation | Statut | Commentaire |
|----------------|------------------------|--------|------------|
| **Liste des employés** | - Tableau affiche correctement les données<br>- Pagination fonctionne<br>- Recherche/filtrage fonctionne<br>- Filtrage par entreprise fonctionne<br>- Boutons d'action fonctionnels | ❌ | |
| **Création d'employé** | - Formulaire s'affiche correctement<br>- Liste des entreprises chargée correctement<br>- Validation Zod fonctionne (tous les champs)<br>- Soumission crée l'employé en BDD<br>- Calcul automatique du salaire fonctionne<br>- Retour utilisateur (toast) fonctionne<br>- Redirection après création | ❌ | |
| **Modification d'employé** | - Formulaire préremplit les données<br>- Modifications sauvegardées en BDD<br>- Validation fonctionne<br>- Feedback utilisateur fonctionnel | ❌ | |
| **Suppression d'employé** | - Confirmation demandée<br>- Suppression effective en BDD<br>- Gestion des contraintes (bulletins liés)<br>- Feedback utilisateur fonctionnel | ❌ | |
| **Détails employé** | - Affichage correct des informations<br>- Historique des bulletins associés<br>- Actions contextuelles fonctionnelles | ❌ | |

## 📄 Gestion des bulletins de paie

| Fonctionnalité | Critères de validation | Statut | Commentaire |
|----------------|------------------------|--------|------------|
| **Liste des bulletins** | - Tableau affiche correctement les données<br>- Pagination fonctionne<br>- Recherche/filtrage fonctionne<br>- Filtrage par employé/entreprise fonctionne<br>- Boutons d'action fonctionnels | ❌ | |
| **Génération bulletin** | - Sélection entreprise/employé fonctionne<br>- Sélection période fonctionne<br>- Calcul en temps réel fonctionne<br>- Prévisualisation PDF fonctionne<br>- Enregistrement en BDD réussi<br>- Téléchargement PDF fonctionne | ❌ | |
| **Téléchargement bulletin** | - PDF généré correctement<br>- Contenu du PDF exact et formaté<br>- Téléchargement fonctionne | ❌ | |
| **Génération multiple** | - Sélection multiple fonctionne<br>- Génération par lot fonctionne<br>- Archive ZIP téléchargeable | ❌ | |
| **Envoi par email** | - Formulaire d'envoi fonctionne<br>- Email avec pièce jointe envoyé<br>- Tracking de l'envoi fonctionnel | ❌ | |

## 🧭 Navigation et UI

| Fonctionnalité | Critères de validation | Statut | Commentaire |
|----------------|------------------------|--------|------------|
| **Navbar principale** | - Liens fonctionnels<br>- État actif correct<br>- Menu déroulant fonctionne<br>- Adaptation responsive<br>- Menu user fonctionnel | ❌ | |
| **Sidebar dashboard** | - Liens fonctionnels<br>- État actif correct<br>- Collapse/expand fonctionne | ❌ | |
| **Page d'accueil** | - Contenu affiché correctement<br>- CTA fonctionnels<br>- Responsive fonctionnel | ❌ | |
| **Dashboard** | - Widgets affichés correctement<br>- Données actualisées<br>- Actions rapides fonctionnelles<br>- Statistiques correctes | ❌ | |
| **Formulaire de contact** | - Formulaire s'affiche correctement<br>- Validation fonctionne<br>- Soumission envoie données<br>- Feedback utilisateur fonctionnel | ❌ | |
| **Responsive design** | - Mobile : navigation adaptée<br>- Tablette : mise en page adaptée<br>- Desktop : utilisation optimale de l'espace | ❌ | |

## 🔧 Fonctionnalités techniques

| Fonctionnalité | Critères de validation | Statut | Commentaire |
|----------------|------------------------|--------|------------|
| **Gestion d'erreurs** | - Erreurs API affichées correctement<br>- Page 404 fonctionnelle<br>- Page 500 fonctionnelle<br>- Retry automatique sur échec API | ❌ | |
| **Performance** | - Chargement initial < 2s<br>- Lazy loading des images<br>- Suspense pour chargement dynamique<br>- Pagination performante | ❌ | |
| **État global** | - Session utilisateur persistante<br>- Thème persistant<br>- Paramètres utilisateur sauvegardés | ❌ | |
| **Sécurité** | - CSRF protection<br>- Validation des entrées<br>- Protection XSS<br>- Rate limiting | ❌ | |

## 📋 Instructions de test

1. Pour chaque élément de la checklist :
   - Tester la fonctionnalité selon les critères listés
   - Marquer ✅ si tous les critères sont remplis
   - Marquer ⚠️ si partiellement fonctionnel (préciser en commentaire)
   - Marquer ❌ si non fonctionnel

2. Pour les bugs identifiés :
   - Créer une issue GitHub avec description précise
   - Inclure étapes pour reproduire
   - Inclure screenshot si pertinent
   - Taguer avec priorité (bloquant, critique, important)

3. Ordre de test recommandé :
   - Authentification → Navigation → CRUD Entreprises → CRUD Employés → Bulletins de paie

## 🚀 Validation finale MVP 0.23

Le MVP est considéré comme validé lorsque :
- Tous les items marqués BLOQUANT sont ✅
- Au moins 90% des items CRITIQUE sont ✅
- Au moins 70% des items IMPORTANT sont ✅ 