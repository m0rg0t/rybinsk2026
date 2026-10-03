import { describe, it, expect } from 'vitest';
import { parseEventIntervals, getEventStatus, formatTime } from './time';
import { Event } from '@/types';
import currentProgramme from '@/data/events.json';
import archiveProgramme from '@/data/events2025.json';

const DATE = '2026-08-01';

function makeEvent(time: string): Event {
  return { id: 't', time, title: 't', description: '', category: 'show' };
}

function at(time: string): Date {
  return new Date(`${DATE}T${time}:00+03:00`);
}

describe('parseEventIntervals', () => {
  it('парсит диапазон', () => {
    const [interval] = parseEventIntervals('12:00-13:30', DATE);
    expect(interval.start).toEqual(at('12:00'));
    expect(interval.end).toEqual(at('13:30'));
  });

  it('парсит список сеансов', () => {
    const intervals = parseEventIntervals('11:00, 15:00, 18:00', DATE);
    expect(intervals).toHaveLength(3);
    expect(intervals[1].start).toEqual(at('15:00'));
  });

  it('понимает время с точкой', () => {
    const [interval] = parseEventIntervals('14.00-16.00', DATE);
    expect(interval.start).toEqual(at('14:00'));
    expect(interval.end).toEqual(at('16:00'));
  });

  it('одиночное время получает длительность по умолчанию', () => {
    const [interval] = parseEventIntervals('13:00', DATE);
    expect(interval.end.getTime() - interval.start.getTime()).toBe(45 * 60 * 1000);
  });
});

describe('getEventStatus', () => {
  it('диапазон: до, во время, после', () => {
    const event = makeEvent('12:00-13:00');
    expect(getEventStatus(event, at('11:00'), DATE)).toBe('future');
    expect(getEventStatus(event, at('12:30'), DATE)).toBe('current');
    expect(getEventStatus(event, at('13:30'), DATE)).toBe('past');
  });

  it('сеансы: между сеансами — «скоро», не «прошло»', () => {
    const event = makeEvent('14:00, 16:00');
    expect(getEventStatus(event, at('13:00'), DATE)).toBe('future');
    expect(getEventStatus(event, at('14:20'), DATE)).toBe('current');
    expect(getEventStatus(event, at('15:30'), DATE)).toBe('future');
    expect(getEventStatus(event, at('16:20'), DATE)).toBe('current');
    expect(getEventStatus(event, at('17:30'), DATE)).toBe('past');
  });

  it('событие на весь день идёт «сейчас» в середине дня', () => {
    const event = makeEvent('10:00-18:00');
    expect(getEventStatus(event, at('14:00'), DATE)).toBe('current');
  });
});


describe('city timezone', () => {
  it('uses the same absolute instant even west of UTC', () => {
    const [interval] = parseEventIntervals('12:00-13:30', DATE);
    expect(interval.start.toISOString()).toBe('2026-08-01T09:00:00.000Z');
    expect(formatTime(interval.start)).toBe('12:00');
  });
  it('keeps archived dates in the city timezone', () => {
    expect(parseEventIntervals('10:00', '2025-08-02')[0].start.toISOString()).toBe('2025-08-02T07:00:00.000Z');
  });
  it.each(['nonsense', '25:00', '13:99'])('rejects invalid time %s', time => {
    expect(() => parseEventIntervals(time, DATE)).toThrow(RangeError);
  });
});


describe('published programme compatibility', () => {
  it('parses every existing current and archive event without editing content', () => {
    for (const programme of [currentProgramme, archiveProgramme]) {
      for (const location of programme.locations) {
        for (const event of location.events) {
          for (const interval of parseEventIntervals(event.time, programme.date)) {
            expect(Number.isFinite(interval.start.getTime())).toBe(true);
            expect(interval.end.getTime()).toBeGreaterThanOrEqual(interval.start.getTime());
          }
        }
      }
    }
  });
  it('keeps the published all-day event active throughout the city date', () => {
    expect(getEventStatus(makeEvent('В течение дня'), new Date('2025-08-02T15:00:00Z'), '2025-08-02')).toBe('current');
    expect(getEventStatus(makeEvent('В течение дня'), new Date('2025-08-02T21:00:00Z'), '2025-08-02')).toBe('past');
  });
});
