import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MatchRoundsProps {
  eventId: string;
}

const MatchRounds = ({ eventId }: MatchRoundsProps) => {
  // Mock data - would come from Supabase in real implementation
  const rounds = [
    {
      id: "1",
      name: "Round 1 - Initial Matches",
      scheduledTime: "2025-04-20T09:30:00",
      status: "completed",
      participantsMatched: 12,
      totalMatches: 6
    },
    {
      id: "2",
      name: "Round 2 - Professional Focus",
      scheduledTime: "2025-04-20T11:00:00",
      status: "scheduled",
      participantsMatched: 0,
      totalMatches: 0
    }
  ];

  const handleRunNow = (id: string) => {
    toast.success("Match round started!");
  };

  const handleCreateRound = (data: { name: string; scheduledTime: string }) => {
    toast.success("New round created!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Match Rounds</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              New Round
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Match Round</DialogTitle>
              <DialogDescription>
                Create a new match round for this event. You can schedule it for later or run it immediately.
              </DialogDescription>
            </DialogHeader>
            <NewRoundForm onSubmit={handleCreateRound} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {rounds.map((round) => (
          <Card key={round.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{round.name}</h3>
                    {round.status === "completed" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Completed
                      </Badge>
                    ) : (
                      <Badge>Scheduled</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Scheduled for: {new Date(round.scheduledTime).toLocaleString()}
                  </div>
                  {round.status === "completed" && (
                    <div className="flex flex-col space-y-1 mt-3 text-sm">
                      <div>
                        <span className="font-medium">Participants matched:</span> {round.participantsMatched}
                      </div>
                      <div>
                        <span className="font-medium">Total matches:</span> {round.totalMatches}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {round.status !== "completed" && (
                    <Button onClick={() => handleRunNow(round.id)}>
                      <Play size={16} className="mr-2" />
                      Run Now
                    </Button>
                  )}
                  {round.status === "completed" && (
                    <Button variant="outline">View Results</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface NewRoundFormProps {
  onSubmit: (data: { name: string; scheduledTime: string }) => void;
}

const NewRoundForm = ({ onSubmit }: NewRoundFormProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledTime = `${date}T${time}:00`;
    onSubmit({ name, scheduledTime });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Round Name</Label>
        <Input 
          id="name" 
          placeholder="e.g., Round 3 - Interest-Based Matches" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input 
            id="time" 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            required
          />
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Create Round</Button>
      </DialogFooter>
    </form>
  );
};

export default MatchRounds;
