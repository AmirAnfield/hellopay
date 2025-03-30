import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Route de vérification de santé du système
 * Permet de vérifier si l'API et la base de données sont fonctionnelles
 */
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Vérifier la connexion à la base de données
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      // Exécuter une requête simple pour vérifier la connexion
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStartTime;
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      dbStatus = 'error';
    }
    
    // Informations sur l'API
    const apiResponseTime = Date.now() - startTime;
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.21.0';
    const environment = process.env.NODE_ENV || 'development';
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version,
      environment,
      services: {
        api: {
          status: 'healthy',
          responseTime: `${apiResponseTime}ms`
        },
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la vérification de santé:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Une erreur est survenue lors de la vérification de santé'
    }, { status: 500 });
  }
} 