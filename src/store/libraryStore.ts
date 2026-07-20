import { createStore } from "zustand/vanilla";
import { v4 as uuidv4 } from "uuid";

export interface LibraryEntry {
  id: string;
  name: string;
  skinData: ArrayBuffer;
  isPocket: boolean;
  isDoubleRes?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface LibraryState {
  entries: LibraryEntry[];
  activeSkinId: string | null;
  isLoading: boolean;
}

interface LibraryActions {
  initialize: (
    db: IDBDatabase,
    reopen?: () => Promise<IDBDatabase>,
  ) => Promise<void>;
  addEntry: (entry: LibraryEntry) => Promise<void>;
  updateEntry: (id: string, updates: Partial<LibraryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setActiveSkin: (id: string) => void;
  getActiveEntry: () => LibraryEntry | null;
}

export type LibraryStore = LibraryState & LibraryActions;

const ACTIVE_SKIN_KEY = "mineskin_active_skin_id";

// The IndexedDB connection is shared, HMR-pinned state for the same reason as
// the store itself (see below): free functions like saveActiveSkinToLibrary
// get re-imported by hot-reloaded modules and must see the live connection,
// not a fresh null one.
interface LibraryDbConn {
  db: IDBDatabase | null;
  reopen: (() => Promise<IDBDatabase>) | null;
}
const conn: LibraryDbConn =
  process.env.NODE_ENV === "production"
    ? { db: null, reopen: null }
    : ((
        globalThis as unknown as { __mineskinLibraryDbConn?: LibraryDbConn }
      ).__mineskinLibraryDbConn ??= { db: null, reopen: null });

// Browsers (notably iOS Safari) force-close IndexedDB connections when a page
// is frozen / restored from the bfcache. A cached handle then throws
// "InvalidStateError: The database connection is closing." on the next
// transaction. Detect that the handle has died and drop it so it gets reopened.
function isConnectionClosedError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "InvalidStateError" ||
      err.name === "AbortError" ||
      err.name === "TransactionInactiveError")
  );
}

function attachLifecycle(db: IDBDatabase): IDBDatabase {
  // Don't block another tab that wants to upgrade the schema.
  db.onversionchange = () => {
    db.close();
    if (conn.db === db) conn.db = null;
  };
  // Fired when the connection is closed out from under us.
  db.onclose = () => {
    if (conn.db === db) conn.db = null;
  };
  return db;
}

async function getLiveDb(): Promise<IDBDatabase> {
  if (conn.db) return conn.db;
  if (!conn.reopen) throw new Error("Library DB not initialized");
  conn.db = attachLifecycle(await conn.reopen());
  return conn.db;
}

// Run a single-request IndexedDB transaction against the "library" store,
// reopening the connection and retrying once if it has been closed.
async function runRequest<T>(
  mode: IDBTransactionMode,
  makeRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const db = await getLiveDb();
    try {
      return await new Promise<T>((resolve, reject) => {
        // `db.transaction()` itself throws synchronously when the connection
        // is closing; running it inside the executor turns that into a
        // rejection we can catch and retry below.
        const tx = db.transaction("library", mode);
        const store = tx.objectStore("library");
        const request = makeRequest(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.onabort = () => reject(tx.error);
      });
    } catch (err) {
      if (attempt === 0 && isConnectionClosedError(err)) {
        if (conn.db === db) conn.db = null; // force a reopen on the retry
        continue;
      }
      throw err;
    }
  }
  // Unreachable: the loop either returns or throws.
  throw new Error("Library DB transaction failed");
}

const createLibraryStore = () =>
  createStore<LibraryStore>()((set, get) => ({
    entries: [],
    activeSkinId: null,
    isLoading: true,

    initialize: async (db: IDBDatabase, reopen) => {
      conn.db = attachLifecycle(db);
      conn.reopen = reopen ?? null;

      // Load all entries
      const entries = await runRequest<LibraryEntry[]>("readonly", (store) =>
        store.getAll(),
      ).then((result) => result || []);

      // Load active skin id
      const activeSkinId = localStorage.getItem(ACTIVE_SKIN_KEY);

      // Sort by updatedAt (most recently updated first)
      entries.sort((a, b) => b.updatedAt - a.updatedAt);

      set({
        entries,
        activeSkinId:
          activeSkinId && entries.some((e) => e.id === activeSkinId)
            ? activeSkinId
            : entries.length > 0
              ? entries[0].id
              : null,
        isLoading: false,
      });
    },

    addEntry: async (entry: LibraryEntry) => {
      await runRequest("readwrite", (store) => store.put(entry));

      set((state) => ({
        entries: [...state.entries, entry],
      }));
    },

    updateEntry: async (id: string, updates: Partial<LibraryEntry>) => {
      const state = get();
      const existing = state.entries.find((e) => e.id === id);
      if (!existing) return;

      const updated = { ...existing, ...updates };

      await runRequest("readwrite", (store) => store.put(updated));

      set((state) => {
        const entries = state.entries.map((e) => (e.id === id ? updated : e));
        entries.sort((a, b) => b.updatedAt - a.updatedAt);
        return { entries };
      });
    },

    deleteEntry: async (id: string) => {
      await runRequest("readwrite", (store) => store.delete(id));

      set((state) => {
        const newEntries = state.entries.filter((e) => e.id !== id);
        const newActiveId =
          state.activeSkinId === id
            ? newEntries.length > 0
              ? newEntries[0].id
              : null
            : state.activeSkinId;

        if (newActiveId !== state.activeSkinId) {
          if (newActiveId) {
            localStorage.setItem(ACTIVE_SKIN_KEY, newActiveId);
          } else {
            localStorage.removeItem(ACTIVE_SKIN_KEY);
          }
        }

        return { entries: newEntries, activeSkinId: newActiveId };
      });
    },

    setActiveSkin: (id: string) => {
      localStorage.setItem(ACTIVE_SKIN_KEY, id);
      set({ activeSkinId: id });
    },

    getActiveEntry: () => {
      const state = get();
      return state.entries.find((e) => e.id === state.activeSkinId) || null;
    },
  }));

// In dev, pin the store on globalThis so HMR re-evaluation of this module
// doesn't replace it with a fresh instance and wipe all runtime state.
// Trade-off: edits to store action logic need a manual refresh to apply.
const globalStores = globalThis as unknown as {
  __mineskinLibraryStore?: ReturnType<typeof createLibraryStore>;
};

export const libraryStore =
  process.env.NODE_ENV === "production"
    ? createLibraryStore()
    : (globalStores.__mineskinLibraryStore ??= createLibraryStore());

export const getLibraryState = libraryStore.getState;
export const subscribeToLibrary = libraryStore.subscribe;

// Save imageData to the active library entry in IndexedDB
export function saveActiveSkinToLibrary(
  imageData: ImageData,
  isPocket: boolean,
  isDoubleRes: boolean = false,
) {
  const libState = getLibraryState();
  const activeEntry = libState.getActiveEntry();
  if (!activeEntry) return Promise.resolve();

  return libState.updateEntry(activeEntry.id, {
    skinData: imageData.data.buffer.slice(0),
    isPocket,
    isDoubleRes,
  });
}

// Helper to create a library entry
export function createLibraryEntry(
  name: string,
  imageData: ImageData,
  isPocket: boolean,
  isDoubleRes: boolean = false,
): LibraryEntry {
  const now = Date.now();
  return {
    id: uuidv4(),
    name,
    skinData: imageData.data.buffer.slice(0),
    isPocket,
    isDoubleRes,
    createdAt: now,
    updatedAt: now,
  };
}
