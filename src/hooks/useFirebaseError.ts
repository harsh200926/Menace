import { useState, useEffect } from 'react';
import { getCrashlytics, log } from 'firebase/crashlytics';
import { auth } from '@/lib/firebase';

export const useFirebaseError = () => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error, context?: Record<string, unknown>): void => {
    try {
      const crashlytics = getCrashlytics(auth.app);
      log(crashlytics, error.message);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          log(crashlytics, `${key}: ${JSON.stringify(value)}`);
        });
      }

      setError(error);
    } catch (err) {
      console.error('Failed to log error to Crashlytics:', err);
      setError(error);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      handleError(event.reason, { type: 'unhandledRejection' });
    };

    const handleError = (event: ErrorEvent): void => {
      handleError(event.error, { type: 'runtimeError' });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}; 