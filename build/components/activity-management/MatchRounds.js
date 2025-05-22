import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const MatchRounds = ({ activityId }) => {
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
    const handleRunNow = (id) => {
        toast.success("Match round started!");
    };
    const handleCreateRound = (data) => {
        toast.success("New round created!");
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Match Rounds" }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Round"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Match Round" }), _jsx(DialogDescription, { children: "Create a new match round for this activity. You can schedule it for later or run it immediately." })] }), _jsx(NewRoundForm, { onSubmit: handleCreateRound })] })] })] }), _jsx("div", { className: "space-y-4", children: rounds.map((round) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-lg font-medium", children: round.name }), round.status === "completed" ? (_jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 hover:bg-green-50", children: "Completed" })) : (_jsx(Badge, { children: "Scheduled" }))] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Scheduled for: ", new Date(round.scheduledTime).toLocaleString()] }), round.status === "completed" && (_jsxs("div", { className: "flex flex-col space-y-1 mt-3 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Participants matched:" }), " ", round.participantsMatched] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total matches:" }), " ", round.totalMatches] })] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [round.status !== "completed" && (_jsxs(Button, { onClick: () => handleRunNow(round.id), children: [_jsx(Play, { size: 16, className: "mr-2" }), "Run Now"] })), round.status === "completed" && (_jsx(Button, { variant: "outline", children: "View Results" }))] })] }) }) }, round.id))) })] }));
};
const NewRoundForm = ({ onSubmit }) => {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        const scheduledTime = `${date}T${time}:00`;
        onSubmit({ name, scheduledTime });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "name", children: "Round Name" }), _jsx(Input, { id: "name", placeholder: "e.g., Round 3 - Interest-Based Matches", value: name, onChange: (e) => setName(e.target.value), required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "date", children: "Date" }), _jsx(Input, { id: "date", type: "date", value: date, onChange: (e) => setDate(e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "time", children: "Time" }), _jsx(Input, { id: "time", type: "time", value: time, onChange: (e) => setTime(e.target.value), required: true })] })] }), _jsxs(DialogFooter, { className: "mt-4", children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { type: "button", variant: "outline", children: "Cancel" }) }), _jsx(Button, { type: "submit", children: "Create Round" })] })] }));
};
export default MatchRounds;
