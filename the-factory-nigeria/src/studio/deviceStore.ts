// =====================================================================
// STUDIO — on-device design store (IndexedDB, this browser only)
//
// Temporarily keeps the in-progress design ON THE CUSTOMER'S OWN DEVICE so a
// refresh or accidental close doesn't lose their work. Nothing is ever uploaded
// to a server. IndexedDB (not localStorage) because a design includes uploaded
// image data URLs that can exceed localStorage's ~5MB limit.
//
// "Temporary": ignored + cleared after TTL_DAYS, and cleared when the customer
// starts a new design or sends their enquiry. All calls fail silently — storage
// is a convenience, never allowed to break the editor.
// =====================================================================

import { type SavedDesign } from "./persist";

const DB_NAME = "the-factory-studio";
const STORE = "design";
const KEY = "current";
const TTL_DAYS = 7;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const t = db.transaction(STORE, mode);
          const req = run(t.objectStore(STORE));
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => resolve(null);
          t.oncomplete = () => db.close();
        } catch {
          resolve(null);
        }
      }),
  );
}

/** Save the current design to this device (overwrites the single slot). */
export async function saveDesignLocal(saved: SavedDesign): Promise<void> {
  await tx("readwrite", (s) => s.put(saved, KEY));
}

/** Load a recent on-device design, or null if none / expired (expired is cleared). */
export async function loadDesignLocal(): Promise<SavedDesign | null> {
  const saved = (await tx<SavedDesign>("readonly", (s) => s.get(KEY))) as SavedDesign | null;
  if (!saved || typeof saved.savedAt !== "number") return null;
  if (Date.now() - saved.savedAt > TTL_MS) {
    await clearDesignLocal();
    return null;
  }
  return saved;
}

/** Forget the on-device design (called on new design / after sending). */
export async function clearDesignLocal(): Promise<void> {
  await tx("readwrite", (s) => s.delete(KEY));
}

/** Human "saved 3 minutes ago" style label. */
export function savedAgo(savedAt: number, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - savedAt) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
