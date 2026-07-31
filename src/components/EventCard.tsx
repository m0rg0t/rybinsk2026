import { EventWithStatus } from '@/types';
import { cn } from '@/lib/utils';
import { getCategoryLabel } from '@/utils/categories';

interface EventCardProps {
  event: EventWithStatus;
  locationName?: string;
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

export function EventCard({ event, locationName }: EventCardProps) {
  const { main, rest } = timeParts(event.time);
  const isCurrent = event.status === 'current';
  const isPast = event.status === 'past';

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
        <h3 className="text-base font-bold leading-snug text-ink">
          {event.title}
          {isCurrent && (
            <span className="ml-2 inline-block align-middle bg-kinovar px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-widest text-paper">
              Сейчас
            </span>
          )}
        </h3>
        {event.description && (
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{event.description}</p>
        )}
        <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-gold">
          {getCategoryLabel(event.category)}
          {locationName && <span className="text-ink-muted"> · {locationName}</span>}
        </p>
      </div>
    </article>
  );
}
