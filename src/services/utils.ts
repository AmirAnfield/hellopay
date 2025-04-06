/**
 * Nettoie un objet en supprimant les propriétés avec valeur undefined
 * pour éviter les erreurs Firestore
 */
export function cleanObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleaned = { ...obj } as { [key: string]: any };
  
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = cleanObject(cleaned[key]);
    }
  });
  
  return cleaned as T;
} 