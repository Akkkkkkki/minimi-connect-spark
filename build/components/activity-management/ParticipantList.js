import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
const ParticipantList = ({ activityId }) => {
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
    const filteredParticipants = participants.filter(participant => participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleSendReminder = (id) => {
        toast.success("Reminder sent!");
    };
    const handleExport = () => {
        toast.info("Export functionality not implemented in demo");
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0", children: [_jsxs(CardTitle, { children: ["Participants (", participants.length, ")"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search participants...", className: "pl-8", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsx(Button, { variant: "outline", onClick: handleExport, children: "Export" })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Email" }), _jsx(TableHead, { children: "Joined" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Matches" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredParticipants.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "text-center py-4 text-muted-foreground", children: "No participants found" }) })) : (filteredParticipants.map((participant) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: participant.name }), _jsx(TableCell, { children: participant.email }), _jsx(TableCell, { children: new Date(participant.joinedAt).toLocaleDateString() }), _jsx(TableCell, { children: participant.status === "completed" ? (_jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 hover:bg-green-50", children: "Completed" })) : (_jsx(Badge, { variant: "outline", className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50", children: "Pending" })) }), _jsx(TableCell, { children: participant.matchesReceived }), _jsx(TableCell, { className: "text-right", children: participant.status === "pending" && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleSendReminder(participant.id), children: "Send Reminder" })) })] }, participant.id)))) })] }) }) })] }));
};
export default ParticipantList;
