import { useState, useEffect } from 'react';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { auth } from '@/lib/firebase';

export const useFirebaseAppCheck = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initAppCheck = async () => {
      try {
        // Initialize App Check with reCAPTCHA v3
        initializeAppCheck(auth.app, {
          provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
          isTokenAutoRefreshEnabled: true
        });
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize App Check'));
      }
    };

    initAppCheck();
  }, []);

  return {
    isInitialized,
    error
  };
}; 