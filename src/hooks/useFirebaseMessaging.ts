import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from '@/lib/firebase';

export const useFirebaseMessaging = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }

        // Get FCM token
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        setToken(currentToken);

        // Listen for token refresh
        messaging.onTokenRefresh(async () => {
          const newToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          setToken(newToken);
        });

        // Listen for messages
        onMessage(messaging, (payload) => {
          setNotification(payload);
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize messaging'));
      }
    };

    if (auth.currentUser) {
      requestPermission();
    }
  }, []);

  const subscribeToTopic = async (topic: string) => {
    try {
      const messaging = getMessaging();
      await messaging.subscribeToTopic(topic);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe to topic'));
      throw err;
    }
  };

  const unsubscribeFromTopic = async (topic: string) => {
    try {
      const messaging = getMessaging();
      await messaging.unsubscribeFromTopic(topic);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unsubscribe from topic'));
      throw err;
    }
  };

  return {
    token,
    error,
    notification,
    subscribeToTopic,
    unsubscribeFromTopic
  };
}; 