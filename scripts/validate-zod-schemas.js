#!/usr/bin/env node

/**
 * Script de validation des schémas Zod
 * 
 * Ce script analyse les fichiers contenant des schémas Zod pour détecter
 * les erreurs courantes, comme l'utilisation de .trim() après .default()
 * 
 * Usage: node scripts/validate-zod-schemas.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIRS = ['src/components', 'src/lib/validators', 'src/app'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns à chercher
const PATTERNS = [
  {
    name: 'trim-after-default',
    regex: /\.default\([^)]*\)\.trim\(\)/g,
    description: 'Utilisation de .trim() après .default() - inversez l\'ordre',
    severity: 'ERROR',
    fix: (content) => content.replace(/\.default\(([^)]*)\)\.trim\(\)/g, '.trim().default($1)')
  },
  {
    name: 'default-after-optional-nullable',
    regex: /\.optional\(\)\.nullable\(\)\.default\([^)]*\)/g,
    description: 'Utilisation de .default() après .optional().nullable() - mettez default() avant',
    severity: 'ERROR',
    fix: (content) => content.replace(/\.optional\(\)\.nullable\(\)\.default\(([^)]*)\)/g, '.default($1).optional().nullable()')
  },
  {
    name: 'inconsistent-method-order',
    regex: /z\.string\(\)[^.]*\.([^(]+\(\))[^.]*\.([^(]+\(\))/g,
    description: 'Ordre des méthodes potentiellement incohérent',
    severity: 'WARNING'
  }
];

// Utilitaires
function findFiles(dir, extensions, files = []) {
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of dirEntries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findFiles(fullPath, extensions, files);
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkForZodImport(content) {
  // Vérifier les différentes façons d'importer zod
  return content.includes('from "zod"') || 
         content.includes('from \'zod\'') || 
         content.includes('require("zod")') ||
         content.includes('as z from') ||
         content.match(/import\s+\{\s*z\s*\}/);
}

// Codes couleur pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Analyse du projet
console.log(`\n${colors.cyan}=== Validation des schémas Zod ====${colors.reset}\n`);

let problemsFound = 0;
let filesChecked = 0;
let filesWithZod = 0;
let fixesApplied = 0;

// Collecter tous les fichiers source
let allFiles = [];
for (const dir of SOURCE_DIRS) {
  const sourceDir = path.join(ROOT_DIR, dir);
  if (fs.existsSync(sourceDir)) {
    allFiles = allFiles.concat(findFiles(sourceDir, EXTENSIONS));
  }
}

console.log(`${colors.blue}Vérification de ${allFiles.length} fichiers...${colors.reset}\n`);

// Pour chaque fichier, vérifier les patterns problématiques
for (const file of allFiles) {
  filesChecked++;
  const relativePath = path.relative(ROOT_DIR, file);
  const content = fs.readFileSync(file, 'utf8');
  
  // Ne vérifier que les fichiers qui utilisent zod
  if (!checkForZodImport(content)) {
    continue;
  }
  
  filesWithZod++;
  let fileHasProblems = false;
  let fixedContent = content;
  
  // Vérifier chaque pattern
  for (const pattern of PATTERNS) {
    const matches = content.match(pattern.regex);
    
    if (matches && matches.length > 0) {
      if (!fileHasProblems) {
        console.log(`\n${colors.magenta}${relativePath}${colors.reset}`);
        fileHasProblems = true;
      }
      
      problemsFound += matches.length;
      const colorCode = pattern.severity === 'ERROR' ? colors.red : colors.yellow;
      console.log(`  ${colorCode}${pattern.severity}${colors.reset}: ${pattern.description}`);
      
      // Afficher les occurrences avec numéros de ligne
      matches.forEach(match => {
        const lines = content.split('\n');
        let lineNum = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(match)) {
            lineNum = i + 1;
            console.log(`    ${colors.gray}Ligne ${lineNum}:${colors.reset} ${lines[i].trim()}`);
            break;
          }
        }
      });
      
      // Appliquer les corrections si disponibles
      if (pattern.fix) {
        console.log(`    ${colors.green}Fix automatique disponible${colors.reset}`);
        fixedContent = pattern.fix(fixedContent);
        fixesApplied++;
      }
    }
  }
  
  // Sauvegarder les modifications si nécessaire
  if (fixedContent !== content) {
    fs.writeFileSync(file, fixedContent, 'utf8');
    console.log(`    ${colors.green}✓ Modifications appliquées${colors.reset}`);
  }
}

// Récapitulatif
console.log(`\n${colors.cyan}=== Récapitulatif ===${colors.reset}`);
console.log(`${colors.blue}Fichiers analysés :${colors.reset} ${filesChecked}`);
console.log(`${colors.blue}Fichiers utilisant Zod :${colors.reset} ${filesWithZod}`);
console.log(`${colors.blue}Problèmes détectés :${colors.reset} ${problemsFound}`);
console.log(`${colors.blue}Corrections appliquées :${colors.reset} ${fixesApplied}`);

// Conseils pour les corrections manuelles
if (problemsFound > 0) {
  console.log(`\n${colors.yellow}Recommandations :${colors.reset}`);
  console.log(`1. Ordre recommandé des méthodes Zod sur z.string() : `);
  console.log(`   ${colors.green}z.string().trim().min().max().email()...etc.default()${colors.reset}`);
  console.log(`2. Mettre ${colors.green}.trim()${colors.reset} AVANT ${colors.green}.default()${colors.reset}`);
  console.log(`3. Mettre ${colors.green}.default()${colors.reset} AVANT ${colors.green}.optional().nullable()${colors.reset}`);
}

// Statut de sortie pour l'intégration CI
process.exit(problemsFound > 0 ? 1 : 0); 