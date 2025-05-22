import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
const activitySchema = z.object({
    title: z.string().min(3, {
        message: "Title must be at least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    location: z.string().min(3, {
        message: "Location is required.",
    }),
    city: z.string().min(2, { message: "City is required." }),
    country: z.string().min(2, { message: "Country is required." }),
    startDate: z.string().min(1, {
        message: "Start date is required.",
    }),
    startTime: z.string().min(1, {
        message: "Start time is required.",
    }),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    activityType: z.string().min(1, {
        message: "Activity type is required.",
    }),
    tags: z.string().optional(),
    maxParticipants: z.coerce.number().min(2, { message: "At least 2 participants." }).optional(),
});
const EditActivity = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const form = useForm({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            city: "",
            country: "",
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: "",
            activityType: "social",
            tags: "",
            maxParticipants: 30,
        },
    });
    useEffect(() => {
        const fetchActivity = async () => {
            if (!id)
                return;
            setLoading(true);
            const { data, error } = await supabase
                .from("activity")
                .select("*")
                .eq("id", id)
                .single();
            if (error || !data) {
                toast.error("Failed to load activity");
                setLoading(false);
                return;
            }
            // Parse start/end date/time
            const start = new Date(data.start_time);
            let endDate = "";
            let endTime = "";
            if (data.end_time) {
                const end = new Date(data.end_time);
                endDate = end.toISOString().slice(0, 10);
                endTime = end.toTimeString().slice(0, 5);
            }
            form.reset({
                title: data.title || "",
                description: data.description || "",
                location: data.location || "",
                city: data.city || "",
                country: data.country || "",
                startDate: start.toISOString().slice(0, 10),
                startTime: start.toTimeString().slice(0, 5),
                endDate,
                endTime,
                activityType: data.activity_type || "social",
                tags: (data.tags || []).join(", ") || "",
                maxParticipants: data.max_participants || 30,
            });
            setLoading(false);
        };
        fetchActivity();
        // eslint-disable-next-line
    }, [id]);
    const onSubmit = async (values) => {
        if (!user) {
            toast.error("You must be logged in to edit an activity");
            return;
        }
        setIsSubmitting(true);
        try {
            const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
            let endDateTime = null;
            if (values.endDate && values.endTime) {
                endDateTime = new Date(`${values.endDate}T${values.endTime}`);
            }
            const tagsList = values.tags ? values.tags.split(",").map((tag) => tag.trim()) : [];
            const { error } = await supabase
                .from("activity")
                .update({
                title: values.title,
                description: values.description,
                location: values.location,
                city: values.city,
                country: values.country,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime ? endDateTime.toISOString() : null,
                activity_type: values.activityType,
                tags: tagsList,
                max_participants: values.maxParticipants,
            })
                .eq("id", id);
            if (error)
                throw error;
            toast.success("Activity updated successfully!");
            navigate("/activity-management");
        }
        catch (error) {
            console.error("Error updating activity:", error);
            toast.error("Failed to update activity", {
                description: "Please try again later.",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Edit Activity" }), _jsx("p", { className: "text-gray-600 text-lg max-w-3xl", children: "Update your activity details below." }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: loading ? (_jsx("div", { className: "text-center py-12", children: "Loading..." })) : (_jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsx(FormField, { control: form.control, name: "title", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Activity Title" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "e.g., Networking Coffee Meetup", ...field }) }), _jsx(FormDescription, { children: "Choose a clear, descriptive title for your activity." }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Describe what the activity involves and what participants can expect...", className: "min-h-32", ...field }) }), _jsx(FormDescription, { children: "Provide details about your activity, including purpose and expectations." }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "location", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Location" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "e.g., Central Park, New York", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "city", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "City" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "e.g., New York", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "country", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Country" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "e.g., USA", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "activityType", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Activity Type" }), _jsx(FormControl, { children: _jsxs("select", { className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", ...field, children: [_jsx("option", { value: "social", children: "Social" }), _jsx("option", { value: "professional", children: "Professional" }), _jsx("option", { value: "dating", children: "Dating" }), _jsx("option", { value: "hobby", children: "Hobby" }), _jsx("option", { value: "sports", children: "Sports" })] }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "startDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Start Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "startTime", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Start Time" }), _jsx(FormControl, { children: _jsx(Input, { type: "time", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "endDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "End Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "endTime", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "End Time" }), _jsx(FormControl, { children: _jsx(Input, { type: "time", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "maxParticipants", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Max Participants" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: 2, ...field }) }), _jsx(FormDescription, { children: "Maximum number of participants allowed (default: 30)" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "tags", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Tags (comma-separated)" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "e.g., networking, startup, tech", ...field }) }), _jsx(FormDescription, { children: "Add relevant tags to help users find your activity" }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex justify-end gap-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate("/activity-management"), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? "Saving..." : "Save Changes" })] })] }) })) }) })] }) }));
};
export default EditActivity;
