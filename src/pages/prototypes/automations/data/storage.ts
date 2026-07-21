const FAVORITES_KEY = 'automations-prototype-favorites';
const RECENTS_KEY = 'automations-prototype-recents';
const MAX_RECENTS = 10;

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // ignore quota / private mode
  }
}

export function loadFavoriteIds(): string[] {
  return readIds(FAVORITES_KEY);
}

export function saveFavoriteIds(ids: string[]) {
  writeIds(FAVORITES_KEY, ids);
}

export function loadRecentIds(): string[] {
  return readIds(RECENTS_KEY);
}

export function pushRecentId(id: string, existing = loadRecentIds()): string[] {
  const next = [id, ...existing.filter((x) => x !== id)].slice(0, MAX_RECENTS);
  writeIds(RECENTS_KEY, next);
  return next;
}
