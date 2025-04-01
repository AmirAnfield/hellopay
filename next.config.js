/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour l'export statique (Firebase Hosting)
  output: 'export',
  // Désactiver ESLint pendant le build pour ignorer les warnings
  eslint: {
    // Désactiver le linting lors du build, mais toujours l'activer pendant le développement
    ignoreDuringBuilds: true,
  },
  // Ignorer les erreurs de types pour le déploiement
  typescript: {
    // Désactiver la vérification des types lors du build
    ignoreBuildErrors: true,
  },
  // Configuration des images pour l'export statique
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    unoptimized: true, // Nécessaire pour l'export statique
  },
  // Configuration des paths
  distDir: '.next',
  skipTrailingSlashRedirect: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Configurations expérimentales
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Configuration webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    
    config.externals = [...config.externals, { 'utf-8-validate': 'commonjs utf-8-validate', 'bufferutil': 'commonjs bufferutil' }];
    
    // Ajouter le support pour les imports node:*
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "process": require.resolve("process/browser"),
    };
    
    return config;
  },
};

module.exports = nextConfig; 