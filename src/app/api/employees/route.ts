import { NextResponse } from 'next/server';

export async function GET() {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // Dans un environnement serveur, nous n'avons pas accès au localStorage
    // Cette solution est temporaire pour la démonstration 
    // En production, nous utiliserions une vraie base de données
    
    // Renvoyer une réponse avec un tableau vide qui sera remplacé par les données du côté client
    return NextResponse.json({ 
      employees: [] 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les données des employés" },
      { status: 500 }
    );
  }
} 