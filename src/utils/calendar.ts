import { format } from 'date-fns';
import { EventWithStatus } from '@/types';

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function icsDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

// Плавающее локальное время: праздник привязан к городу, а не к часовому поясу устройства
export function downloadIcs(event: EventWithStatus, locationName: string): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//rybinsk2026//День города Рыбинска//RU',
    'BEGIN:VEVENT',
    `UID:${event.id}@rybinsk-birthday.rybinsk-secrets.ru`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.startTime)}`,
    `DTEND:${icsDate(event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(`${locationName}, Рыбинск`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.id}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
