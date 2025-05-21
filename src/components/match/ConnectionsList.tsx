import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

interface MatchesListProps {
  activityId: string;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface MatchData {
  id: number;
  match_score: number;
  match_reason_1: string | null;
  match_reason_2: string | null;
  icebreaker_1: string | null;
  icebreaker_2: string | null;
  profile_id_1: string;
  profile_id_2: string;
  profile: Profile;
  match_feedback: any[];
}

interface Match {
  id: string;
  name: string;
  avatar?: string;
  matchReason: string;
  matchScore: number;
  conversationStarter: string;
  hasResponded: boolean;
}

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=32";
function getValidAvatarUrl(avatar?: string | null): string {
  if (!avatar || typeof avatar !== "string" || avatar.trim() === "") return DEFAULT_AVATAR;
  if (/^https?:\/\//.test(avatar)) return avatar;
  return `https://uiswjpjgxsrnfxerzbrw.supabase.co/storage/v1/object/public/user/profile/${avatar}`;
}

const MatchesList = ({ activityId }: MatchesListProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        let query = supabase
          .from('match')
          .select(`
            id,
            match_score,
            match_reason_1,
            match_reason_2,
            icebreaker_1,
            icebreaker_2,
            profile_id_1,
            profile_id_2,
            profile:profile_id_2 (id, first_name, last_name, avatar_url),
            match_feedback (
              id
            )
          `)
          .eq('profile_id_1', user.id);
          
        if (activityId && activityId !== 'all') {
          // First get the round ids for the activity
          const { data: rounds, error: roundsError } = await supabase
            .from('match_round')
            .select('id')
            .eq('activity_id', parseInt(activityId));
            
          if (roundsError) throw roundsError;
          
          if (rounds && rounds.length > 0) {
            const roundIds = rounds.map((r: any) => r.id);
            query = query.in('round_id', roundIds);
          }
        }
        
        // Execute the query to get matches
        const { data, error } = await query;
        
        if (error) throw error;
        
        // If we have matches, fetch the profile data separately (avoids RLS issues)
        const profileIds = data?.map(match => match.profile_id_2) || [];
        let profileData = {};
        
        if (profileIds.length > 0) {
          const { data: profiles, error: profileError } = await supabase
            .from('profile')
            .select('id, first_name, last_name, avatar_url')
            .in('id', profileIds);
            
          if (profileError) {
            console.error("Error fetching profiles:", profileError);
          } else if (profiles) {
            // Create a lookup object for easy access
            profileData = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }
        
        const processedMatches: Match[] = [];
        
        if (data) {
          for (const match of data) {
            const profile = profileData[match.profile_id_2] || match.profile;
            if (profile) {
              processedMatches.push({
                id: match.id.toString(),
                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User',
                avatar: profile.avatar_url || undefined,
                matchReason: match.match_reason_1 || 'You seem to be compatible based on your answers.',
                matchScore: match.match_score,
                conversationStarter: match.icebreaker_1 || 'What brings you to this activity?',
                hasResponded: match.match_feedback && match.match_feedback.length > 0
              });
            }
          }
        }
        
        setMatches(processedMatches);
      } catch (error) {
        // Log detailed error information for debugging
        console.error("ConnectionsList Error:", {
          error,
          user: user?.id,
          activityId,
          // Log the raw query for debugging
          query: `match table with profile_id_1=${user?.id} ${activityId && activityId !== 'all' ? 
            `and round_id in [rounds for activity ${activityId}]` : ''}`
        });
        
        // Add informative error for the user
        if (error.code === "PGRST116") {
          toast.error("Permission denied: You don't have access to this data");
        } else if (error.code === "42P01") {
          toast.error("Table not found: Database configuration issue");
        } else {
          toast.error(`Failed to load connections: ${error.message || "Unknown error"}`);
        }
        
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [user, activityId]);

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

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">No matches found for this activity yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These are the people you matched with during this activity.
      </p>
      
      {matches.map((match) => (
        <Card key={match.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getValidAvatarUrl(match.avatar)} alt={match.name} />
                <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{match.name}</h3>
                    <p className="text-sm text-muted-foreground">{match.matchReason}</p>
                  </div>
                  
                  <Badge variant="outline" className="ml-2">
                    {Math.round(match.matchScore * 100)}% Match
                  </Badge>
                </div>
                
                <div className="mt-3 p-3 bg-muted rounded-md text-sm italic">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Conversation starter:</span>{" "}
                    {match.conversationStarter}
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

export default MatchesList;
