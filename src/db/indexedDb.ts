// IndexedDB types are used implicitly through generic functions

const DB_NAME = 'twinfit_db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  WORKOUT_SESSIONS: 'workoutSessions',
  SET_LOGS: 'setLogs',
  NUTRITION_LOGS: 'nutritionLogs',
  BODY_LOGS: 'bodyLogs',
  WEEKLY_CHECKINS: 'weeklyCheckins',
  LEADERBOARD_SCORES: 'leaderboardScores',
  BACKUPS: 'backups',
} as const;

let db: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Workout Sessions store
      if (!database.objectStoreNames.contains(STORES.WORKOUT_SESSIONS)) {
        const sessionStore = database.createObjectStore(STORES.WORKOUT_SESSIONS, {
          keyPath: 'id',
        });
        sessionStore.createIndex('profileId', 'profileId', { unique: false });
        sessionStore.createIndex('workoutPlanId', 'workoutPlanId', { unique: false });
        sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
        sessionStore.createIndex('status', 'status', { unique: false });
      }

      // Set Logs store
      if (!database.objectStoreNames.contains(STORES.SET_LOGS)) {
        const setLogStore = database.createObjectStore(STORES.SET_LOGS, {
          keyPath: 'id',
        });
        setLogStore.createIndex('sessionId', 'sessionId', { unique: false });
        setLogStore.createIndex('profileId', 'profileId', { unique: false });
        setLogStore.createIndex('exerciseId', 'exerciseId', { unique: false });
        setLogStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Nutrition Logs store
      if (!database.objectStoreNames.contains(STORES.NUTRITION_LOGS)) {
        const nutritionStore = database.createObjectStore(STORES.NUTRITION_LOGS, {
          keyPath: 'id',
        });
        nutritionStore.createIndex('profileId', 'profileId', { unique: false });
        nutritionStore.createIndex('date', 'date', { unique: false });
      }

      // Body Logs store
      if (!database.objectStoreNames.contains(STORES.BODY_LOGS)) {
        const bodyStore = database.createObjectStore(STORES.BODY_LOGS, {
          keyPath: 'id',
        });
        bodyStore.createIndex('profileId', 'profileId', { unique: false });
        bodyStore.createIndex('date', 'date', { unique: false });
      }

      // Weekly Checkins store
      if (!database.objectStoreNames.contains(STORES.WEEKLY_CHECKINS)) {
        const checkinStore = database.createObjectStore(STORES.WEEKLY_CHECKINS, {
          keyPath: 'id',
        });
        checkinStore.createIndex('profileId', 'profileId', { unique: false });
        checkinStore.createIndex('weekStartDate', 'weekStartDate', { unique: false });
      }

      // Leaderboard Scores store
      if (!database.objectStoreNames.contains(STORES.LEADERBOARD_SCORES)) {
        const scoreStore = database.createObjectStore(STORES.LEADERBOARD_SCORES, {
          keyPath: 'id',
        });
        scoreStore.createIndex('profileId', 'profileId', { unique: false });
        scoreStore.createIndex('weekStartDate', 'weekStartDate', { unique: false });
      }

      // Backups store
      if (!database.objectStoreNames.contains(STORES.BACKUPS)) {
        database.createObjectStore(STORES.BACKUPS, { keyPath: 'id' });
      }
    };
  });
}

export async function closeDB(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}

export async function clearStore(storeName: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDB(): Promise<void> {
  await closeDB();
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database deletion blocked'));
  });
}

// Generic CRUD operations
export async function add<T>(storeName: string, item: T): Promise<T> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function put<T>(storeName: string, item: T): Promise<T> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function get<T>(storeName: string, id: string): Promise<T | undefined> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(storeName: string, id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllData(): Promise<void> {
  const stores = Object.values(STORES);
  for (const store of stores) {
    await clearStore(store);
  }
}
