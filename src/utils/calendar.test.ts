import { describe, expect, it } from 'vitest';
import { createIcs } from './calendar';
import { addStatusToEvent } from './time';

describe('calendar export', () => {
  it('exports the actual city time as UTC, including DTSTAMP', () => {
    const event = addStatusToEvent({ id: 'show', time: '12:00-13:00', title: 'Show', description: '', category: 'show' }, new Date('2026-08-01T09:30:00Z'), '2026-08-01');
    const ics = createIcs(event, 'Square', new Date('2026-07-01T12:34:56Z'));
    expect(ics).toContain('DTSTART:20260801T090000Z\r\n');
    expect(ics).toContain('DTEND:20260801T100000Z\r\n');
    expect(ics).toContain('DTSTAMP:20260701T123456Z\r\n');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
  it('escapes calendar text rather than inserting fields', () => {
    const event = addStatusToEvent({ id: 'show', time: '12:00', title: 'A;B,C\\D\nE', description: '', category: 'show' }, new Date(), '2026-08-01');
    expect(createIcs(event, 'Square')).toContain('SUMMARY:A\\;B\\,C\\\\D\\nE\r\n');
  });
});
