import { useEffect } from 'react';
import { getCrashlytics, log, setCustomKey, setUserId } from 'firebase/crashlytics';

export const useFirebaseCrashlytics = () => {
  useEffect(() => {
    const crashlytics = getCrashlytics();
    if (crashlytics) {
      // Set default keys
      setCustomKey(crashlytics, 'app_version', process.env.VITE_APP_VERSION || '1.0.0');
      setCustomKey(crashlytics, 'environment', process.env.NODE_ENV || 'development');
    }
  }, []);

  const logError = (error: Error, context?: Record<string, any>) => {
    const crashlytics = getCrashlytics();
    if (crashlytics) {
      log(crashlytics, error.message);
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          setCustomKey(crashlytics, key, value);
        });
      }
    }
  };

  const setUser = (userId: string) => {
    const crashlytics = getCrashlytics();
    if (crashlytics) {
      setUserId(crashlytics, userId);
    }
  };

  return {
    logError,
    setUser
  };
}; 