/**
 * A performant cache utility using IndexedDB for storing and retrieving data
 * This helps reduce Firebase reads and improves application responsiveness
 */

const DB_NAME = 'app_performance_cache';
const DB_VERSION = 1;
const STORES = {
  DATA: 'cachedData',
  ASSETS: 'assets',
  UI_STATE: 'uiState'
};

let dbPromise: Promise<IDBDatabase> | null = null;

// Initialize database
const initDB = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.warn('Error opening cache database');
        reject(new Error('Could not open cache database'));
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.DATA)) {
          db.createObjectStore(STORES.DATA, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORES.ASSETS)) {
          db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORES.UI_STATE)) {
          db.createObjectStore(STORES.UI_STATE, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });
  }
  
  return dbPromise;
};

// Cache response data with TTL (time to live)
export const cacheData = async (
  key: string, 
  data: unknown, 
  ttlMinutes = 5
): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.DATA, 'readwrite');
    const store = tx.objectStore(STORES.DATA);
    
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
    
    store.put({
      id: key,
      data,
      expiresAt
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
};

// Get cached data if not expired
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.DATA, 'readonly');
    const store = tx.objectStore(STORES.DATA);
    
    const result = await new Promise<{ id: string; data: T; expiresAt: number } | undefined>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (!result) return null;
    
    // Check if data is expired
    if (result.expiresAt < Date.now()) {
      // Data expired, delete it and return null
      const deleteTx = db.transaction(STORES.DATA, 'readwrite');
      const deleteStore = deleteTx.objectStore(STORES.DATA);
      deleteStore.delete(key);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.warn('Failed to retrieve cached data:', error);
    return null;
  }
};

// Cache UI state for faster startup
export const cacheUIState = async (key: string, state: unknown): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.UI_STATE, 'readwrite');
    const store = tx.objectStore(STORES.UI_STATE);
    
    store.put({
      id: key,
      data: state,
      timestamp: Date.now()
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to cache UI state:', error);
  }
};

// Get cached UI state
export const getCachedUIState = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.UI_STATE, 'readonly');
    const store = tx.objectStore(STORES.UI_STATE);
    
    const result = await new Promise<{ id: string; data: T; timestamp: number } | undefined>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (!result) return null;
    return result.data;
  } catch (error) {
    console.warn('Failed to retrieve cached UI state:', error);
    return null;
  }
};

// Cache binary assets like images
export const cacheAsset = async (key: string, data: Blob | ArrayBuffer): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ASSETS, 'readwrite');
    const store = tx.objectStore(STORES.ASSETS);
    
    store.put({
      id: key,
      data,
      timestamp: Date.now()
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to cache asset:', error);
  }
};

// Get cached binary asset
export const getCachedAsset = async (key: string): Promise<Blob | ArrayBuffer | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.ASSETS, 'readonly');
    const store = tx.objectStore(STORES.ASSETS);
    
    const result = await new Promise<{ id: string; data: Blob | ArrayBuffer; timestamp: number } | undefined>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (!result) return null;
    return result.data;
  } catch (error) {
    console.warn('Failed to retrieve cached asset:', error);
    return null;
  }
};

// Clear all expired cache entries to free up space
export const clearExpiredCache = async (): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.DATA, 'readwrite');
    const store = tx.objectStore(STORES.DATA);
    
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      
      if (cursor) {
        const { expiresAt, id } = cursor.value;
        
        if (expiresAt < Date.now()) {
          store.delete(id);
        }
        
        cursor.continue();
      }
    };
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
};

// Performance monitor - track and log cache hits/misses
const cacheStats = {
  hits: 0,
  misses: 0,
  getHitRate: () => {
    const total = cacheStats.hits + cacheStats.misses;
    return total > 0 ? (cacheStats.hits / total) * 100 : 0;
  }
};

// Get cached data with stats tracking
export const getCachedDataWithStats = async <T>(key: string): Promise<T | null> => {
  const data = await getCachedData<T>(key);
  
  if (data) {
    cacheStats.hits++;
  } else {
    cacheStats.misses++;
  }
  
  return data;
};

// Get current cache statistics
export const getCacheStats = () => ({
  ...cacheStats,
  hitRate: `${cacheStats.getHitRate().toFixed(2)}%`
}); 