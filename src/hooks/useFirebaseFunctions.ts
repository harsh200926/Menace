import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/lib/firebase';

export const useFirebaseFunctions = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const callFunction = async <T = any, R = any>(
    functionName: string,
    data?: T
  ): Promise<R> => {
    try {
      setLoading(true);
      setError(null);
      const functions = getFunctions(auth.app);
      const callable = httpsCallable<T, R>(functions, functionName);
      const result = await callable(data);
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to call function: ${functionName}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    callFunction
  };
}; 