import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useFirebaseInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setIsInitialized(true);
        setError(null);
      },
      (error) => {
        console.error('Firebase Auth Error:', error);
        setError(error);
      }
    );

    return () => unsubscribe();
  }, []);

  return { isInitialized, error };
}; 