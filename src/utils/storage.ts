export function readStoredValue(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeStoredValue(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* Remain usable in private/restricted mode. */ }
}

export function parseFavorites(value: string | null): Set<string> {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && id.length > 0) : []);
  } catch { return new Set(); }
}
