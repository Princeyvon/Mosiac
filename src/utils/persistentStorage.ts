// Robust persistent storage layer using IndexedDB with fallback to localStorage
// Provides timestamp-aware synchronization, automatic legacy key migration, and quota protection.

const DB_NAME = 'MosiacStudioDB';
const DB_VERSION = 2; // Incremented for schema stability
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
          console.warn('[PersistentStorage] IndexedDB open error, falling back to localStorage');
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

// Known legacy keys to migrate and clean up
const LEGACY_PRODUCT_KEYS: Record<string, string[]> = {
  'mosiac_live_products_v4': [
    'mosiac_live_products_v4',
    'mosiac_live_products_v3',
    'mosiac_live_products_v2',
    'mosiac_live_products_v1',
    'mosiac_live_products',
    'forma_live_products',
    'forma_products'
  ],
  'mosiac_staged_products_v4': [
    'mosiac_staged_products_v4',
    'mosiac_staged_products_v3',
    'mosiac_staged_products_v2',
    'mosiac_staged_products_v1',
    'mosiac_staged_products',
    'forma_staged_products'
  ]
};

// Self-executing legacy cleanup & quota reclaim in browser
if (typeof window !== 'undefined') {
  try {
    // Clean up older keys that waste quota once data is safe
    Object.entries(LEGACY_PRODUCT_KEYS).forEach(([targetKey, candidateKeys]) => {
      const currentVal = localStorage.getItem(targetKey);
      if (!currentVal) {
        for (const candidate of candidateKeys) {
          if (candidate === targetKey) continue;
          const legacyData = localStorage.getItem(candidate);
          if (legacyData) {
            try {
              const parsed = JSON.parse(legacyData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                localStorage.setItem(targetKey, legacyData);
                break;
              }
            } catch {}
          }
        }
      }
      // Remove stale candidate keys (except current active key)
      candidateKeys.forEach(candidate => {
        if (candidate !== targetKey) {
          try {
            localStorage.removeItem(candidate);
          } catch {}
        }
      });
    });
  } catch (err) {
    console.warn('[PersistentStorage] Legacy storage cleanup warning:', err);
  }
}

/**
 * Helper to get max timestamp from an item or array of items
 */
function getCollectionMaxTimestamp(val: any): number {
  if (!val) return 0;
  if (Array.isArray(val)) {
    let max = 0;
    for (const item of val) {
      if (item && typeof item === 'object' && typeof item.updatedAt === 'number') {
        if (item.updatedAt > max) max = item.updatedAt;
      }
    }
    return max;
  }
  if (typeof val === 'object' && typeof val.updatedAt === 'number') {
    return val.updatedAt;
  }
  return 0;
}

/**
 * Synchronous read from localStorage for instant initial render
 */
export function getPersistentItemSync<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    let raw = localStorage.getItem(key);
    // If not found, check legacy keys if registered
    if (!raw && LEGACY_PRODUCT_KEYS[key]) {
      for (const legKey of LEGACY_PRODUCT_KEYS[key]) {
        raw = localStorage.getItem(legKey);
        if (raw) break;
      }
    }
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Synchronous write to localStorage with instant persistence & quota resilience
 */
export function setPersistentItemSync<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(key + '_time', String(now));
  } catch (err) {
    try {
      const safeCopy = createStorageSafeCopy(value);
      localStorage.setItem(key, JSON.stringify(safeCopy));
      localStorage.setItem(key + '_time', String(now));
    } catch {
      console.warn(`[PersistentStorage] localStorage exhausted for ${key}`);
    }
  }
}

/**
 * Asynchronous read from IndexedDB with timestamp-aware conflict resolution.
 * Never overwrites newer local modifications with stale database entries.
 */
export async function getPersistentItem<T>(key: string, fallback: T): Promise<T> {
  if (typeof window === 'undefined') return fallback;

  // 1. Read local state
  const localVal = getPersistentItemSync(key, fallback);
  let localTime = 0;
  try {
    const rawTime = localStorage.getItem(key + '_time');
    if (rawTime) localTime = parseInt(rawTime, 10) || 0;
  } catch {}
  const localItemsMaxTime = getCollectionMaxTimestamp(localVal);
  const effectiveLocalTime = Math.max(localTime, localItemsMaxTime);

  // 2. Read IndexedDB state
  try {
    const db = await getIDB();
    if (db) {
      const [idbVal, idbTime] = await Promise.all([
        new Promise<T | undefined>((resolve) => {
          try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(undefined);
          } catch {
            resolve(undefined);
          }
        }),
        new Promise<number>((resolve) => {
          try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key + '_time');
            req.onsuccess = () => resolve(typeof req.result === 'number' ? req.result : 0);
            req.onerror = () => resolve(0);
          } catch {
            resolve(0);
          }
        })
      ]);

      if (idbVal !== undefined && idbVal !== null) {
        const idbItemsMaxTime = getCollectionMaxTimestamp(idbVal);
        const effectiveIdbTime = Math.max(idbTime || 0, idbItemsMaxTime);

        // If local data exists and is newer or equal, preserve local data and update IndexedDB
        if (localVal !== fallback && localVal !== null && effectiveLocalTime >= effectiveIdbTime) {
          // Catch up IndexedDB in background
          try {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(localVal, key);
            store.put(effectiveLocalTime, key + '_time');
          } catch {}
          return localVal;
        }

        // If IndexedDB is strictly newer, update localStorage and return IndexedDB data
        if (effectiveIdbTime > effectiveLocalTime) {
          setPersistentItemSync(key, idbVal);
          return idbVal;
        }

        return idbVal;
      }
    }
  } catch (err) {
    console.warn(`[PersistentStorage] Read error for ${key}:`, err);
  }

  return localVal;
}

/**
 * Helper to produce a lightweight version for localStorage if quota is reached
 */
function createStorageSafeCopy(val: any): any {
  if (!val) return val;
  try {
    if (Array.isArray(val)) {
      return val.map(item => {
        if (typeof item === 'object' && item !== null) {
          const clone = { ...item };
          // If images are giant data URLs (>25KB), use placeholder or truncate for localStorage
          if (typeof clone.cardImage === 'string' && clone.cardImage.startsWith('data:') && clone.cardImage.length > 25000) {
            clone.cardImage = 'images/uzu-slate-bronze.jpg';
          }
          if (typeof clone.hoverImage === 'string' && clone.hoverImage.startsWith('data:') && clone.hoverImage.length > 25000) {
            clone.hoverImage = 'images/uzu-ivory-bronze.jpg';
          }
          if (Array.isArray(clone.galleryImages)) {
            clone.galleryImages = clone.galleryImages.map((img: any) =>
              typeof img === 'string' && img.startsWith('data:') && img.length > 25000
                ? 'images/uzu-slate-bronze.jpg'
                : img
            );
          }
          return clone;
        }
        return item;
      });
    }
    return val;
  } catch {
    return val;
  }
}

/**
 * Persist immediately to localStorage (synchronous) and asynchronously to IndexedDB.
 */
export async function setPersistentItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  const now = Date.now();

  // 1. Instant synchronous write to localStorage
  setPersistentItemSync(key, value);

  // 2. Asynchronous write to IndexedDB
  try {
    const db = await getIDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(value, key);
          store.put(now, key + '_time');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        } catch (e) {
          reject(e);
        }
      });
    }
  } catch (err) {
    console.warn(`[PersistentStorage] IndexedDB write error for ${key}:`, err);
  }
}
