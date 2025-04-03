import { useState } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { auth } from '@/lib/firebase';

export const useFirebaseFirestore = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const getDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to get document: ${documentId}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDocuments = async <T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to get documents from: ${collectionName}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: T
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to set document: ${documentId}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async <T = DocumentData>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, data as any);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update document: ${documentId}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (collectionName: string, documentId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(auth.app);
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete document: ${documentId}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToCollection = <T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    callback: (data: T[]) => void
  ): (() => void) => {
    try {
      const db = getFirestore(auth.app);
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        callback(data);
      });
      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to subscribe to collection: ${collectionName}`));
      return () => {};
    }
  };

  const subscribeToDocument = <T = DocumentData>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void
  ): (() => void) => {
    try {
      const db = getFirestore(auth.app);
      const docRef = doc(db, collectionName, documentId);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        callback(doc.exists() ? (doc.data() as T) : null);
      });
      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to subscribe to document: ${documentId}`));
      return () => {};
    }
  };

  return {
    error,
    loading,
    getDocument,
    getDocuments,
    setDocument,
    updateDocument,
    deleteDocument,
    subscribeToCollection,
    subscribeToDocument
  };
}; 