/**
 * @fileoverview Simple IndexedDB wrapper for storing large profile pictures.
 * IndexedDB is much better suited for large blobs than localStorage.
 */

const DB_NAME = 'smartscan_storage';
const STORE_NAME = 'profile_images';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setProfileImage(dataUrl: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(dataUrl, 'current_user_avatar');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getProfileImage(): Promise<string | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current_user_avatar');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProfileImage(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('current_user_avatar');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
