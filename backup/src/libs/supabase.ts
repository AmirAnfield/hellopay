import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase avec les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Storage features will not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Nom du bucket pour les fiches de paie
export const PAYSLIPS_BUCKET = 'payslips';

// Service pour gérer le stockage des fiches de paie
export class StorageService {
  /**
   * Upload d'un fichier PDF dans Supabase Storage
   */
  static async uploadPayslipPdf(userId: string, fileName: string, file: Blob): Promise<string> {
    // Format du path: payslips/{userId}/{fileName}
    const filePath = `${userId}/${fileName}`;

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(PAYSLIPS_BUCKET)
      .upload(filePath, file, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('Erreur lors de l\'upload du fichier :', error);
      throw new Error('Erreur lors de l\'upload du fichier');
    }

    // Récupération de l'URL publique
    const { data: urlData } = supabase.storage
      .from(PAYSLIPS_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Récupération des fichiers PDF d'un utilisateur
   */
  static async getUserPayslips(userId: string): Promise<{ name: string; url: string; createdAt: string }[]> {
    const { data, error } = await supabase.storage
      .from(PAYSLIPS_BUCKET)
      .list(userId);

    if (error) {
      console.error('Erreur lors de la récupération des fichiers :', error);
      throw new Error('Erreur lors de la récupération des fichiers');
    }

    return data.map(file => ({
      name: file.name,
      url: supabase.storage.from(PAYSLIPS_BUCKET).getPublicUrl(`${userId}/${file.name}`).data.publicUrl,
      createdAt: file.created_at,
    }));
  }

  /**
   * Suppression d'un fichier PDF
   */
  static async deletePayslipPdf(userId: string, fileName: string): Promise<void> {
    const { error } = await supabase.storage
      .from(PAYSLIPS_BUCKET)
      .remove([`${userId}/${fileName}`]);

    if (error) {
      console.error('Erreur lors de la suppression du fichier :', error);
      throw new Error('Erreur lors de la suppression du fichier');
    }
  }
} 