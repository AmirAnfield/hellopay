import { auth, db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, serverTimestamp, FieldValue } from 'firebase/firestore';
import { Company } from './company-service';

// Interface pour les favoris
export interface FavoriteItem {
  id: string;
  itemId: string;
  itemType: 'company' | 'employee' | 'contract'; // Types possibles d'éléments favoris
  name: string;
  createdAt: FieldValue | Date;
  userId: string;
}

/**
 * Récupère tous les favoris de l'utilisateur courant
 * @param type Type d'élément à récupérer (optionnel)
 */
export async function getFavorites(type?: 'company' | 'employee' | 'contract'): Promise<FavoriteItem[]> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    const favoritesRef = collection(db, `users/${userId}/favorites`);
    
    // Si un type est spécifié, filtrer les résultats
    let querySnapshot;
    if (type) {
      const favoritesQuery = query(favoritesRef, where('itemType', '==', type));
      querySnapshot = await getDocs(favoritesQuery);
    } else {
      querySnapshot = await getDocs(favoritesRef);
    }
    
    const favorites: FavoriteItem[] = [];
    querySnapshot.forEach((doc) => {
      favorites.push({ id: doc.id, ...doc.data() } as FavoriteItem);
    });
    
    return favorites;
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    throw new Error("Impossible de récupérer vos favoris. Veuillez réessayer.");
  }
}

/**
 * Vérifie si un élément est dans les favoris
 * @param itemId ID de l'élément à vérifier
 * @param itemType Type de l'élément
 */
export async function isFavorite(itemId: string, itemType: 'company' | 'employee' | 'contract'): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    const favoritesRef = collection(db, `users/${userId}/favorites`);
    const favoriteQuery = query(
      favoritesRef,
      where('itemId', '==', itemId),
      where('itemType', '==', itemType)
    );
    
    const querySnapshot = await getDocs(favoriteQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Erreur lors de la vérification du favori:", error);
    return false;
  }
}

/**
 * Ajoute une entreprise aux favoris
 * @param company L'entreprise à ajouter aux favoris
 */
export async function addCompanyToFavorites(company: Company): Promise<string> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    
    // Préparer les données du favori
    const favoriteData: Omit<FavoriteItem, 'id'> = {
      itemId: company.id,
      itemType: 'company',
      name: company.name,
      createdAt: serverTimestamp(),
      userId: userId
    };
    
    // Créer un document avec un ID personnalisé pour faciliter la suppression
    const favoriteId = `company_${company.id}`;
    const favoriteRef = doc(db, `users/${userId}/favorites`, favoriteId);
    await setDoc(favoriteRef, favoriteData);
    
    console.log("Entreprise ajoutée aux favoris:", favoriteId);
    return favoriteId;
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    throw new Error("Impossible d'ajouter l'entreprise aux favoris. Veuillez réessayer.");
  }
}

/**
 * Supprime une entreprise des favoris
 * @param companyId ID de l'entreprise à supprimer des favoris
 */
export async function removeCompanyFromFavorites(companyId: string): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = auth.currentUser.uid;
    
    // Supprimer le document
    const favoriteId = `company_${companyId}`;
    const favoriteRef = doc(db, `users/${userId}/favorites`, favoriteId);
    await deleteDoc(favoriteRef);
    
    console.log("Entreprise supprimée des favoris:", favoriteId);
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
    throw new Error("Impossible de supprimer l'entreprise des favoris. Veuillez réessayer.");
  }
}

/**
 * Bascule le statut de favori d'une entreprise (ajouter si absent, supprimer si présent)
 * @param company L'entreprise à basculer
 */
export async function toggleCompanyFavorite(company: Company): Promise<boolean> {
  try {
    const isFav = await isFavorite(company.id, 'company');
    
    if (isFav) {
      await removeCompanyFromFavorites(company.id);
      return false;
    } else {
      await addCompanyToFavorites(company);
      return true;
    }
  } catch (error) {
    console.error("Erreur lors du basculement du favori:", error);
    throw new Error("Impossible de mettre à jour le statut de favori. Veuillez réessayer.");
  }
} 