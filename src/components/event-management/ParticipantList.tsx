import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { exportTicketHolders } from '@/services/ticketing';

interface ParticipantListProps {
  eventId: string;
}

const ParticipantList = ({ eventId }: ParticipantListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchParticipants() {
      const { data, error } = await exportTicketHolders(eventId);
      if (error) return;
      setParticipants(data.map((t: any) => ({
        id: t.id,
        name: `${t.profile?.first_name || ''} ${t.profile?.last_name || ''}`.trim(),
        email: t.profile?.email || '',
        joinedAt: t.reserved_at,
        status: t.status,
        ticketType: t.ticket_type?.name || '',
      })));
    }
    fetchParticipants();
  }, [eventId]);

  const filteredParticipants = participants.filter(participant => 
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = (id: string) => {
    toast.success("Reminder sent!");
  };

  const handleExport = useCallback(() => {
    if (participants.length === 0) return;
    const header = ['Name', 'Email', 'Ticket Type', 'Status', 'Reserved At'];
    const rows = participants.map(p => [p.name, p.email, p.ticketType, p.status, p.joinedAt]);
    const csv = [header, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}-ticket-holders.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [participants, eventId]);

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
                <TableHead>Ticket Type</TableHead>
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
                    <TableCell>{participant.ticketType}</TableCell>
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
