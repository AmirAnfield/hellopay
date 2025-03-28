import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement pour Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase sont manquantes.');
}

// Création du client Supabase
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Helper pour obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
  
  return {
    ...session.user,
    ...data,
  };
};

// Helper pour gérer les mises à jour du profil utilisateur
export const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    throw error;
  }
  
  return data;
};

export default supabase; 