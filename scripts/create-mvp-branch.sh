#!/bin/bash

# Script de création de la branche de stabilisation MVP 0.23
# Usage: ./scripts/create-mvp-branch.sh

set -e # Arrêt en cas d'erreur

echo "🚀 Initialisation de la branche de stabilisation MVP 0.23"

# Vérifier qu'on est sur main et à jour
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "⚠️  Vous n'êtes pas sur la branche main. Voulez-vous continuer quand même ? (y/n)"
  read -r response
  if [ "$response" != "y" ]; then
    echo "❌ Opération annulée"
    exit 1
  fi
fi

# Commit les changements en cours si nécessaire
if ! git diff --quiet HEAD; then
  echo "📝 Modifications non commitées détectées."
  echo "⚠️  Voulez-vous committer les changements avec le message 'chore: préparation stabilisation MVP 0.23' ? (y/n)"
  read -r response
  if [ "$response" = "y" ]; then
    git add .
    git commit -m "chore: préparation stabilisation MVP 0.23"
    echo "✅ Modifications commitées"
  else
    echo "❌ Veuillez gérer vos modifications avant de continuer"
    exit 1
  fi
fi

# Créer la branche de stabilisation
echo "🌿 Création de la branche stabilisation-mvp-0.23"
git checkout -b stabilisation-mvp-0.23

# Vérifier les schémas Zod automatiquement
echo "🔍 Vérification des schémas Zod"
if [ -f "scripts/validate-zod-schemas.js" ]; then
  node scripts/validate-zod-schemas.js || echo "⚠️  Des problèmes Zod ont été détectés, corrigez-les en priorité"
else
  echo "⚠️  Script validate-zod-schemas.js non trouvé"
fi

# Permissions d'exécution pour les scripts
chmod +x scripts/*.sh scripts/*.js

# Afficher les instructions
echo "
✅ Branche stabilisation-mvp-0.23 créée avec succès

🧰 Prochaines étapes:

1. Suivez le plan dans MVP_0.23_PLAN.md
2. Pour chaque issue, créez une branche:
   git checkout -b fix/[ID-ISSUE]

3. Après chaque correction, exécutez les tests:
   npm test -- tests/mvp-validation.test.js

4. Utilisez la checklist pour vérifier les fonctionnalités:
   - CHECKLIST_MVP.md

5. Mergez les corrections dans stabilisation-mvp-0.23:
   git checkout stabilisation-mvp-0.23
   git merge --no-ff fix/[ID-ISSUE]

👨‍💻 Bon développement!
" 