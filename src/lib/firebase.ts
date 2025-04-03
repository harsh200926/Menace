// Import the Firebase SDK components
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { getMessaging } from 'firebase/messaging';
import { getRemoteConfig } from 'firebase/remote-config';
import { getPerformance } from 'firebase/performance';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
// Import analytics conditionally to prevent loading if it might be blocked
const analyticsModules = async () => {
  if (typeof window !== 'undefined') {
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      return { getAnalytics, isSupported };
    } catch (error) {
      console.warn('Analytics import failed (non-critical):', error);
      return { getAnalytics: null, isSupported: null };
    }
  }
  return { getAnalytics: null, isSupported: null };
};
import { useState, useEffect } from 'react';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxUsWp88RctiDnbErc4WMrk4ZRnXQL9ZA",
  authDomain: "streaky-2a396.firebaseapp.com",
  databaseURL: "https://streaky-2a396-default-rtdb.firebaseio.com",
  projectId: "streaky-2a396",
  storageBucket: "streaky-2a396.firebasestorage.app",
  messagingSenderId: "206387684279",
  appId: "1:206387684279:web:20da9005c4af10c9257e32",
  measurementId: "G-6ZLM43N3Q3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export let analytics = null;
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export let messaging = null;
export const remoteConfig = getRemoteConfig(app);
export const performance = getPerformance(app);

// Initialize Analytics only in browser and handle blocking gracefully
if (typeof window !== 'undefined') {
  // Initialize Analytics asynchronously
  import('firebase/analytics').then(({ getAnalytics }) => {
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } catch (error) {
      console.warn('Firebase Analytics initialization failed (non-critical):', error);
    }
  }).catch(error => {
    console.warn('Firebase Analytics module load failed (non-critical):', error);
  });

  // Initialize Messaging asynchronously
  import('firebase/messaging').then(({ getMessaging }) => {
    try {
      messaging = getMessaging(app);
      console.log('Firebase Cloud Messaging initialized successfully');
    } catch (error) {
      console.warn('Firebase Cloud Messaging initialization failed (non-critical):', error);
    }
  }).catch(error => {
    console.warn('Firebase Cloud Messaging module load failed (non-critical):', error);
  });

  // Initialize App Check with reCAPTCHA v3
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'dummy-key'),
      isTokenAutoRefreshEnabled: true
    });
    console.log('Firebase App Check initialized successfully');
  } catch (error) {
    console.warn('Firebase App Check initialization failed (non-critical):', error);
  }
}

// Configure Remote Config with defaults
try {
  remoteConfig.defaultConfig = {
    minimumFetchIntervalMillis: 3600000 // 1 hour
  };
  console.log('Firebase Remote Config initialized successfully');
} catch (error) {
  console.warn('Firebase Remote Config initialization failed (non-critical):', error);
}

// Export types
export type FirebaseApp = typeof app;
export type FirebaseAuth = typeof auth;
export type FirebaseFirestore = typeof db;
export type FirebaseDatabase = typeof rtdb;
export type FirebaseStorage = typeof storage;
export type FirebaseFunctions = typeof functions;
export type FirebaseMessaging = typeof messaging;
export type FirebaseRemoteConfig = typeof remoteConfig;
export type FirebasePerformance = typeof performance;

// Custom hook to handle auth state
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return { currentUser, loading };
}

export default app; 