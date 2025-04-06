# Plan de tests pour le générateur de contrats

## Tests unitaires

### 1. Tests des validations

- Vérifier que chaque fonction de validation des articles détecte correctement les champs manquants obligatoires
- Tester les validations conditionnelles (ex: champs spécifiques requis pour CDD)
- Tester les limites (durée maximale de CDD, période d'essai, etc.)

### 2. Tests des services

- Tester `saveArticle` (générique)
  - Création d'un nouvel article
  - Mise à jour d'un article existant
  - Gestion des erreurs

- Tester `loadArticle` et `loadFullContract`
  - Chargement complet d'un contrat
  - Gestion des cas où certains articles sont manquants
  - Gestion des erreurs

- Tester `exportContractToPDF`
  - Vérifier que le HTML généré est correct et contient tous les articles
  - S'assurer que les données sont correctement intégrées dans le template

### 3. Tests des composants

- Tester chaque composant d'étape (`Article1NatureStep`, etc.)
  - Rendu initial avec ou sans données
  - Soumission du formulaire
  - Validation côté client
  - Navigation (retour/suivant)

- Tester `ContractWizard`
  - Chargement initial des données
  - Navigation entre les étapes
  - Contrôle des accès (étapes précédentes requises)
  - Sauvegarde automatique

## Tests d'intégration

### 1. Flux complet CDI

1. Créer un nouveau contrat CDI
2. Définir les heures hebdomadaires (35h)
3. Sélectionner une entreprise
4. Sélectionner un employé
5. Remplir l'article 1 (Nature du contrat)
   - Avec période d'essai
6. Remplir l'article 2 (Date d'entrée)
7. Remplir l'article 3 (Fonctions)
8. Remplir l'article 4 (Lieu de travail)
9. Remplir l'article 5 (Organisation du travail)
10. Remplir l'article 6 (Rémunération)
11. Remplir l'article 7 (Avantages)
12. Remplir l'article 8 (Congés)
13. Remplir les articles optionnels (9 à 14)
14. Prévisualiser le contrat
15. Exporter en PDF
16. Valider le contrat

### 2. Flux complet CDD

1. Créer un nouveau contrat CDD
2. Définir les heures hebdomadaires (24h - temps partiel)
3. Sélectionner une entreprise
4. Sélectionner un employé
5. Remplir l'article 1 (Nature du contrat)
   - Définir la date de début et de fin
   - Définir le motif du CDD
6. Remplir les autres articles spécifiques au CDD
7. Prévisualiser le contrat
8. Exporter en PDF
9. Valider le contrat

### 3. Sauvegarde et reprise

1. Commencer un contrat et remplir plusieurs étapes
2. Sauvegarder l'état
3. Quitter l'application
4. Revenir et charger l'état sauvegardé
5. Vérifier que toutes les données sont présentes
6. Continuer le processus

## Tests end-to-end

### 1. Test du flux utilisateur complet

- Création d'un compte utilisateur
- Création d'une entreprise
- Ajout d'un employé
- Création d'un contrat CDI
- Sauvegarde d'une version du contrat
- Modification et finalisation du contrat
- Export du contrat en PDF
- Validation du contrat

### 2. Tests de sécurité

- Vérifier que les contrats d'un utilisateur ne sont pas accessibles à d'autres utilisateurs
- Tester les règles de sécurité Firestore
- Vérifier que les permissions sont correctement appliquées

### 3. Tests de performance

- Tester la génération du PDF avec un grand nombre d'articles
- Mesurer le temps de chargement de l'historique des contrats
- Optimisation des requêtes Firestore

## Outils de test recommandés

1. **Tests unitaires**: Jest + React Testing Library
2. **Tests d'intégration**: Jest + React Testing Library + Firebase Testing
3. **Tests end-to-end**: Cypress ou Playwright
4. **Tests de performance**: Lighthouse

## Plan d'implémentation des tests

1. Commencer par les tests unitaires des services essentiels
2. Ajouter des tests pour les composants principaux
3. Implémenter les tests d'intégration
4. Mettre en place les tests end-to-end

## Maquettes de tests unitaires

### Test de validation d'un article

```typescript
import { validateData } from '../services/contractArticlesSaveService';

describe('validateData', () => {
  it('should return true when all required fields are present', () => {
    const data = { contractType: 'CDI', startDate: '2023-01-01' };
    const requiredFields = ['contractType', 'startDate'];
    expect(validateData(data, requiredFields)).toBe(true);
  });

  it('should return false when a required field is missing', () => {
    const data = { contractType: 'CDI' };
    const requiredFields = ['contractType', 'startDate'];
    expect(validateData(data, requiredFields)).toBe(false);
  });
});
```

### Test du service de sauvegarde

```typescript
import { saveArticle1Nature } from '../services/contractArticlesSaveService';
import { firestore } from '../lib/firebase/config';

// Mock Firebase
jest.mock('../lib/firebase/config', () => ({
  firestore: {
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
  }
}));

describe('saveArticle1Nature', () => {
  it('should throw an error if contractType is missing', async () => {
    await expect(saveArticle1Nature('user123', {})).rejects.toThrow("Le type de contrat est obligatoire");
  });

  it('should require endDate and reason for CDD', async () => {
    await expect(saveArticle1Nature('user123', { contractType: 'CDD' })).rejects.toThrow("Pour un CDD, la date de fin et le motif sont obligatoires");
  });
});
```

### Test d'un composant d'étape

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Article1NatureStep } from '../components/contract/Article1NatureStep';

describe('Article1NatureStep', () => {
  it('should render with CDI content', () => {
    render(
      <Article1NatureStep
        contractType="CDI"
        onSaveArticle={jest.fn()}
        isLoading={false}
        onBack={jest.fn()}
      />
    );
    
    expect(screen.getByText(/Contrat à Durée Indéterminée/)).toBeInTheDocument();
  });

  it('should show trial period fields when enabled', () => {
    render(
      <Article1NatureStep
        contractType="CDI"
        onSaveArticle={jest.fn()}
        isLoading={false}
        onBack={jest.fn()}
      />
    );
    
    fireEvent.click(screen.getByLabelText(/Oui, inclure une période d'essai/));
    expect(screen.getByLabelText(/Durée de la période d'essai/)).toBeInTheDocument();
  });
});
``` 