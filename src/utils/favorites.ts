import { useCallback, useState } from 'react';
import { parseFavorites, readStoredValue, writeStoredValue } from './storage';

// «Мой маршрут» живёт в localStorage — переживает офлайн и перезапуски
export function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => parseFavorites(readStoredValue(storageKey)));

  const toggleFavorite = useCallback(
    (eventId: string) => {
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(eventId)) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        writeStoredValue(storageKey, JSON.stringify([...next]));
        return next;
      });
    },
    [storageKey]
  );

  return { favorites, toggleFavorite };
}
