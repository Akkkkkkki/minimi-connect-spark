import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";

interface ConnectionsListProps {
  activityId: string;
}

interface Connection {
  id: string;
  name: string;
  avatar?: string;
  matchReason: string;
  matchScore: number;
  conversationStarter: string;
  hasResponded: boolean;
}

const ConnectionsList = ({ activityId }: ConnectionsListProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching connections
    const fetchConnections = async () => {
      setLoading(true);
      
      // Mock data
      const mockConnections: Connection[] = [
        {
          id: "c1",
          name: "Alex Thompson",
          matchReason: "You both share interests in technology, startups, and hiking.",
          matchScore: 85,
          conversationStarter: "Alex mentioned they just launched a new app. Ask them about their experience with the development process!",
          hasResponded: true
        },
        {
          id: "c2",
          name: "Jordan Lee",
          matchReason: "You both work in similar industries and enjoy outdoor activities.",
          matchScore: 72,
          conversationStarter: "Jordan recently moved from New York. Ask them how they're finding the change!",
          hasResponded: false
        },
        {
          id: "c3",
          name: "Sam Rivera",
          matchReason: "You both are interested in AI and machine learning technologies.",
          matchScore: 90,
          conversationStarter: "Sam just finished a project using neural networks. Ask them about the challenges they faced!",
          hasResponded: true
        }
      ];
      
      // Simulate network delay
      setTimeout(() => {
        setConnections(mockConnections);
        setLoading(false);
      }, 600);
    };
    
    fetchConnections();
  }, [activityId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No connections found for this activity yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These are the people you connected with during this activity.
      </p>
      
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {connection.avatar ? (
                  <AvatarImage src={connection.avatar} alt={connection.name} />
                ) : (
                  <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{connection.name}</h3>
                    <p className="text-sm text-muted-foreground">{connection.matchReason}</p>
                  </div>
                  
                  <Badge variant="outline" className="ml-2">
                    {connection.matchScore}% Match
                  </Badge>
                </div>
                
                <div className="mt-3 p-3 bg-muted rounded-md text-sm italic">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Conversation starter:</span>{" "}
                    {connection.conversationStarter}
                  </p>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConnectionsList; 