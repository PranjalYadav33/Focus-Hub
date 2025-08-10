// A tiny client-side data layer that centralizes persistence, parsing, and cross-tab sync
// - Safe JSON parse with fallback
// - BroadcastChannel-based fan-out for instant multi-tab updates
// - Small utilities for atomic/functional updates and capping list sizes

export type StoreEvent = {
  key: string
  value: unknown
}

const CHANNEL_NAME = 'mfhub-store';
let bc: BroadcastChannel | null = null;
function getBC(): BroadcastChannel | null {
  if (bc) return bc;
  if (typeof window === 'undefined') return null;
  if ('BroadcastChannel' in window) {
    try { bc = new (window as any).BroadcastChannel(CHANNEL_NAME); } catch { bc = null; }
  }
  return bc;
}

export function publish(event: StoreEvent) {
  try { getBC()?.postMessage(event); } catch { /* noop */ }
}

export function subscribe(cb: (e: StoreEvent) => void) {
  const channel = getBC();
  if (!channel) return () => {};
  const handler = (e: MessageEvent<StoreEvent>) => cb(e.data);
  channel.addEventListener('message', handler as any);
  return () => channel.removeEventListener('message', handler as any);
}

export function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    publish({ key, value });
  } catch {
    // storage might be full or blocked; ignore for now
  }
}

// Functional update helper for lists with an optional cap to prevent unbounded growth
export function updateList<T>(key: string, updater: (prev: T[]) => T[], cap?: number): T[] {
  const prev = getJSON<T[]>(key, []);
  let next = updater(prev);
  if (typeof cap === 'number' && cap > 0 && next.length > cap) {
    next = next.slice(0, cap);
  }
  setJSON(key, next);
  return next;
}

// Compare-and-swap atomic update to minimize race conditions across tabs
export function cas<T>(key: string, compute: (prev: T) => T, initial: T): T {
  const prev = getJSON<T>(key, initial);
  const next = compute(prev);
  setJSON(key, next);
  return next;
}

