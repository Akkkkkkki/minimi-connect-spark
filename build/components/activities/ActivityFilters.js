import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
const activityTypes = [
    "Networking", "Dating", "Hobby"
];
const ActivityFilters = ({ onSearch, onFilterChange }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        type: [],
        location: "",
        date: "",
    });
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [locationOptions, setLocationOptions] = useState([]);
    // Dynamically get location options from activities in localStorage (set by ActivitiesList)
    useEffect(() => {
        const activitiesRaw = localStorage.getItem("activities_for_filter");
        if (activitiesRaw) {
            try {
                const activities = JSON.parse(activitiesRaw);
                const locSet = new Set();
                activities.forEach((a) => {
                    if (a.country && a.city) {
                        locSet.add(`${a.country} - ${a.city}`);
                    }
                });
                setLocationOptions(Array.from(locSet));
            }
            catch { }
        }
    }, [showFilters]);
    // When ActivitiesList loads activities, store them for filter use
    useEffect(() => {
        if (window && window.activitiesForFilter) {
            localStorage.setItem("activities_for_filter", JSON.stringify(window.activitiesForFilter));
        }
    }, []);
    const handleSearch = () => {
        onSearch(searchQuery);
    };
    const handleTypeSelect = (type) => {
        const updatedTypes = selectedTypes.includes(type)
            ? selectedTypes.filter(t => t !== type)
            : [...selectedTypes, type];
        setSelectedTypes(updatedTypes);
        const updatedFilters = {
            ...filters,
            type: updatedTypes,
        };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };
    const handleFilterChange = (key, value) => {
        const updatedFilters = {
            ...filters,
            [key]: value,
        };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };
    const removeTypeFilter = (type) => {
        const updatedTypes = selectedTypes.filter(t => t !== type);
        setSelectedTypes(updatedTypes);
        const updatedFilters = {
            ...filters,
            type: updatedTypes,
        };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };
    const clearFilters = () => {
        setSelectedTypes([]);
        setFilters({
            type: [],
            location: "",
            date: "",
        });
        onFilterChange({
            type: [],
            location: "",
            date: "",
        });
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-grow relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx(Input, { placeholder: "Search for activities...", className: "pl-10", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleSearch() })] }), _jsx(Button, { onClick: handleSearch, className: "bg-accent hover:bg-accent/90", children: "Search" }), _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", onClick: () => setShowFilters(!showFilters), children: [_jsx(Filter, { className: "h-4 w-4" }), "Filters"] })] }), showFilters && (_jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-fade-in", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-medium", children: "Filters" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "text-xs h-8 px-2", children: "Clear all" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-1 block", children: "Activity Types" }), _jsx("div", { className: "flex flex-wrap gap-2", children: activityTypes.map((type) => (_jsx(Badge, { variant: selectedTypes.includes(type) ? "default" : "outline", className: `cursor-pointer ${selectedTypes.includes(type)
                                                ? "bg-accent hover:bg-accent/80"
                                                : "hover:bg-accent/10"}`, onClick: () => handleTypeSelect(type), children: type }, type))) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-1 block", children: "Location" }), _jsxs(Select, { onValueChange: (value) => handleFilterChange("location", value), value: filters.location, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select location" }) }), _jsx(SelectContent, { children: locationOptions.map(loc => (_jsx(SelectItem, { value: loc, children: loc }, loc))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-1 block", children: "Date" }), _jsxs(Select, { onValueChange: (value) => handleFilterChange("date", value), value: filters.date, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select date" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "in_7_days", children: "In 7 Days" }), _jsx(SelectItem, { value: "in_14_days", children: "In 14 Days" }), _jsx(SelectItem, { value: "in_30_days", children: "In 30 Days" })] })] })] })] })] }), selectedTypes.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "text-sm font-medium mb-1 block", children: "Active Filters:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedTypes.map((type) => (_jsxs(Badge, { className: "bg-accent", children: [type, _jsx("button", { onClick: () => removeTypeFilter(type), className: "ml-1 hover:text-white/80", children: _jsx(X, { className: "h-3 w-3" }) })] }, type))) })] }))] }))] }));
};
export default ActivityFilters;
