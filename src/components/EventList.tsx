import { useState, useEffect, useMemo } from 'react';
import { LocationCard } from './LocationCard';
import { FilterBar } from './FilterBar';
import { EventData, FilterType } from '@/types';
import { addStatusToEvent } from '@/utils/time';

interface EventListProps {
  eventData: EventData;
}

export function EventList({ eventData }: EventListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Add status to all events
  const locationsWithStatus = useMemo(() => {
    return eventData.locations.map(location => ({
      ...location,
      events: location.events.map(event => 
        addStatusToEvent(event, currentTime, eventData.date)
      )
    }));
  }, [eventData, currentTime]);

  // Filter events based on all criteria
  const filteredLocations = useMemo(() => {
    return locationsWithStatus
      .map(location => {
        let filteredEvents = location.events;

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.category.toLowerCase().includes(query)
          );
        }

        // Filter by status
        if (statusFilter !== 'all') {
          filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
        }

        return {
          ...location,
          events: filteredEvents
        };
      })
      .filter(location => {
        // Filter by selected location
        if (selectedLocation !== 'all') {
          return location.id === selectedLocation;
        }
        // Only show locations that have events after filtering
        return location.events.length > 0 || selectedLocation === location.id;
      });
  }, [locationsWithStatus, searchQuery, selectedLocation, statusFilter]);

  // Calculate counts for filter buttons
  const locationCounts = useMemo(() => {
    return eventData.locations.map(location => {
      const locationWithStatus = locationsWithStatus.find(l => l.id === location.id);
      const events = locationWithStatus?.events || [];
      
      let count = events.length;
      
      // Apply search filter to count
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        count = events.filter(event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query)
        ).length;
      }
      
      // Apply status filter to count
      if (statusFilter !== 'all') {
        const searchFiltered = searchQuery ? events.filter(event => {
          const query = searchQuery.toLowerCase();
          return event.title.toLowerCase().includes(query) ||
                 event.description.toLowerCase().includes(query) ||
                 event.category.toLowerCase().includes(query);
        }) : events;
        
        count = searchFiltered.filter(event => event.status === statusFilter).length;
      }

      return {
        id: location.id,
        name: location.name,
        count
      };
    });
  }, [eventData.locations, locationsWithStatus, searchQuery, statusFilter]);

  const currentEventsCount = useMemo(() => {
    return locationsWithStatus.reduce((total, location) => {
      const events = searchQuery ? location.events.filter(event => {
        const query = searchQuery.toLowerCase();
        return event.title.toLowerCase().includes(query) ||
               event.description.toLowerCase().includes(query) ||
               event.category.toLowerCase().includes(query);
      }) : location.events;
      
      return total + events.filter(event => event.status === 'current').length;
    }, 0);
  }, [locationsWithStatus, searchQuery]);

  const futureEventsCount = useMemo(() => {
    return locationsWithStatus.reduce((total, location) => {
      const events = searchQuery ? location.events.filter(event => {
        const query = searchQuery.toLowerCase();
        return event.title.toLowerCase().includes(query) ||
               event.description.toLowerCase().includes(query) ||
               event.category.toLowerCase().includes(query);
      }) : location.events;
      
      return total + events.filter(event => event.status === 'future').length;
    }, 0);
  }, [locationsWithStatus, searchQuery]);

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
        currentEventsCount={currentEventsCount}
        futureEventsCount={futureEventsCount}
      />

      <div className="space-y-8">
        {filteredLocations.length === 0 ? (
          <div className="py-10 text-center text-ink-muted">
            <p>По этим условиям ничего не идёт.</p>
            <p className="mt-1 text-sm">Сбросьте фильтры или измените запрос — программа длится весь день.</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              events={location.events}
            />
          ))
        )}
      </div>
    </div>
  );
}