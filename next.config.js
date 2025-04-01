/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // L'export statique empêche l'utilisation du middleware et des fonctionnalités côté serveur
  // output: 'export', // Commenté pour permettre l'utilisation du middleware
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
  // Configuration des images 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    // unoptimized: true, // Nécessaire uniquement pour l'export statique
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
  webpack: (config, { isServer }) => {
    // Résoudre les problèmes avec les imports node:*
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        "node:process": require.resolve("process/browser"),
        "node:fs": false,
        "node:path": false,
        "node:os": false,
        "node:crypto": require.resolve("crypto-browserify"),
        "node:stream": require.resolve("stream-browserify"),
        "node:util": require.resolve("util/"),
        "node:assert": require.resolve("assert/"),
        "node:buffer": require.resolve("buffer/"),
        "node:url": require.resolve("url/"),
        "process": require.resolve("process/browser"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "assert": require.resolve("assert/"),
        "url": require.resolve("url/"),
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    
    config.externals = [...(config.externals || []), { 'utf-8-validate': 'commonjs utf-8-validate', 'bufferutil': 'commonjs bufferutil' }];
    
    // Ajouter le plugin pour injecter le process dans le bundle
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );
    
    return config;
  },
};

module.exports = nextConfig; 