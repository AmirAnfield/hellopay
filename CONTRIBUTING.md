# Guide de contribution

Ce document décrit le workflow de développement et les conventions à suivre pour contribuer à ce projet.

## Structure de branches (GitFlow)

Nous utilisons le modèle GitFlow pour organiser notre travail. Voici la structure des branches :

### Branches principales

- `main` : La branche de production, contenant le code stable et déployé.
- `develop` : La branche d'intégration continue, où toutes les fonctionnalités sont fusionnées avant d'être déployées sur `main`.

### Branches temporaires

- `feature/nom-de-la-fonctionnalité` : Pour développer de nouvelles fonctionnalités.
- `hotfix/nom-du-correctif` : Pour les corrections urgentes à appliquer sur `main`.
- `release/x.y.z` : Pour préparer une nouvelle version avant de la fusionner dans `main`.

## Procédure de développement

### Pour une nouvelle fonctionnalité

1. Créer une branche depuis `develop` :
   ```
   git checkout develop
   git pull origin develop
   git checkout -b feature/ma-fonctionnalité
   ```

2. Développer la fonctionnalité et la tester localement.

3. Pousser la branche vers le dépôt distant :
   ```
   git push origin feature/ma-fonctionnalité
   ```

4. Créer une Pull Request vers `develop`.

### Pour un correctif urgent

1. Créer une branche depuis `main` :
   ```
   git checkout main
   git pull origin main
   git checkout -b hotfix/mon-correctif
   ```

2. Développer le correctif et le tester localement.

3. Pousser la branche vers le dépôt distant :
   ```
   git push origin hotfix/mon-correctif
   ```

4. Créer une Pull Request vers `main` ET `develop`.

### Pour une version

1. Créer une branche depuis `develop` :
   ```
   git checkout develop
   git pull origin develop
   git checkout -b release/x.y.z
   ```

2. Finaliser la version (mettre à jour CHANGELOG.md, etc.).

3. Créer une Pull Request vers `main`.

4. Après la fusion dans `main`, créer un tag avec la version :
   ```
   git checkout main
   git pull origin main
   git tag -a vx.y.z -m "Version x.y.z"
   git push origin vx.y.z
   ```

5. Fusionner les changements dans `develop` :
   ```
   git checkout develop
   git pull origin develop
   git merge --no-ff main
   git push origin develop
   ```

## Convention de nommage des commits

Format : `type(scope): message`

Types :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage (pas de changement de code)
- `refactor` : Refactorisation du code
- `test` : Ajout ou modification de tests
- `chore` : Tâches diverses

Exemple : `feat(auth): ajouter l'authentification Google`

## Versionnement

Nous utilisons le versionnement sémantique (SemVer) :

- MAJOR (x.0.0) : Changements incompatibles avec les versions précédentes
- MINOR (0.x.0) : Ajout de fonctionnalités rétrocompatibles
- PATCH (0.0.x) : Corrections de bugs rétrocompatibles 