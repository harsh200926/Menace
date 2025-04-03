import { useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

export const useFirebaseSecurity = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const checkPermission = async (path: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const database = getDatabase(auth.app);
      const databaseRef = ref(database, path);
      const snapshot = await get(databaseRef);
      return snapshot.exists();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to check permission at path: ${path}`);
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateUserAccess = async (userId: string, resourcePath: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      const userRoles = userData.roles || [];
      const resourceRoles = userData.resourceAccess?.[resourcePath] || [];

      return userRoles.some((role: string) => resourceRoles.includes(role));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to validate user access for path: ${resourcePath}`);
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkRoleAccess = async (userId: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      const userRoles = userData.roles || [];
      return userRoles.includes(role);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to check role access for role: ${role}`);
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    checkPermission,
    validateUserAccess,
    checkRoleAccess
  };
}; 