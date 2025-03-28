import { supabase } from '../../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export interface ContractData {
  id?: string;
  userId: string;
  employeeName: string;
  employeeId?: string;
  position: string;
  contractType: string;
  contractStartDate: string;
  contractEndDate?: string;
  baseSalary: number;
  weeklyHours: number;
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StorageFile {
  name: string;
  [key: string]: any;
}

export class ContractService {
  /**
   * Crée un nouveau contrat dans Supabase
   */
  static async createContract(contractData: ContractData, pdfFile?: File): Promise<{ data: ContractData | null; error: any }> {
    try {
      const userId = contractData.userId;
      const id = contractData.id || uuidv4();
      let pdfUrl = contractData.pdfUrl;
      
      // Upload du PDF si disponible
      if (pdfFile) {
        const fileName = `${userId}/${id}/${pdfFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(fileName, pdfFile, {
            contentType: 'application/pdf',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error(`Erreur lors de l'upload du PDF: ${uploadError.message}`);
        }
        
        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('contracts')
          .getPublicUrl(fileName);
          
        pdfUrl = urlData.publicUrl;
      }
      
      // Création du contrat dans la base
      const newContract: ContractData = {
        ...contractData,
        id,
        pdfUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('contracts')
        .insert(newContract)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Récupère tous les contrats d'un utilisateur
   */
  static async getContractsByUserId(userId: string): Promise<{ data: ContractData[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Récupère un contrat par son ID
   */
  static async getContractById(id: string): Promise<{ data: ContractData | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Met à jour un contrat existant
   */
  static async updateContract(id: string, contractData: Partial<ContractData>, pdfFile?: File): Promise<{ data: ContractData | null; error: any }> {
    try {
      const { data: existingContract } = await this.getContractById(id);
      
      if (!existingContract) {
        throw new Error('Contrat non trouvé');
      }
      
      // Vérifier que l'utilisateur est bien le propriétaire
      if (contractData.userId && existingContract.userId !== contractData.userId) {
        throw new Error('Non autorisé à modifier ce contrat');
      }
      
      let pdfUrl = contractData.pdfUrl || existingContract.pdfUrl;
      
      // Upload du nouveau PDF si disponible
      if (pdfFile) {
        const fileName = `${existingContract.userId}/${id}/${pdfFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(fileName, pdfFile, {
            contentType: 'application/pdf',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error(`Erreur lors de l'upload du PDF: ${uploadError.message}`);
        }
        
        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('contracts')
          .getPublicUrl(fileName);
          
        pdfUrl = urlData.publicUrl;
      }
      
      // Mise à jour du contrat
      const updatedContract = {
        ...contractData,
        pdfUrl,
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('contracts')
        .update(updatedContract)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Supprime un contrat et son PDF associé
   */
  static async deleteContract(id: string, userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Vérifier que le contrat existe et appartient à l'utilisateur
      const { data: contract } = await this.getContractById(id);
      
      if (!contract) {
        throw new Error('Contrat non trouvé');
      }
      
      if (contract.userId !== userId) {
        throw new Error('Non autorisé à supprimer ce contrat');
      }
      
      // Supprimer le PDF du stockage si présent
      if (contract.pdfUrl) {
        const pdfPath = `${userId}/${id}`;
        const { data: listData } = await supabase.storage
          .from('contracts')
          .list(pdfPath);
          
        if (listData && listData.length > 0) {
          await supabase.storage
            .from('contracts')
            .remove(listData.map((file: StorageFile) => `${pdfPath}/${file.name}`));
        }
      }
      
      // Supprimer le contrat de la base
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Obtenir des statistiques sur les contrats d'un utilisateur
   */
  static async getContractStats(userId: string): Promise<{ total: number; byType: Record<string, number>; error: any }> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('contractType')
        .eq('userId', userId);
        
      if (error) {
        throw error;
      }
      
      const total = data.length;
      const byType: Record<string, number> = {};
      
      data.forEach((contract: { contractType: string }) => {
        const type = contract.contractType || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });
      
      return { total, byType, error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { total: 0, byType: {}, error };
    }
  }
} 