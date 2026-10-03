import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseFavorites, readStoredValue, writeStoredValue } from './storage';

afterEach(() => vi.unstubAllGlobals());

describe('stored preferences', () => {
  it.each([null, '', 'broken', 'null', '42', '{}', '"route"'])('rejects malformed favorites %s', value => {
    expect([...parseFavorites(value)]).toEqual([]);
  });
  it('keeps only unique nonempty string IDs', () => {
    expect([...parseFavorites('["a", null, 3, "", "a", "b"]')]).toEqual(['a', 'b']);
  });
  it('keeps the app usable when accessing storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem() { throw new DOMException('Blocked', 'SecurityError'); },
      setItem() { throw new DOMException('Full', 'QuotaExceededError'); },
    });
    expect(readStoredValue('theme')).toBeNull();
    expect(() => writeStoredValue('theme', 'dark')).not.toThrow();
  });
  it('passes through successful storage operations', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem: () => 'dark', setItem });
    expect(readStoredValue('theme')).toBe('dark');
    writeStoredValue('theme', 'light');
    expect(setItem).toHaveBeenCalledWith('theme', 'light');
  });
});
