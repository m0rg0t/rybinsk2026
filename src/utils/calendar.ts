import { EventWithStatus } from '@/types';

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// UTC preserves the actual Rybinsk instant when imported in any device timezone.
export function createIcs(event: EventWithStatus, locationName: string, now = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//rybinsk2026//День города Рыбинска//RU',
    'BEGIN:VEVENT',
    `UID:${event.id}@rybinsk-birthday.rybinsk-secrets.ru`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(event.startTime)}`,
    `DTEND:${icsDate(event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(`${locationName}, Рыбинск`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n') + '\r\n';
}

export function downloadIcs(event: EventWithStatus, locationName: string): void {
  const blob = new Blob([createIcs(event, locationName)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.id}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
