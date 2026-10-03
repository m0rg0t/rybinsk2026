import { isValid, isBefore, isWithinInterval } from 'date-fns';
import { Event, EventWithStatus, EventStatus } from '@/types';

const SESSION_DURATION_MS = 45 * 60 * 1000;

export interface EventInterval {
  start: Date;
  end: Date;
}

// The published 2025/2026 programme is in Rybinsk (UTC+03), regardless of the viewer's zone.
function parseTime(timeString: string, eventDate: string): Date {
  const normalized = timeString.trim().replace('.', ':');
  const match = /^(\d{1,2}):(\d{2})$/.exec(normalized);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new RangeError(`Invalid event time: ${timeString}`);
  }
  const time = new Date(`${eventDate}T${match[1].padStart(2, '0')}:${match[2]}:00+03:00`);
  if (!isValid(time)) throw new RangeError(`Invalid event date: ${eventDate}`);
  return time;
}

// Supports "12:00-13:00" ranges and "11:00, 15:00, 18:00" session lists
export function parseEventIntervals(timeString: string, eventDate: string): EventInterval[] {
  if (timeString.trim().toLowerCase() === 'в течение дня') {
    const start = parseTime('00:00', eventDate);
    return [{ start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1) }];
  }
  if (timeString.includes(',')) {
    return timeString.split(',').map(session => {
      const start = parseTime(session, eventDate);
      return { start, end: new Date(start.getTime() + SESSION_DURATION_MS) };
    });
  }

  if (timeString.includes('-')) {
    const [startTime, endTime] = timeString.split('-');
    return [{ start: parseTime(startTime, eventDate), end: parseTime(endTime, eventDate) }];
  }

  const start = parseTime(timeString, eventDate);
  return [{ start, end: new Date(start.getTime() + SESSION_DURATION_MS) }];
}

export function parseEventTime(timeString: string, eventDate: string): EventInterval {
  const intervals = parseEventIntervals(timeString, eventDate);
  return {
    start: intervals[0].start,
    end: intervals[intervals.length - 1].end,
  };
}

export function getEventStatus(event: Event, currentTime: Date, eventDate: string): EventStatus {
  const intervals = parseEventIntervals(event.time, eventDate);

  if (intervals.some(interval => isWithinInterval(currentTime, interval))) {
    return 'current';
  }
  if (isBefore(currentTime, intervals[0].start)) {
    return 'future';
  }
  // Between sessions of a multi-session event, the next one is still ahead
  const nextSession = intervals.find(interval => isBefore(currentTime, interval.start));
  return nextSession ? 'future' : 'past';
}

export function addStatusToEvent(event: Event, currentTime: Date, eventDate: string): EventWithStatus {
  const { start, end } = parseEventTime(event.time, eventDate);
  const status = getEventStatus(event, currentTime, eventDate);

  return {
    ...event,
    status,
    startTime: start,
    endTime: end,
  };
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}
