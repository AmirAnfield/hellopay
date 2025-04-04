import { NextResponse } from 'next/server';

export async function GET() {
  // Cette API n'est plus utilisée.
  // Les données sont récupérées directement dans le composant depuis Firebase.
  return NextResponse.json({
    success: false,
    message: "Cette API n'est plus utilisée. Les données sont récupérées directement dans le composant."
  });
} 