import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from '@/lib/firebase';

export const useFirebaseCloudMessaging = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [message, setMessage] = useState<any>(null);

  useEffect(() => {
    const initMessaging = async () => {
      try {
        const messaging = getMessaging(auth.app);
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        setToken(currentToken);

        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
          setMessage(payload);
        });

        return () => {
          unsubscribe();
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Cloud Messaging'));
      } finally {
        setLoading(false);
      }
    };

    initMessaging();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to request notification permission'));
      return false;
    }
  };

  const subscribeToTopic = async (topic: string): Promise<void> => {
    try {
      const messaging = getMessaging(auth.app);
      await messaging.subscribeToTopic(topic);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to subscribe to topic: ${topic}`));
    }
  };

  const unsubscribeFromTopic = async (topic: string): Promise<void> => {
    try {
      const messaging = getMessaging(auth.app);
      await messaging.unsubscribeFromTopic(topic);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to unsubscribe from topic: ${topic}`));
    }
  };

  return {
    token,
    loading,
    error,
    message,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic
  };
}; 