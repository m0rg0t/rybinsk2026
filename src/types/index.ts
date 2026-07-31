export interface Event {
  id: string;
  time: string;
  title: string;
  description: string;
  category: string;
}

export interface Location {
  id: string;
  name: string;
  events: Event[];
}

export interface EventData {
  date: string;
  title: string;
  subtitle?: string;
  locations: Location[];
}

export type EventStatus = 'past' | 'current' | 'future';

export type FilterType = 'all' | 'current' | 'future' | string;

export interface EventWithStatus extends Event {
  status: EventStatus;
  startTime: Date;
  endTime: Date;
}