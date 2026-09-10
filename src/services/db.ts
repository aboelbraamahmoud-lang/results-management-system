import type { AppSettings, ImportBatch, ResultRecord } from '../types';
import { defaultSettings } from '../utils/calculations';

const DB_NAME = 'results-manager-db';
const DB_VERSION = 1;
const RESULTS_STORE = 'results';
const SETTINGS_STORE = 'settings';
const BATCHES_STORE = 'batches';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RESULTS_STORE)) {
        const store = db.createObjectStore(RESULTS_STORE, { keyPath: 'id' });
        store.createIndex('studentName', 'studentName');
        store.createIndex('subject', 'subject');
        store.createIndex('grade', 'grade');
        store.createIndex('teacher', 'teacher');
        store.createIndex('examName', 'examName');
        store.createIndex('importBatchId', 'importBatchId');
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) db.createObjectStore(SETTINGS_STORE);
      if (!db.objectStoreNames.contains(BATCHES_STORE)) db.createObjectStore(BATCHES_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getResults() {
  return getAll<ResultRecord>(RESULTS_STORE);
}

export async function putResults(records: ResultRecord[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(RESULTS_STORE, 'readwrite');
    const store = tx.objectStore(RESULTS_STORE);
    records.forEach((r) => store.put(r));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearResults() {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(RESULTS_STORE, 'readwrite');
    tx.objectStore(RESULTS_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteBatch(batchId: string) {
  const db = await openDb();
  const records = await getResults();
  const targets = records.filter((r) => r.importBatchId === batchId);
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([RESULTS_STORE, BATCHES_STORE], 'readwrite');
    const store = tx.objectStore(RESULTS_STORE);
    targets.forEach((r) => store.delete(r.id));
    tx.objectStore(BATCHES_STORE).delete(batchId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readonly');
    const req = tx.objectStore(SETTINGS_STORE).get('app');
    req.onsuccess = () => resolve((req.result as AppSettings) || defaultSettings);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSettings(settings: AppSettings) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    tx.objectStore(SETTINGS_STORE).put(settings, 'app');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBatches() {
  return getAll<ImportBatch>(BATCHES_STORE);
}

export async function putBatch(batch: ImportBatch) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(BATCHES_STORE, 'readwrite');
    tx.objectStore(BATCHES_STORE).put(batch);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
