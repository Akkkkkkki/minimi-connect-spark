
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  participants: {
    current: number;
    max: number;
  };
  tags: string[];
  imageUrl?: string;
}

const ActivityCard = ({
  id,
  title,
  description,
  location,
  date,
  time,
  participants,
  tags,
  imageUrl,
}: ActivityCardProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute top-3 left-3 z-10 flex space-x-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-white/80 backdrop-blur-sm">
              {tag}
            </Badge>
          ))}
        </div>
        
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent">
            {title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{date} • {time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {participants.current}/{participants.max} participants
            </span>
          </div>
        </div>
        
        <Button className="w-full bg-accent hover:bg-accent/90">
          Join Activity
        </Button>
      </div>
    </div>
  );
};

export default ActivityCard;
