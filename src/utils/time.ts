import { format, parse, isValid, isBefore, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Event, EventWithStatus, EventStatus } from '@/types';

const SESSION_DURATION_MS = 45 * 60 * 1000;

export interface EventInterval {
  start: Date;
  end: Date;
}

function parseTime(timeString: string, baseDate: Date): Date {
  const normalized = timeString.trim().replace('.', ':');
  const time = parse(normalized, 'HH:mm', baseDate);
  return isValid(time) ? time : baseDate;
}

// Supports "12:00-13:00" ranges and "11:00, 15:00, 18:00" session lists
export function parseEventIntervals(timeString: string, eventDate: string): EventInterval[] {
  const baseDate = new Date(eventDate);

  if (timeString.includes(',')) {
    return timeString.split(',').map(session => {
      const start = parseTime(session, baseDate);
      return { start, end: new Date(start.getTime() + SESSION_DURATION_MS) };
    });
  }

  if (timeString.includes('-')) {
    const [startTime, endTime] = timeString.split('-');
    return [{ start: parseTime(startTime, baseDate), end: parseTime(endTime, baseDate) }];
  }

  const start = parseTime(timeString, baseDate);
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
  return format(date, 'HH:mm', { locale: ru });
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}
