import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageLayout from "@/components/layout/PageLayout";
import SignupForm from "@/components/auth/SignupForm";
import { Link } from "react-router-dom";
const SignupPage = () => {
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "max-w-md mx-auto", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx(Link, { to: "/", className: "text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text", children: "MINIMI" }), _jsx("h1", { className: "text-2xl font-bold mt-6 mb-2", children: "Join MINIMI" }), _jsx("p", { className: "text-gray-600", children: "Create an account to start connecting" })] }), _jsx(SignupForm, {})] }) }));
};
export default SignupPage;
