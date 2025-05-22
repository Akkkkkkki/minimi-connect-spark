import { Calendar, MapPin, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export interface EventCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  city?: string;
  country?: string;
  date: string;
  time: string;
  participants: {
    current: number;
    max: number;
  };
  tags: string[];
  imageUrl?: string;
  isParticipant?: boolean;
  status?: 'upcoming' | 'completed';
  event_type?: string;
  startDateISO?: string;
}

const EventCard = ({
  id,
  title,
  description,
  location,
  city,
  country,
  date,
  time,
  participants,
  tags,
  imageUrl,
  isParticipant = false,
  status = 'upcoming',
}: EventCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const isFull = participants.current >= participants.max;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    navigate(`/events/${id}`);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    if (!isFull && !isParticipant) {
      navigate(`/events/${id}`);
    }
  };

  let buttonText = "Join Event";
  let buttonDisabled = false;
  let buttonVariant = "accent";

  if (!isAuthenticated) {
    buttonText = "Sign in to join event";
    buttonVariant = "outline";
  } else if (isFull) {
    buttonText = "Event Full";
    buttonDisabled = true;
    buttonVariant = "outline";
  } else if (isParticipant) {
    buttonText = "Already Joined";
    buttonDisabled = true;
    buttonVariant = "outline";
  }

  const showJoinButton = status === 'upcoming' && !isParticipant;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${title}`}
    >
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
        <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1 flex items-center">
          {title}
          {isAuthenticated && isParticipant && (
            <CheckCircle className="ml-2 text-green-500" size={18} aria-label="Already joined" />
          )}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{location}, {city}, {country}</span>
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
      </div>
    </div>
  );
};

export default EventCard;
