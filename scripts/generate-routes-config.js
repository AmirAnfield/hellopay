/**
 * Script pour générer la configuration des redirections Firebase Hosting
 * à partir des routes dynamiques de Next.js
 */
const fs = require('fs');
const path = require('path');

// Routes dynamiques principales de l'application
const dynamicRoutes = [
  '/dashboard',
  '/profile',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/payslips',
  '/payslips/[id]',
  '/employees',
  '/employees/[id]',
  '/companies',
  '/companies/[id]',
];

// Lire la configuration firebase.json existante
const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
let firebaseConfig = {};

try {
  if (fs.existsSync(firebaseConfigPath)) {
    const configContent = fs.readFileSync(firebaseConfigPath, 'utf8');
    firebaseConfig = JSON.parse(configContent);
  }
} catch (error) {
  console.error('Erreur lors de la lecture du fichier firebase.json:', error);
  process.exit(1);
}

// S'assurer que la section hosting existe
if (!firebaseConfig.hosting) {
  firebaseConfig.hosting = {
    public: 'out',
    cleanUrls: true,
    ignore: [
      'firebase.json',
      '**/.*',
      '**/node_modules/**'
    ]
  };
}

// Générer les règles de redirection
const rewrites = dynamicRoutes.map(route => {
  // Si c'est une route avec paramètre dynamique comme [id]
  if (route.includes('[') && route.includes(']')) {
    // Remplacer [paramName] par ** (wildcard)
    const pattern = route.replace(/\[\w+\]/g, '**');
    return {
      source: `${pattern}`,
      destination: '/index.html'
    };
  }
  
  return {
    source: `${route}`,
    destination: '/index.html'
  };
});

// Ajouter une règle catch-all pour toutes les autres routes
rewrites.push({
  source: '**',
  destination: '/index.html'
});

// Mettre à jour la configuration
firebaseConfig.hosting.rewrites = rewrites;

// Écrire la configuration mise à jour
fs.writeFileSync(
  firebaseConfigPath,
  JSON.stringify(firebaseConfig, null, 2),
  'utf8'
);

console.log('Configuration firebase.json mise à jour avec les redirections pour les routes dynamiques!'); 