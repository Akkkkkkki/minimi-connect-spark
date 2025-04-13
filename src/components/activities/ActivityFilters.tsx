
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const activityTypes = [
  "Romance", "Networking", "Outdoor", "Sports", "Professional", 
  "Arts", "Food & Drink", "Education", "Tech", "Music"
];

interface ActivityFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, string | string[]>) => void;
}

const ActivityFilters = ({ onSearch, onFilterChange }: ActivityFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string | string[]>>({
    type: [],
    location: "",
    date: "",
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleTypeSelect = (type: string) => {
    const updatedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(updatedTypes);
    
    const updatedFilters = {
      ...filters,
      type: updatedTypes,
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleFilterChange = (key: string, value: string) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const removeTypeFilter = (type: string) => {
    const updatedTypes = selectedTypes.filter(t => t !== type);
    setSelectedTypes(updatedTypes);
    
    const updatedFilters = {
      ...filters,
      type: updatedTypes,
    };
    
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setFilters({
      type: [],
      location: "",
      date: "",
    });
    onFilterChange({
      type: [],
      location: "",
      date: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search for activities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90">
          Search
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs h-8 px-2"
            >
              Clear all
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Activity Types</label>
              <div className="flex flex-wrap gap-2">
                {activityTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTypes.includes(type) 
                        ? "bg-accent hover:bg-accent/80" 
                        : "hover:bg-accent/10"
                    }`}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select 
                  onValueChange={(value) => handleFilterChange("location", value)}
                  value={filters.location as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearby">Nearby</SelectItem>
                    <SelectItem value="new_york">New York</SelectItem>
                    <SelectItem value="san_francisco">San Francisco</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Select 
                  onValueChange={(value) => handleFilterChange("date", value)}
                  value={filters.date as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_weekend">This Weekend</SelectItem>
                    <SelectItem value="next_week">Next Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {selectedTypes.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Active Filters:</label>
              <div className="flex flex-wrap gap-2">
                {selectedTypes.map((type) => (
                  <Badge key={type} className="bg-accent">
                    {type}
                    <button 
                      onClick={() => removeTypeFilter(type)} 
                      className="ml-1 hover:text-white/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFilters;
