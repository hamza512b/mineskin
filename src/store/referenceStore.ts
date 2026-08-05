import { createStore } from "zustand/vanilla";
import { v4 as uuidv4 } from "uuid";
import {
  MAX_REFERENCES,
  normalizeReferenceImage,
} from "@/lib/referenceImage";

export interface ReferenceEntry {
  id: string;
  name: string;
  /** Re-encoded full-size image, capped at MAX_REFERENCE_DIMENSION. */
  blob: Blob;
  /** Small image for the filmstrip, so opening the panel decodes ~1% as much. */
  thumbBlob: Blob;
  width: number;
  height: number;
  /** Swatches derived at import time; see `extractPalette`. */
  palette: string[];
  /** Explicit ordering so the filmstrip is stable and reorderable later. */
  order: number;
  createdAt: number;
}

interface ReferenceState {
  entries: ReferenceEntry[];
  activeReferenceId: string | null;
  isLoading: boolean;
}

interface ReferenceActions {
  initialize: (
    db: IDBDatabase,
    reopen?: () => Promise<IDBDatabase>,
  ) => Promise<void>;
  addFromFile: (file: File | Blob, name?: string) => Promise<ReferenceEntry>;
  deleteEntry: (id: string) => Promise<void>;
  /** Puts a deleted entry back, keeping its original filmstrip position. */
  restoreEntry: (entry: ReferenceEntry, makeActive: boolean) => Promise<void>;
  setActiveReference: (id: string) => void;
  getActiveEntry: () => ReferenceEntry | null;
}

export type ReferenceStore = ReferenceState & ReferenceActions;

export class ReferenceLimitError extends Error {
  constructor() {
    super(`Cannot store more than ${MAX_REFERENCES} reference images`);
    this.name = "ReferenceLimitError";
  }
}

const ACTIVE_REFERENCE_KEY = "mineskin_active_reference_id";

// Mirrors the library store's connection handling: the handle is shared,
// HMR-pinned module state so hot-reloaded importers see the live connection
// rather than a fresh null one.
interface ReferenceDbConn {
  db: IDBDatabase | null;
  reopen: (() => Promise<IDBDatabase>) | null;
}
const conn: ReferenceDbConn =
  process.env.NODE_ENV === "production"
    ? { db: null, reopen: null }
    : ((
        globalThis as unknown as { __mineskinReferenceDbConn?: ReferenceDbConn }
      ).__mineskinReferenceDbConn ??= { db: null, reopen: null });

// Browsers (notably iOS Safari) force-close IndexedDB connections when a page
// is frozen / restored from the bfcache. A cached handle then throws on the
// next transaction, so detect the dead handle and drop it for a reopen.
function isConnectionClosedError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "InvalidStateError" ||
      err.name === "AbortError" ||
      err.name === "TransactionInactiveError")
  );
}

function attachLifecycle(db: IDBDatabase): IDBDatabase {
  const previousVersionChange = db.onversionchange;
  const previousClose = db.onclose;
  // The connection is shared with the library store, so chain rather than
  // replace: clobbering these would leave that store holding a dead handle.
  db.onversionchange = (event) => {
    previousVersionChange?.call(db, event);
    if (conn.db === db) conn.db = null;
  };
  db.onclose = (event) => {
    previousClose?.call(db, event);
    if (conn.db === db) conn.db = null;
  };
  return db;
}

async function getLiveDb(): Promise<IDBDatabase> {
  if (conn.db) return conn.db;
  if (!conn.reopen) throw new Error("Reference DB not initialized");
  conn.db = attachLifecycle(await conn.reopen());
  return conn.db;
}

// Run a single-request transaction against the "references" store, reopening
// and retrying once if the connection has been closed underneath us.
async function runRequest<T>(
  mode: IDBTransactionMode,
  makeRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const db = await getLiveDb();
    try {
      return await new Promise<T>((resolve, reject) => {
        // `db.transaction()` throws synchronously when the connection is
        // closing; running it inside the executor turns that into a rejection
        // we can catch and retry below.
        const tx = db.transaction("references", mode);
        const store = tx.objectStore("references");
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
  throw new Error("Reference DB transaction failed");
}

const createReferenceStore = () =>
  createStore<ReferenceStore>()((set, get) => ({
    entries: [],
    activeReferenceId: null,
    isLoading: true,

    initialize: async (db, reopen) => {
      conn.db = attachLifecycle(db);
      conn.reopen = reopen ?? null;

      const entries = await runRequest<ReferenceEntry[]>("readonly", (store) =>
        store.getAll(),
      ).then((result) => result || []);

      entries.sort((a, b) => a.order - b.order);

      const savedId = localStorage.getItem(ACTIVE_REFERENCE_KEY);
      set({
        entries,
        activeReferenceId:
          savedId && entries.some((e) => e.id === savedId)
            ? savedId
            : (entries[0]?.id ?? null),
        isLoading: false,
      });
    },

    addFromFile: async (file, name) => {
      if (get().entries.length >= MAX_REFERENCES) {
        throw new ReferenceLimitError();
      }

      const normalized = await normalizeReferenceImage(file);
      const fallbackName = (file as File).name ?? "";
      const entry: ReferenceEntry = {
        id: uuidv4(),
        name: (name ?? fallbackName).replace(/\.[^.]+$/, "") || "Reference",
        blob: normalized.blob,
        thumbBlob: normalized.thumbBlob,
        width: normalized.width,
        height: normalized.height,
        palette: normalized.palette,
        order: (get().entries.at(-1)?.order ?? -1) + 1,
        createdAt: Date.now(),
      };

      await runRequest("readwrite", (store) => store.put(entry));

      localStorage.setItem(ACTIVE_REFERENCE_KEY, entry.id);
      set((state) => ({
        entries: [...state.entries, entry],
        // A freshly added image becomes the one you're looking at — that's
        // almost always why it was added.
        activeReferenceId: entry.id,
      }));
      return entry;
    },

    deleteEntry: async (id) => {
      await runRequest("readwrite", (store) => store.delete(id));

      set((state) => {
        const entries = state.entries.filter((e) => e.id !== id);
        const activeReferenceId =
          state.activeReferenceId === id
            ? (entries[0]?.id ?? null)
            : state.activeReferenceId;

        if (activeReferenceId !== state.activeReferenceId) {
          if (activeReferenceId) {
            localStorage.setItem(ACTIVE_REFERENCE_KEY, activeReferenceId);
          } else {
            localStorage.removeItem(ACTIVE_REFERENCE_KEY);
          }
        }

        return { entries, activeReferenceId };
      });
    },

    // Undo for `deleteEntry`. The caller still holds the entry — blobs and all
    // — so this re-puts the original record rather than re-importing, which
    // would re-encode the image and mint a new id.
    restoreEntry: async (entry, makeActive) => {
      const current = get().entries;
      if (current.some((e) => e.id === entry.id)) return;
      if (current.length >= MAX_REFERENCES) throw new ReferenceLimitError();

      await runRequest("readwrite", (store) => store.put(entry));

      set((state) => {
        // `order` is preserved, so sorting drops it back where it was rather
        // than at the end of the strip.
        const entries = [...state.entries, entry].sort(
          (a, b) => a.order - b.order,
        );
        const activeReferenceId =
          makeActive || state.activeReferenceId === null
            ? entry.id
            : state.activeReferenceId;

        if (activeReferenceId !== state.activeReferenceId) {
          localStorage.setItem(ACTIVE_REFERENCE_KEY, activeReferenceId);
        }

        return { entries, activeReferenceId };
      });
    },

    setActiveReference: (id) => {
      localStorage.setItem(ACTIVE_REFERENCE_KEY, id);
      set({ activeReferenceId: id });
    },

    getActiveEntry: () => {
      const state = get();
      return state.entries.find((e) => e.id === state.activeReferenceId) ?? null;
    },
  }));

// In dev, pin the store on globalThis so HMR re-evaluation doesn't replace it
// with a fresh instance and wipe runtime state. Trade-off: edits to action
// logic need a manual refresh to apply.
const globalStores = globalThis as unknown as {
  __mineskinReferenceStore?: ReturnType<typeof createReferenceStore>;
};

export const referenceStore =
  process.env.NODE_ENV === "production"
    ? createReferenceStore()
    : (globalStores.__mineskinReferenceStore ??= createReferenceStore());

export const getReferenceState = referenceStore.getState;
export const subscribeToReferences = referenceStore.subscribe;

// References aren't needed to boot the renderer, so the store initializes the
// first time the panel is opened rather than on the critical path. The promise
// is cached so concurrent openers share one initialization.
let initPromise: Promise<void> | null = null;

export function ensureReferencesInitialized(
  openDb: () => Promise<IDBDatabase>,
): Promise<void> {
  if (!initPromise) {
    initPromise = openDb()
      .then((db) => getReferenceState().initialize(db, openDb))
      .catch((err) => {
        // Let a later open retry rather than caching the failure forever.
        initPromise = null;
        throw err;
      });
  }
  return initPromise;
}
