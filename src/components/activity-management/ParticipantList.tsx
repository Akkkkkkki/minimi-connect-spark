
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ParticipantListProps {
  activityId: string;
}

const ParticipantList = ({ activityId }: ParticipantListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - would come from Supabase in real implementation
  const participants = [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      joinedAt: "2025-03-10T14:23:00",
      status: "completed",
      matchesReceived: 2
    },
    {
      id: "2",
      name: "Jamie Smith",
      email: "jamie.smith@example.com",
      joinedAt: "2025-03-12T10:05:00",
      status: "pending",
      matchesReceived: 0
    },
    {
      id: "3",
      name: "Riley Chen",
      email: "riley.c@example.com",
      joinedAt: "2025-03-11T16:42:00",
      status: "completed",
      matchesReceived: 1
    },
    {
      id: "4",
      name: "Jordan Smith",
      email: "j.smith@example.com",
      joinedAt: "2025-03-14T09:18:00",
      status: "completed",
      matchesReceived: 2
    },
    {
      id: "5",
      name: "Taylor Wong",
      email: "taylor.w@example.com",
      joinedAt: "2025-03-15T11:32:00",
      status: "pending",
      matchesReceived: 0
    }
  ];

  const filteredParticipants = participants.filter(participant => 
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = (id: string) => {
    toast.success("Reminder sent!");
  };

  const handleExport = () => {
    toast.info("Export functionality not implemented in demo");
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <CardTitle>Participants ({participants.length})</CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleExport}>Export</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No participants found
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell>{new Date(participant.joinedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {participant.status === "completed" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{participant.matchesReceived}</TableCell>
                    <TableCell className="text-right">
                      {participant.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleSendReminder(participant.id)}
                        >
                          Send Reminder
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantList;
