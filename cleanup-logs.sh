#!/bin/bash
# Recherche les console.log non essentiels et les supprime
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -E '/console\.log\(/d'

# Préserve les logs d'initialisation Firebase et de sécurité
grep -l "firebase" $(find ./src -type f -name "*.ts" -o -name "*.tsx") | xargs sed -i '' -E 's/^\s*\/\/\s*console\.log/console.log/g'
