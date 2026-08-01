import { Star, CalendarPlus } from 'lucide-react';
import { EventWithStatus } from '@/types';
import { cn } from '@/lib/utils';
import { getCategoryLabel } from '@/utils/categories';
import { downloadIcs } from '@/utils/calendar';

interface EventCardProps {
  event: EventWithStatus;
  locationName: string;
  showLocation?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
}

// "12:00-13:00" → ["12:00", "13:00"]; "14:00, 16:00" → ["14:00", "16:00", ...]
function timeParts(time: string): { main: string; rest: string[] } {
  if (time.includes(',')) {
    const sessions = time.split(',').map(s => s.trim());
    return { main: sessions[0], rest: sessions.slice(1) };
  }
  if (time.includes('-')) {
    const [start, end] = time.split('-').map(s => s.trim());
    return { main: start, rest: [`–${end}`] };
  }
  return { main: time, rest: [] };
}

function minutesUntilStart(event: EventWithStatus): number | null {
  if (event.status !== 'future') return null;
  const diff = Math.round((event.startTime.getTime() - Date.now()) / 60000);
  return diff > 0 && diff <= 60 ? diff : null;
}

export function EventCard({
  event,
  locationName,
  showLocation = false,
  isFavorite,
  onToggleFavorite,
}: EventCardProps) {
  const { main, rest } = timeParts(event.time);
  const isCurrent = event.status === 'current';
  const isPast = event.status === 'past';
  const startsIn = minutesUntilStart(event);

  return (
    <article
      className={cn(
        'grid grid-cols-[3.75rem_1.25rem_1fr] transition-opacity',
        isPast && 'opacity-50'
      )}
    >
      {/* Колонка времени — как в железнодорожном расписании */}
      <div className="pt-0.5 text-right font-mono text-sm leading-tight text-ink">
        <div className={cn(isCurrent && 'font-bold text-kinovar')}>{main}</div>
        {rest.map(part => (
          <div key={part} className="text-xs text-ink-muted">
            {part}
          </div>
        ))}
      </div>

      {/* Рельс с узлом */}
      <div className="relative" aria-hidden="true">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gold-soft" />
        <span
          className={cn(
            'absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border',
            isCurrent
              ? 'live-dot border-kinovar bg-kinovar'
              : isPast
                ? 'border-gold-soft bg-paper'
                : 'border-gold bg-paper'
          )}
        />
      </div>

      {/* Содержание */}
      <div className="pb-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-ink">
            {event.title}
            {isCurrent && (
              <span className="ml-2 inline-block bg-kinovar px-1.5 py-0.5 align-middle font-mono text-[0.625rem] uppercase tracking-widest text-paper dark:text-background">
                Сейчас
              </span>
            )}
            {startsIn !== null && (
              <span className="ml-2 inline-block border border-river px-1.5 py-0.5 align-middle font-mono text-[0.625rem] uppercase tracking-widest text-river">
                через {startsIn} мин
              </span>
            )}
          </h3>
          <span className="flex shrink-0 gap-1">
            <button
              onClick={() => onToggleFavorite(event.id)}
              aria-label={isFavorite ? 'Убрать из маршрута' : 'В мой маршрут'}
              aria-pressed={isFavorite}
              title={isFavorite ? 'Убрать из маршрута' : 'В мой маршрут'}
              className="p-1 text-gold transition-colors hover:text-kinovar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-gold')} />
            </button>
            {!isPast && (
              <button
                onClick={() => downloadIcs(event, locationName)}
                aria-label="Добавить в календарь"
                title="Добавить в календарь"
                className="p-1 text-gold transition-colors hover:text-kinovar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <CalendarPlus className="h-4 w-4" />
              </button>
            )}
          </span>
        </div>
        {event.description && (
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{event.description}</p>
        )}
        <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-gold">
          {getCategoryLabel(event.category)}
          {showLocation && <span className="text-ink-muted"> · {locationName}</span>}
        </p>
      </div>
    </article>
  );
}
