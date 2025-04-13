import { useState } from "react";
import ActivityCard, { ActivityCardProps } from "./ActivityCard";
import ActivityFilters from "./ActivityFilters";

// Mock data for activities
const mockActivities: ActivityCardProps[] = [
  {
    id: "1",
    title: "Hiking Adventure",
    description: "Join us for a weekend hiking trip through beautiful mountain trails. Perfect for nature lovers and photography enthusiasts.",
    location: "Rocky Mountains",
    date: "May 15, 2025",
    time: "8:00 AM",
    participants: { current: 18, max: 24 },
    tags: ["Outdoor", "Sports"]
  },
  {
    id: "2",
    title: "Tech Networking Meetup",
    description: "Connect with professionals from the tech industry. Great opportunity to exchange ideas and build your professional network.",
    location: "Downtown Conference Center",
    date: "June 2, 2025",
    time: "6:30 PM",
    participants: { current: 45, max: 100 },
    tags: ["Networking", "Professional", "Tech"]
  },
  {
    id: "3",
    title: "Speed Dating Night",
    description: "Meet potential romantic partners in a fun, pressure-free environment. Each mini-date lasts just 5 minutes.",
    location: "Moonlight Café",
    date: "May 20, 2025",
    time: "7:00 PM",
    participants: { current: 24, max: 30 },
    tags: ["Romance"]
  },
  {
    id: "4",
    title: "Cooking Workshop",
    description: "Learn to cook authentic Italian cuisine from a professional chef. All ingredients and equipment provided.",
    location: "Culinary Studio",
    date: "June 10, 2025",
    time: "5:00 PM",
    participants: { current: 12, max: 15 },
    tags: ["Food & Drink", "Education"]
  },
  {
    id: "5",
    title: "Live Music Jam Session",
    description: "Bring your instrument or just come to listen. All music styles welcome in this casual jam session.",
    location: "The Blue Note",
    date: "May 25, 2025",
    time: "8:30 PM",
    participants: { current: 15, max: 40 },
    tags: ["Music", "Arts"]
  },
  {
    id: "6",
    title: "Industry Mixer",
    description: "Cross-industry networking event with professionals from finance, tech, healthcare, and more.",
    location: "Grand Hotel",
    date: "June 5, 2025",
    time: "7:00 PM",
    participants: { current: 78, max: 150 },
    tags: ["Networking", "Professional"]
  },
];

const ActivitiesList = () => {
  const [activities, setActivities] = useState(mockActivities);
  const [filteredActivities, setFilteredActivities] = useState(mockActivities);

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
      // For demo purposes, we'll just filter by exact match
      // In a real app, you might use more sophisticated location filtering
      filtered = filtered.filter(activity => {
        if (filters.location === 'nearby') {
          return true; // In a real app, we'd use geolocation
        }
        
        const locationMap: Record<string, string> = {
          'new_york': 'New York',
          'san_francisco': 'San Francisco',
          'london': 'London',
          'tokyo': 'Tokyo',
        };
        
        return activity.location.includes(locationMap[filters.location as string] || '');
      });
    }
    
    // Filter by date
    if (filters.date && typeof filters.date === 'string' && filters.date !== '') {
      // This would be implemented with real date filtering in a production app
      // For now, we'll just keep all activities
    }
    
    setFilteredActivities(filtered);
  };

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
