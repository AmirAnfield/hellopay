#!/usr/bin/env node
/**
 * Script pour nettoyer les console.log inutiles du projet
 * 
 * Ce script:
 * 1. Cherche tous les console.log dans les fichiers .ts et .tsx
 * 2. Préserve certains logs essentiels (Firebase, performances, etc.)
 * 3. Remplace les autres par des no-ops en développement uniquement
 * 
 * Usage: node scripts/cleanup-logs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extensions à traiter
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns de console.log à préserver (logs critiques)
const preservePatterns = [
  // Initialisation de Firebase et configuration
  /console\.log\(\s*['"`]🔥 Firebase/,
  /console\.log\(\s*['"`]Firebase (Admin |)initialisé/,
  
  // Logs de sécurité et authentification
  /console\.log\(\s*['"`]\[SECURITY\]/,
  /console\.error\(\s*['"`](Erreur de sécurité|Security error)/,
  
  // Logs de performance (temps d'exécution > 500ms)
  /console\.warn\(\s*['"`]⚠️ Requête lente/,
  
  // Logs d'erreurs critiques
  /console\.error\(\s*['"`]Erreur critique/,
  
  // Logs dans les tests et scripts
  /console\.log\(\s*colors\.(blue|green|red|cyan)/
];

// Patterns à remplacer sans condition (toujours supprimer)
const alwaysReplacePatterns = [
  // Logs de débogage temporaires
  /console\.log\(\s*['"`]DEBUG:/,
  /console\.log\(\s*['"`]TODO:/,
  /console\.log\(\s*['"`]FIXME:/,
  
  // Logs de données sensibles
  /console\.log\(\s*['"`]user:/i,
  /console\.log\(\s*['"`]password:/i,
  /console\.log\(\s*['"`]auth:/i
];

// Fonction pour vérifier si un log doit être préservé
function shouldPreserveLog(line) {
  return preservePatterns.some(pattern => pattern.test(line));
}

// Fonction pour vérifier si un log doit être remplacé sans condition
function shouldAlwaysReplace(line) {
  return alwaysReplacePatterns.some(pattern => pattern.test(line));
}

// Fonction pour remplacer les console.log par des no-ops en mode développement
function replaceConsoleLog(content) {
  // Diviser le contenu en lignes
  const lines = content.split('\n');
  let modified = false;
  
  // Traiter chaque ligne
  const processedLines = lines.map(line => {
    // Si la ligne contient un console.log
    if (line.includes('console.log(')) {
      // Si le log doit être préservé
      if (shouldPreserveLog(line)) {
        return line;
      }
      
      // Si le log doit être remplacé sans condition
      if (shouldAlwaysReplace(line)) {
        modified = true;
        // Commentez la ligne
        return `// ${line} // [CLEANUP] Log supprimé automatiquement`;
      }
      
      // Sinon, remplacer le log par un no-op en mode développement
      modified = true;
      const indentation = line.match(/^(\s*)/)[1];
      return `${indentation}if (process.env.NODE_ENV === 'development') {
${indentation}  // ${line.trim()} // [CLEANUP] Log préservé en développement uniquement
${indentation}}`;
    }
    
    return line;
  });
  
  // Retourner le contenu modifié et un indicateur de modification
  return {
    content: processedLines.join('\n'),
    modified
  };
}

// Fonction pour parcourir récursivement un répertoire
function processDirectory(dir) {
  let fileCount = 0;
  let modifiedCount = 0;
  
  // Parcourir le répertoire
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    // Si c'est un répertoire, le traiter récursivement
    if (stat.isDirectory()) {
      // Ignorer node_modules, .git, etc.
      if (file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== 'dist') {
        const result = processDirectory(fullPath);
        fileCount += result.fileCount;
        modifiedCount += result.modifiedCount;
      }
    }
    // Si c'est un fichier avec une extension à traiter
    else if (extensions.includes(path.extname(file))) {
      fileCount++;
      
      // Lire le contenu du fichier
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Remplacer les console.log
      const { content: newContent, modified } = replaceConsoleLog(content);
      
      // Si le contenu a été modifié, écrire le nouveau contenu
      if (modified) {
        modifiedCount++;
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Modifié: ${fullPath}`);
      }
    }
  }
  
  return { fileCount, modifiedCount };
}

// Point d'entrée du script
console.log('Nettoyage des console.log inutiles...');

// Traiter tous les répertoires du projet
const directories = ['src', 'firebase/functions/src', 'genkit/src'];

let totalFiles = 0;
let totalModified = 0;

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`Traitement du répertoire: ${dir}`);
    const { fileCount, modifiedCount } = processDirectory(dir);
    totalFiles += fileCount;
    totalModified += modifiedCount;
  } else {
    console.log(`Le répertoire ${dir} n'existe pas, ignoré.`);
  }
}

// Afficher un résumé
console.log('\nRésumé du nettoyage:');
console.log(`- Fichiers analysés: ${totalFiles}`);
console.log(`- Fichiers modifiés: ${totalModified}`);
console.log('Terminé!'); 