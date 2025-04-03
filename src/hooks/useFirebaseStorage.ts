import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { auth } from '@/lib/firebase';

export const useFirebaseStorage = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (
    path: string,
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to upload file to path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete file at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listFiles = async (path: string): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      return result.items.map(item => item.fullPath);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to list files at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = async (path: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const storage = getStorage(auth.app);
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to get file URL at path: ${path}`);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    uploadFile,
    deleteFile,
    listFiles,
    getFileUrl
  };
}; 