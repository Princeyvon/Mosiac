// Robust persistent storage layer using IndexedDB with fallback to localStorage
// This prevents QuotaExceededError when storing product photos, cutouts, and catalog data.

const DB_NAME = 'MosiacStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'studio_store';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[PersistentStorage] IndexedDB open error, using localStorage fallback');
          resolve(null);
        };
        req.onblocked = () => {
          console.warn('[PersistentStorage] IndexedDB blocked');
          resolve(null);
        };
      } catch (e) {
        console.warn('[PersistentStorage] Failed to initialize IndexedDB:', e);
        resolve(null);
      }
    });
  }

  return dbPromise;
}

/**
 * Synchronous read from localStorage for instant initial render
 */
export function getPersistentItemSync<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Asynchronous read from IndexedDB, falling back to localStorage
 */
export async function getPersistentItem<T>(key: string, fallback: T): Promise<T> {
  if (typeof window === 'undefined') return fallback;

  try {
    const db = await getIDB();
    if (db) {
      const val = await new Promise<T | undefined>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      });

      if (val !== undefined && val !== null) {
        return val;
      }
    }
  } catch (err) {
    console.warn(`[PersistentStorage] Read error for ${key}:`, err);
  }

  return getPersistentItemSync(key, fallback);
}

/**
 * Persist to both localStorage and IndexedDB
 */
export async function setPersistentItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Try writing to localStorage for instant synchronous reads
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // If quota exceeded or disabled, localStorage will throw.
    // That is okay because IndexedDB handles large payloads!
    console.warn(`[PersistentStorage] localStorage.setItem failed for ${key} (likely quota limit), proceeding with IndexedDB:`, err);
  }

  // 2. Write to IndexedDB for reliable high-capacity durable storage
  try {
    const db = await getIDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(value, key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) {
          reject(e);
        }
      });
    }
  } catch (err) {
    console.warn(`[PersistentStorage] IndexedDB write error for ${key}:`, err);
  }
}
