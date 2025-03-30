import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logSecurityEvent, LogLevel, SecurityEvent } from "./logger";

/**
 * Types d'entités qui peuvent être protégées
 */
export enum EntityType {
  USER = "USER",
  COMPANY = "COMPANY",
  EMPLOYEE = "EMPLOYEE",
  PAYSLIP = "PAYSLIP",
  CONTRACT = "CONTRACT",
  CERTIFICATE = "CERTIFICATE"
}

/**
 * Actions possibles sur les entités
 */
export enum Permission {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  ADMIN = "ADMIN" // Permission spéciale pour les administrateurs
}

/**
 * Interface pour une vérification de propriété
 */
interface OwnershipCheck {
  entity: EntityType;
  entityId: string;
  userId: string;
}

/**
 * Vérifie si un utilisateur est propriétaire d'une entité
 */
export async function checkOwnership({ entity, entityId, userId }: OwnershipCheck): Promise<boolean> {
  try {
    let isOwner = false;

    switch (entity) {
      case EntityType.COMPANY:
        // Vérifier si l'utilisateur est propriétaire de l'entreprise
        const company = await prisma.company.findUnique({
          where: { id: entityId },
          select: { userId: true }
        });
        isOwner = company?.userId === userId;
        break;

      case EntityType.EMPLOYEE:
        // Vérifier si l'employé appartient à une entreprise de l'utilisateur
        const employee = await prisma.employee.findUnique({
          where: { id: entityId },
          include: { company: { select: { userId: true } } }
        });
        isOwner = employee?.company.userId === userId;
        break;

      case EntityType.PAYSLIP:
        // Vérifier si le bulletin appartient à l'utilisateur
        const payslip = await prisma.payslip.findUnique({
          where: { id: entityId },
          select: { userId: true }
        });
        isOwner = payslip?.userId === userId;
        break;

      // Ajouter d'autres vérifications selon les besoins
      default:
        isOwner = false;
    }

    return isOwner;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété:", error);
    return false;
  }
}

/**
 * Middleware pour vérifier les permissions
 */
export function requirePermission(entity: EntityType, permission: Permission) {
  return async (req: NextRequest, next: () => Promise<NextResponse>) => {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      // Journaliser la tentative d'accès non autorisée
      await logSecurityEvent(
        SecurityEvent.UNAUTHORIZED_ACCESS,
        `Tentative d'accès sans authentification à ${entity}`,
        LogLevel.WARN,
        {
          path: req.nextUrl.pathname,
          method: req.method,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        }
      );
      
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Si c'est un admin, autoriser toutes les actions
    if (session.user.role === "admin") {
      return next();
    }

    // Pour les autres cas, vérifier la propriété de la ressource
    // Récupérer l'ID de l'entité depuis l'URL ou le corps de la requête
    let entityId: string | undefined;
    
    // Essayer de récupérer l'ID depuis les paramètres d'URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const potentialId = pathParts[pathParts.length - 1];
    
    // Si l'ID semble être un UUID ou similar format
    if (/^[a-zA-Z0-9_-]+$/.test(potentialId) && potentialId.length > 8) {
      entityId = potentialId;
    } 
    // Sinon, chercher dans le corps de la requête pour les opérations CREATE/UPDATE
    else if (permission === Permission.CREATE || permission === Permission.UPDATE) {
      try {
        const body = await req.json();
        entityId = body.id;
        
        // Récréer la requête car nous avons consommé le corps
        req = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(body),
          credentials: 'include'
        });
      } catch {
        // Ignorer les erreurs de parsing JSON
      }
    }
    
    // Pour CREATE, pas besoin de vérifier la propriété
    if (permission === Permission.CREATE) {
      return next();
    }
    
    // Si nous avons un ID d'entité, vérifier la propriété
    if (entityId) {
      const isOwner = await checkOwnership({
        entity,
        entityId,
        userId: session.user.id
      });
      
      if (isOwner) {
        return next();
      }
    }
    
    // Journaliser la tentative d'accès non autorisée
    await logSecurityEvent(
      SecurityEvent.UNAUTHORIZED_ACCESS,
      `Tentative d'accès non autorisé de ${session.user.email} à ${entity} avec permission ${permission}`,
      LogLevel.WARN,
      {
        userId: session.user.id,
        entity,
        entityId,
        permission,
        path: req.nextUrl.pathname,
        method: req.method
      }
    );
    
    return NextResponse.json(
      { success: false, message: "Non autorisé" },
      { status: 403 }
    );
  };
}

/**
 * Adaptateur pour vérifier les permissions dans une API route
 */
export async function checkPermission(
  req: Request,
  entity: EntityType,
  permission: Permission,
  entityId?: string
): Promise<{ success: boolean; status: number; message?: string; userId?: string }> {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
    
  if (!session?.user) {
    return {
      success: false,
      status: 401,
      message: "Authentification requise"
    };
  }
  
  // Si c'est un admin, autoriser toutes les actions
  if (session.user.role === "admin") {
    return {
      success: true,
      status: 200,
      userId: session.user.id
    };
  }

  // Pour CREATE, autoriser si l'utilisateur est authentifié
  if (permission === Permission.CREATE) {
    return {
      success: true,
      status: 200,
      userId: session.user.id
    };
  }

  // Pour les autres opérations, vérifier la propriété si nous avons un ID
  if (entityId) {
    const isOwner = await checkOwnership({
      entity,
      entityId,
      userId: session.user.id
    });
    
    if (isOwner) {
      return {
        success: true,
        status: 200,
        userId: session.user.id
      };
    }
  }
  
  return {
    success: false,
    status: 403,
    message: "Non autorisé pour cette opération"
  };
} 