import { EventCard } from './EventCard';
import { Location, EventWithStatus } from '@/types';

interface LocationCardProps {
  location: Location;
  events: EventWithStatus[];
  favorites: Set<string>;
  onToggleFavorite: (eventId: string) => void;
}

export function LocationCard({ location, events, favorites, onToggleFavorite }: LocationCardProps) {
  const currentEvents = events.filter(e => e.status === 'current').length;
  const mapUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(`Рыбинск, ${location.name}`)}`;

  return (
    <section aria-label={location.name}>
      <header className="mb-4 flex items-baseline justify-between gap-3 rule-hairline pt-3">
        {/* Красные капители площадок — как на официальной афише */}
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-kinovar">
          {location.name}
        </h2>
        <span className="flex shrink-0 items-baseline gap-3 font-mono text-xs">
          {currentEvents > 0 ? (
            <span className="font-bold text-kinovar">{currentEvents} сейчас</span>
          ) : (
            <span className="text-ink-muted">{events.length} соб.</span>
          )}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-river underline decoration-gold-soft underline-offset-4 hover:decoration-river focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            как пройти →
          </a>
        </span>
      </header>

      {events.length === 0 ? (
        <p className="pb-6 text-sm text-ink-muted">Мероприятий не найдено</p>
      ) : (
        <div>
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              locationName={location.name}
              isFavorite={favorites.has(event.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
