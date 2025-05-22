import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
const ActivityCard = ({ id, title, description, location, city, country, date, time, participants, tags, imageUrl, isParticipant = false, status = 'upcoming', }) => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const isFull = participants.current >= participants.max;
    const handleCardClick = (e) => {
        if (e.target.closest("button"))
            return;
        navigate(`/activities/${id}`);
    };
    const handleJoinClick = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate("/signup");
            return;
        }
        if (!isFull && !isParticipant) {
            navigate(`/activities/${id}`);
        }
    };
    let buttonText = "Join Activity";
    let buttonDisabled = false;
    let buttonVariant = "accent";
    if (!isAuthenticated) {
        buttonText = "Sign in to join activity";
        buttonVariant = "outline";
    }
    else if (isFull) {
        buttonText = "Event Full";
        buttonDisabled = true;
        buttonVariant = "outline";
    }
    else if (isParticipant) {
        buttonText = "Already Joined";
        buttonDisabled = true;
        buttonVariant = "outline";
    }
    const showJoinButton = status === 'upcoming' && !isParticipant;
    return (_jsxs("div", { className: "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer", onClick: handleCardClick, tabIndex: 0, role: "button", "aria-label": `View details for ${title}`, children: [_jsxs("div", { className: "h-48 bg-gray-200 relative", children: [_jsx("div", { className: "absolute top-3 left-3 z-10 flex space-x-2", children: tags.map((tag, index) => (_jsx(Badge, { variant: "outline", className: "bg-white/80 backdrop-blur-sm", children: tag }, index))) }), imageUrl ? (_jsx("img", { src: imageUrl, alt: title, className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent", children: title.charAt(0).toUpperCase() }))] }), _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "text-lg font-semibold text-primary mb-2 line-clamp-1 flex items-center", children: [title, isAuthenticated && isParticipant && (_jsx(CheckCircle, { className: "ml-2 text-green-500", size: 18, "aria-label": "Already joined" }))] }), _jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-2", children: description }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx(MapPin, { className: "h-4 w-4 mr-2 flex-shrink-0" }), _jsxs("span", { className: "truncate", children: [location, ", ", city, ", ", country] })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2 flex-shrink-0" }), _jsxs("span", { children: [date, " \u2022 ", time] })] }), _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx(Users, { className: "h-4 w-4 mr-2 flex-shrink-0" }), _jsxs("span", { children: [participants.current, "/", participants.max, " participants"] })] })] })] })] }));
};
export default ActivityCard;
