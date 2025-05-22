import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
const profileSchema = z.object({
    firstName: z.string().min(2, "First name required"),
    lastName: z.string().min(2, "Last name required"),
    birthMonth: z.string().min(1, "Birth month required"),
    birthYear: z.string().min(4, "Birth year required"),
    city: z.string().min(2, "City required"),
    country: z.string().min(2, "Country required"),
});
const OnboardingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            birthMonth: "",
            birthYear: "",
            city: "",
            country: "",
        },
    });
    useEffect(() => {
        // Just in case, redirect if user is not signed in
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);
    const onSubmit = async (values) => {
        if (!user)
            return;
        const { error } = await supabase
            .from("profile")
            .update({
            first_name: values.firstName,
            last_name: values.lastName,
            birth_month: Number(values.birthMonth),
            birth_year: Number(values.birthYear),
            city: values.city,
            country: values.country,
            updated_at: new Date().toISOString(),
        })
            .eq("id", user.id);
        if (error) {
            toast.error("Could not save profile", {
                description: error.message,
            });
        }
        else {
            toast.success("Profile Complete!", {
                description: "You can update these details anytime in your profile settings.",
            });
            navigate("/"); // Redirect to main page after onboarding
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: _jsx(Card, { className: "w-full max-w-md", children: _jsxs(CardContent, { className: "py-8", children: [_jsx("h1", { className: "text-2xl font-bold mb-4 text-accent", children: "Complete your profile" }), _jsxs("p", { className: "text-muted-foreground mb-6", children: ["You need to finish setting up your profile to use the rest of the app.", _jsx("br", {}), "You can always change these details later!"] }), _jsx(Form, { ...form, children: _jsxs("form", { className: "space-y-4", onSubmit: form.handleSubmit(onSubmit), children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "firstName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "First Name" }), _jsx(FormControl, { children: _jsx(Input, { ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "lastName", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Last Name" }), _jsx(FormControl, { children: _jsx(Input, { ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "birthMonth", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Birth Month" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "MM", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "birthYear", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Birth Year" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "YYYY", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "city", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "City" }), _jsx(FormControl, { children: _jsx(Input, { ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "country", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Country" }), _jsx(FormControl, { children: _jsx(Input, { ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full bg-accent hover:bg-accent/90", children: "Save Profile" })] }) })] }) }) }));
};
export default OnboardingPage;
