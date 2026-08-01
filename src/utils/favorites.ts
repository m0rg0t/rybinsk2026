import { useCallback, useState } from 'react';

// «Мой маршрут» живёт в localStorage — переживает офлайн и перезапуски
export function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleFavorite = useCallback(
    (eventId: string) => {
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(eventId)) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          // приватный режим — маршрут проживёт до перезагрузки
        }
        return next;
      });
    },
    [storageKey]
  );

  return { favorites, toggleFavorite };
}
