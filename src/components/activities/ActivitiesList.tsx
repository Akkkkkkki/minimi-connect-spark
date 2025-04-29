import { useEffect, useState } from "react";
import ActivityCard, { ActivityCardProps } from "./ActivityCard";
import ActivityFilters from "./ActivityFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

const ActivitiesList = () => {
  const [activities, setActivities] = useState<ActivityCardProps[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('activity')
          .select(`
            *,
            activity_participant (
              id
            )
          `)
          .order('start_time', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const processedActivities: ActivityCardProps[] = data.map(activity => {
            // Limit tags to 5
            const limitedTags = (activity.tags || []).slice(0, 5);
            
            return {
              id: activity.id.toString(),
              title: activity.title,
              description: activity.description,
              location: activity.location,
              date: new Date(activity.start_time).toLocaleDateString(),
              time: new Date(activity.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              participants: { 
                current: activity.activity_participant?.length || 0, 
                max: 30 
              },
              tags: limitedTags,
            };
          });
          
          setActivities(processedActivities);
          setFilteredActivities(processedActivities);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Could not load activities");
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredActivities(activities);
      return;
    }
    
    const filtered = activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(query.toLowerCase()) ||
        activity.description.toLowerCase().includes(query.toLowerCase()) ||
        activity.location.toLowerCase().includes(query.toLowerCase()) ||
        activity.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredActivities(filtered);
  };

  const handleFilterChange = (filters: Record<string, string | string[]>) => {
    let filtered = [...activities];
    
    // Filter by activity type
    if (filters.type && Array.isArray(filters.type) && filters.type.length > 0) {
      filtered = filtered.filter(activity => 
        activity.tags.some(tag => (filters.type as string[]).includes(tag))
      );
    }
    
    // Filter by location
    if (filters.location && typeof filters.location === 'string' && filters.location !== '') {
      filtered = filtered.filter(activity => {
        if (filters.location === 'nearby') {
          return true; // In a real app, we'd use geolocation
        }
        return activity.location.toLowerCase().includes((filters.location as string).toLowerCase());
      });
    }
    
    // Filter by date
    if (filters.date && typeof filters.date === 'string' && filters.date !== '') {
      // This would be implemented with real date filtering in a production app
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        
        if (filters.date === 'today') {
          return activityDate.toDateString() === today.toDateString();
        } else if (filters.date === 'tomorrow') {
          return activityDate.toDateString() === tomorrow.toDateString();
        } else if (filters.date === 'week') {
          return activityDate > today && activityDate <= nextWeek;
        }
        return true;
      });
    }
    
    setFilteredActivities(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <ActivityFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
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
      <ActivityFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
      
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No matching activities found</h3>
          <p className="text-gray-500">Try adjusting your filters or search for something else</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesList;
