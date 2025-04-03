import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, push, update, remove } from 'firebase/database';
import { auth } from '@/lib/firebase';

export const useFirebaseRealtimeDatabase = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const subscribeToPath = <T = any>(
    path: string,
    callback: (data: T | null) => void
  ): (() => void) => {
    try {
      const database = getDatabase(auth.app);
      const databaseRef = ref(database, path);
      const unsubscribe = onValue(databaseRef, (snapshot) => {
        callback(snapshot.val());
      });
      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to subscribe to path: ${path}`));
      return () => {};
    }
  };

  const setValue = async <T = any>(path: string, value: T): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const database = getDatabase(auth.app);
      const databaseRef = ref(database, path);
      await set(databaseRef, value);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to set value at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const pushValue = async <T = any>(path: string, value: T): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const database = getDatabase(auth.app);
      const databaseRef = ref(database, path);
      const newRef = await push(databaseRef, value);
      return newRef.key || '';
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to push value at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateValue = async (path: string, updates: Record<string, any>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const database = getDatabase(auth.app);
      const databaseRef = ref(database, path);
      await update(databaseRef, updates);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update value at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeValue = async (path: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const database = getDatabase(auth.app);
      const databaseRef = ref(database, path);
      await remove(databaseRef);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to remove value at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    subscribeToPath,
    setValue,
    pushValue,
    updateValue,
    removeValue
  };
}; 