import { EventCard } from './EventCard';
import { Location, EventWithStatus } from '@/types';

interface LocationCardProps {
  location: Location;
  events: EventWithStatus[];
}

export function LocationCard({ location, events }: LocationCardProps) {
  const currentEvents = events.filter(e => e.status === 'current').length;

  return (
    <section aria-label={location.name}>
      <header className="mb-4 flex items-baseline justify-between gap-3 rule-hairline pt-3">
        {/* Красные капители площадок — как на официальной афише */}
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-kinovar">
          {location.name}
        </h2>
        <span className="shrink-0 font-mono text-xs text-ink-muted">
          {currentEvents > 0 ? (
            <span className="font-bold text-kinovar">{currentEvents} сейчас</span>
          ) : (
            `${events.length} соб.`
          )}
        </span>
      </header>

      {events.length === 0 ? (
        <p className="pb-6 text-sm text-ink-muted">Мероприятий не найдено</p>
      ) : (
        <div>
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
