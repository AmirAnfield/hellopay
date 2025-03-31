#!/bin/bash
# Script d'analyse des types TypeScript dans le projet
# Usage: ./scripts/analyze-types.sh

# Créer le répertoire d'output si non existant
OUTPUT_DIR="./type-analysis"
mkdir -p $OUTPUT_DIR

echo "🔍 Analyse des types TypeScript dans le projet..."

# 1. Trouver tous les fichiers TypeScript
echo "📄 Recherche des fichiers TypeScript..."
find ./src -type f -name "*.ts" -o -name "*.tsx" | sort > $OUTPUT_DIR/all-ts-files.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/all-ts-files.txt) fichiers TypeScript"

# 2. Extraire toutes les déclarations d'interface
echo "📝 Extraction des interfaces..."
grep -r "interface " --include="*.ts" --include="*.tsx" ./src | sort > $OUTPUT_DIR/interfaces.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/interfaces.txt) déclarations d'interface"

# 3. Extraire toutes les déclarations de type
echo "📝 Extraction des déclarations de type..."
grep -r "type " --include="*.ts" --include="*.tsx" ./src | sort > $OUTPUT_DIR/types.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/types.txt) déclarations de type"

# 4. Extraire tous les schémas Zod
echo "📝 Extraction des schémas Zod..."
grep -r "z\.object" --include="*.ts" --include="*.tsx" ./src | sort > $OUTPUT_DIR/zod-schemas.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/zod-schemas.txt) schémas Zod"

# 5. Analyser les modèles de données par domaine
echo "📊 Analyse par domaine..."

# Utilisateur/Auth
echo "👤 Domaine: Utilisateur/Auth"
grep -r "interface.*User" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/user-interfaces.txt
grep -r "type.*User" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/user-types.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/user-interfaces.txt) interfaces d'utilisateur"
echo "   Trouvé $(wc -l < $OUTPUT_DIR/user-types.txt) types d'utilisateur"

# Entreprises
echo "🏢 Domaine: Entreprises"
grep -r "interface.*Company" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/company-interfaces.txt
grep -r "type.*Company" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/company-types.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/company-interfaces.txt) interfaces d'entreprise"
echo "   Trouvé $(wc -l < $OUTPUT_DIR/company-types.txt) types d'entreprise"

# Employés
echo "👥 Domaine: Employés"
grep -r "interface.*Employee" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/employee-interfaces.txt
grep -r "type.*Employee" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/employee-types.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/employee-interfaces.txt) interfaces d'employé"
echo "   Trouvé $(wc -l < $OUTPUT_DIR/employee-types.txt) types d'employé"

# Bulletins de paie
echo "📄 Domaine: Bulletins de paie"
grep -r "interface.*Payslip" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/payslip-interfaces.txt
grep -r "type.*Payslip" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/payslip-types.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/payslip-interfaces.txt) interfaces de bulletin de paie"
echo "   Trouvé $(wc -l < $OUTPUT_DIR/payslip-types.txt) types de bulletin de paie"

# 6. Analyser les DTO
echo "🔄 Analyse des DTO..."
grep -r "interface.*DTO\|type.*DTO" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/dto.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/dto.txt) DTOs"

# 7. Analyser les FormData
echo "📋 Analyse des FormData..."
grep -r "interface.*FormData\|type.*FormData" --include="*.ts" --include="*.tsx" ./src > $OUTPUT_DIR/form-data.txt
echo "   Trouvé $(wc -l < $OUTPUT_DIR/form-data.txt) types de données de formulaire"

# 8. Créer un rapport récapitulatif
echo "📊 Création du rapport récapitulatif..."
{
  echo "# Rapport d'analyse des types TypeScript"
  echo ""
  echo "## Résumé"
  echo ""
  echo "- Total fichiers TS/TSX: $(wc -l < $OUTPUT_DIR/all-ts-files.txt)"
  echo "- Interfaces: $(wc -l < $OUTPUT_DIR/interfaces.txt)"
  echo "- Types: $(wc -l < $OUTPUT_DIR/types.txt)"
  echo "- Schémas Zod: $(wc -l < $OUTPUT_DIR/zod-schemas.txt)"
  echo ""
  echo "## Par domaine"
  echo ""
  echo "### 👤 Utilisateur/Auth"
  echo "- Interfaces: $(wc -l < $OUTPUT_DIR/user-interfaces.txt)"
  echo "- Types: $(wc -l < $OUTPUT_DIR/user-types.txt)"
  echo ""
  echo "### 🏢 Entreprises"
  echo "- Interfaces: $(wc -l < $OUTPUT_DIR/company-interfaces.txt)"
  echo "- Types: $(wc -l < $OUTPUT_DIR/company-types.txt)"
  echo ""
  echo "### 👥 Employés"
  echo "- Interfaces: $(wc -l < $OUTPUT_DIR/employee-interfaces.txt)"
  echo "- Types: $(wc -l < $OUTPUT_DIR/employee-types.txt)"
  echo ""
  echo "### 📄 Bulletins de paie"
  echo "- Interfaces: $(wc -l < $OUTPUT_DIR/payslip-interfaces.txt)"
  echo "- Types: $(wc -l < $OUTPUT_DIR/payslip-types.txt)"
  echo ""
  echo "## Transfert de données"
  echo ""
  echo "- DTOs: $(wc -l < $OUTPUT_DIR/dto.txt)"
  echo "- Form Data: $(wc -l < $OUTPUT_DIR/form-data.txt)"
  echo ""
  echo "## Prochaines étapes"
  echo ""
  echo "1. Analyser les incohérences entre les types similaires"
  echo "2. Créer une structure de types partagés"
  echo "3. Commencer la migration vers les types uniformisés"
} > $OUTPUT_DIR/report.md

echo "✅ Analyse terminée. Rapport disponible dans $OUTPUT_DIR/report.md" 