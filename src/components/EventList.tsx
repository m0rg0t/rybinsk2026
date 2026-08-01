import { useState, useEffect, useMemo, useRef } from 'react';
import { LocationCard } from './LocationCard';
import { EventCard } from './EventCard';
import { FilterBar } from './FilterBar';
import { EventData, EventWithStatus, FilterType } from '@/types';
import { addStatusToEvent } from '@/utils/time';
import { useFavorites } from '@/utils/favorites';

export type ViewMode = 'byPlace' | 'byTime';

interface EventListProps {
  eventData: EventData;
}

function matchesQuery(event: EventWithStatus, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    event.title.toLowerCase().includes(q) ||
    event.description.toLowerCase().includes(q) ||
    event.category.toLowerCase().includes(q)
  );
}

export function EventList({ eventData }: EventListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('byPlace');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite } = useFavorites(`rybinsk-route-${eventData.date}`);
  const nowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const locationsWithStatus = useMemo(() => {
    return eventData.locations.map(location => ({
      ...location,
      events: location.events.map(event =>
        addStatusToEvent(event, currentTime, eventData.date)
      ),
    }));
  }, [eventData, currentTime]);

  // Поиск + «моё» применяются везде; статус и площадка — поверх
  const baseFiltered = useMemo(() => {
    return locationsWithStatus.map(location => ({
      ...location,
      events: location.events.filter(
        event =>
          matchesQuery(event, searchQuery) &&
          (!showFavoritesOnly || favorites.has(event.id))
      ),
    }));
  }, [locationsWithStatus, searchQuery, showFavoritesOnly, favorites]);

  const filteredLocations = useMemo(() => {
    return baseFiltered
      .map(location => ({
        ...location,
        events:
          statusFilter === 'all'
            ? location.events
            : location.events.filter(event => event.status === statusFilter),
      }))
      .filter(location =>
        selectedLocation === 'all' ? location.events.length > 0 : location.id === selectedLocation
      );
  }, [baseFiltered, statusFilter, selectedLocation]);

  // Хронологическая лента: все события одной рекой, по времени начала
  const timeline = useMemo(() => {
    return filteredLocations
      .flatMap(location =>
        location.events.map(event => ({ event, locationName: location.name }))
      )
      .sort(
        (a, b) =>
          a.event.startTime.getTime() - b.event.startTime.getTime() ||
          a.event.title.localeCompare(b.event.title, 'ru')
      );
  }, [filteredLocations]);

  // При включении ленты прокручиваем к текущему моменту
  useEffect(() => {
    if (viewMode === 'byTime') {
      nowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [viewMode]);

  const firstNotPastIndex = timeline.findIndex(item => item.event.status !== 'past');

  const locationCounts = useMemo(() => {
    return baseFiltered.map(location => ({
      id: location.id,
      name: location.name,
      count:
        statusFilter === 'all'
          ? location.events.length
          : location.events.filter(event => event.status === statusFilter).length,
    }));
  }, [baseFiltered, statusFilter]);

  const statusCounts = useMemo(() => {
    const all = baseFiltered.flatMap(location => location.events);
    return {
      current: all.filter(event => event.status === 'current').length,
      future: all.filter(event => event.status === 'future').length,
    };
  }, [baseFiltered]);

  const emptyState = (
    <div className="py-10 text-center text-ink-muted">
      <p>
        {showFavoritesOnly && favorites.size === 0
          ? 'Маршрут пока пуст — отмечайте события звёздочкой.'
          : 'По этим условиям ничего не идёт.'}
      </p>
      <p className="mt-1 text-sm">
        {showFavoritesOnly && favorites.size === 0
          ? 'Собранный маршрут сохранится на устройстве и будет работать офлайн.'
          : 'Сбросьте фильтры или измените запрос — программа длится весь день.'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        locations={locationCounts}
        currentEventsCount={statusCounts.current}
        futureEventsCount={statusCounts.future}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        favoritesCount={favorites.size}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(v => !v)}
      />

      {viewMode === 'byTime' ? (
        <div>
          {timeline.length === 0
            ? emptyState
            : timeline.map((item, index) => (
                <div key={item.event.id} ref={index === firstNotPastIndex ? nowRef : undefined}>
                  <EventCard
                    event={item.event}
                    locationName={item.locationName}
                    showLocation
                    isFavorite={favorites.has(item.event.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
        </div>
      ) : (
        <div className="space-y-8">
          {filteredLocations.length === 0
            ? emptyState
            : filteredLocations.map(location => (
                <LocationCard
                  key={location.id}
                  location={location}
                  events={location.events}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
        </div>
      )}
    </div>
  );
}
