import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createAppError, handleApiError } from '@/lib/error-handler';

interface SystemComponentStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  responseTime?: number;
  lastUpdated: string;
  details?: string;
}

interface SystemIncident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: string;
  updatedAt: string;
  components: string[];
}

export async function GET(request: NextRequest) {
  try {
    // Préparation du rapport d'état
    const statusReport: {
      status: 'operational' | 'degraded' | 'outage' | 'maintenance';
      version: string;
      environment: string;
      timestamp: string;
      components: SystemComponentStatus[];
      incidents: SystemIncident[];
    } = {
      status: 'operational',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.21.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      components: [],
      incidents: []
    };

    // Vérifier si une version publique ou détaillée est demandée
    const url = new URL(request.url);
    const isDetailed = url.searchParams.get('detailed') === 'true';
    
    // Pour les rapports détaillés, vérifier l'authentification
    if (isDetailed) {
      const session = await getServerSession(authOptions);
      
      // Vérifier si l'utilisateur est authentifié et admin
      if (!session) {
        throw createAppError('AUTH_REQUIRED', 'Authentification requise pour accéder aux détails du statut système');
      }
      
      if (session.user.role !== 'admin') {
        throw createAppError('FORBIDDEN', 'Seuls les administrateurs peuvent accéder aux détails du statut système');
      }
    }

    // 1. Vérifier l'API
    const apiStartTime = Date.now();
    const apiComponent: SystemComponentStatus = {
      name: 'API',
      status: 'operational',
      responseTime: Date.now() - apiStartTime,
      lastUpdated: statusReport.timestamp
    };
    statusReport.components.push(apiComponent);

    // 2. Vérifier la base de données
    try {
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;
      
      statusReport.components.push({
        name: 'Base de données',
        status: 'operational',
        responseTime: dbResponseTime,
        lastUpdated: statusReport.timestamp,
        details: isDetailed ? `PostgreSQL - Temps de réponse: ${dbResponseTime}ms` : undefined
      });
    } catch (_) {
      statusReport.status = 'degraded';
      statusReport.components.push({
        name: 'Base de données',
        status: 'outage',
        lastUpdated: statusReport.timestamp,
        details: isDetailed ? 'Erreur de connexion à la base de données' : undefined
      });
    }

    // 3. Vérifier l'authentification
    try {
      const authStartTime = Date.now();
      await prisma.user.count();
      const authResponseTime = Date.now() - authStartTime;
      
      statusReport.components.push({
        name: 'Authentification',
        status: 'operational',
        responseTime: authResponseTime,
        lastUpdated: statusReport.timestamp
      });
    } catch (_) {
      statusReport.status = 'degraded';
      statusReport.components.push({
        name: 'Authentification',
        status: 'degraded',
        lastUpdated: statusReport.timestamp,
        details: isDetailed ? 'Service d\'authentification partiellement dégradé' : undefined
      });
    }

    // 4. Ajouter des informations supplémentaires pour les rapports détaillés
    if (isDetailed) {
      // Récupérer des statistiques sur les utilisateurs
      const usersCount = await prisma.user.count();
      const verifiedUsersCount = await prisma.user.count({ where: { emailVerified: { not: null } } });
      
      // Ajouter au rapport
      statusReport.components.push({
        name: 'Utilisateurs',
        status: 'operational',
        lastUpdated: statusReport.timestamp,
        details: `Total: ${usersCount}, Vérifiés: ${verifiedUsersCount}`
      });

      // Incidents récents (exemple - dans un environnement réel, on récupérerait de vrais incidents)
      statusReport.incidents = [];
    }

    // Si au moins un composant est en panne, le système est considéré comme dégradé
    if (statusReport.components.some(c => c.status === 'outage')) {
      statusReport.status = 'outage';
    } else if (statusReport.components.some(c => c.status === 'degraded')) {
      statusReport.status = 'degraded';
    }

    return NextResponse.json(statusReport, { status: 200 });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.code === 'AUTH_REQUIRED' ? 401 : errorResponse.code === 'FORBIDDEN' ? 403 : 500 });
  }
} 