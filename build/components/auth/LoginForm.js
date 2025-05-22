import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});
const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = async (values) => {
        try {
            setIsLoading(true);
            const { error } = await signInWithEmail(values.email, values.password);
            if (error) {
                toast.error(`Login failed: ${error.message}`);
                return;
            }
            toast.success("Logged in successfully!");
            navigate('/');
        }
        catch (err) {
            toast.error(`Login error: ${err.message}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-xl p-6 md:p-8 shadow-sm", children: [_jsx("h2", { className: "text-2xl font-bold text-center mb-6", children: "Welcome Back" }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, { type: "email", placeholder: "your.email@example.com", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(FormLabel, { children: "Password" }), _jsx(Link, { to: "/forgot-password", className: "text-sm text-accent hover:underline", children: "Forgot password?" })] }), _jsx(FormControl, { children: _jsxs("div", { className: "relative", children: [_jsx(Input, { type: showPassword ? "text" : "password", placeholder: "Enter your password", ...field }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700", children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) })] }) }), _jsx(FormMessage, {})] })) }), _jsx("div", { className: "pt-2", children: _jsx(Button, { type: "submit", className: "w-full bg-accent hover:bg-accent/90", disabled: isLoading, children: isLoading ? "Logging in..." : "Log in" }) }), _jsxs("div", { className: "text-center text-sm text-gray-500", children: ["Don't have an account?", " ", _jsx(Link, { to: "/signup", className: "text-accent hover:underline", children: "Sign up" })] })] }) })] }));
};
export default LoginForm;
