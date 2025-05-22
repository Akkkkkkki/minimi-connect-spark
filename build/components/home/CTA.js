import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const CTA = () => {
    return (_jsx("section", { className: "py-16 md:py-24 bg-accent", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-6", children: "Ready to find your meaningful connections?" }), _jsx("p", { className: "text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10", children: "Join thousands of users who are already finding compatible matches for dating, networking, and activities." }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-4", children: [_jsx(Link, { to: "/signup", children: _jsxs(Button, { size: "lg", className: "bg-white text-accent hover:bg-gray-100 w-full sm:w-auto", children: ["Create Your Free Account ", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) }), _jsx(Link, { to: "/activities", children: _jsx(Button, { size: "lg", variant: "outline", className: "border-white text-white hover:bg-white/10 w-full sm:w-auto", children: "Browse Activities" }) })] })] }) }) }));
};
export default CTA;
