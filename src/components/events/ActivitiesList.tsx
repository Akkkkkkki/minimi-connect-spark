import { useEffect, useState } from "react";
import EventCard, { EventCardProps } from "./EventCard";
import EventFilters from "./EventFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

const EventsList = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [joinedEventIds, setJoinedEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fetch all events with participants
        const { data, error } = await supabase
          .from('event')
          .select(`*, event_participant (id, profile_id)`)
          .order('start_time', { ascending: true });
        if (error) throw error;
        let joinedIds = new Set<string>();
        if (isAuthenticated && user) {
          // Find which events the user has joined
          data.forEach((event: any) => {
            if (event.event_participant?.some((p: any) => p.profile_id === user.id)) {
              joinedIds.add(event.id.toString());
            }
          });
        }
        setJoinedEventIds(joinedIds);
        if (data) {
          const processedEvents: EventCardProps[] = data.map(event => {
            const limitedTags = (event.tags || []).slice(0, 5);
            const status = new Date(event.start_time) > new Date() ? 'upcoming' : 'completed';
            return {
              id: event.id.toString(),
              title: event.title,
              description: event.description,
              location: event.location,
              city: event.city,
              country: event.country,
              date: new Date(event.start_time).toLocaleDateString(),
              time: new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              startDateISO: event.start_time,
              participants: {
                current: event.event_participant?.length || 0,
                max: event.applicants_max_number ?? 30
              },
              tags: limitedTags,
              event_type: event.event_type,
              isParticipant: joinedIds.has(event.id.toString()),
              status,
            };
          });
          setEvents(processedEvents);
          setFilteredEvents(processedEvents);
          if (typeof window !== 'undefined') {
            (window as any).eventsForFilter = processedEvents;
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Could not load events");
      } finally {
        setLoading(false);
      }
    };
    if (!isLoading) {
      fetchEvents();
    }
  }, [isAuthenticated, user, isLoading]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredEvents(events);
      return;
    }
    
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredEvents(filtered);
  };

  const handleFilterChange = (filters: Record<string, string | string[]>) => {
    let filtered = [...events];
    // Filter by event type
    if (filters.type && Array.isArray(filters.type) && filters.type.length > 0) {
      filtered = filtered.filter(event => 
        (filters.type as string[]).some(type => event.event_type?.toLowerCase() === type.toLowerCase())
      );
    }
    // Filter by location
    if (filters.location && typeof filters.location === 'string' && filters.location !== '') {
      filtered = filtered.filter(event => {
        const locString = `${event.country} - ${event.city}`;
        return locString === filters.location;
      });
    }
    // Filter by date
    if (filters.date && typeof filters.date === 'string' && filters.date !== '') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let days = 0;
      if (filters.date === 'in_7_days') days = 7;
      else if (filters.date === 'in_14_days') days = 14;
      else if (filters.date === 'in_30_days') days = 30;
      if (days > 0) {
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + days);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDateISO);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today && eventDate <= endDate;
        });
      }
    }
    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <EventFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-1 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EventFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No matching events found</h3>
          <p className="text-gray-500">Try adjusting your filters or search for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} isParticipant={event.isParticipant} status={event.status} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
