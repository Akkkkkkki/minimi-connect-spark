import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Heart, Menu, X, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/supabase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
const Header = () => {
    const isMobile = useIsMobile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const navItems = [
        { label: "Home", path: "/" },
        { label: "All Activities", path: "/activities" },
        { label: "How It Works", path: "/how-it-works" }
    ];
    const authenticatedNavItems = [
        { label: "Profile", path: "/profile" },
        { label: "My Activities", path: "/my-activities" },
        { label: "Matches", path: "/matches" },
        { label: "Organizer Portal", path: "/activity-management" }
    ];
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    const handleSignOut = async () => {
        await signOut();
        navigate("/");
        closeMenu();
    };
    const isActive = (path) => {
        return location.pathname === path;
    };
    return (_jsxs("header", { className: "fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-30", children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 md:px-6", children: _jsxs("div", { className: "flex justify-between items-center py-4 md:py-6", children: [_jsxs(Link, { to: "/", className: "flex items-center space-x-2 z-10", onClick: closeMenu, children: [_jsx(Heart, { className: "h-6 w-6 text-[#6C5CE7]" }), _jsx("span", { className: "font-bold text-xl", children: "MINIMI" })] }), isMobile ? (_jsx("div", { className: "flex items-center", children: _jsx("button", { onClick: toggleMenu, className: "text-gray-700 hover:text-gray-900 focus:outline-none", "aria-label": "Toggle menu", children: isMenuOpen ? _jsx(X, { size: 24 }) : _jsx(Menu, { size: 24 }) }) })) : (_jsxs("nav", { className: "flex items-center space-x-1", children: [_jsxs("div", { className: "hidden md:flex items-center space-x-1", children: [navItems.map((item) => (_jsx(Link, { to: item.path, className: cn("px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors", isActive(item.path) ? "font-medium text-black" : "text-gray-500"), children: item.label }, item.path))), isAuthenticated && authenticatedNavItems.map((item) => (_jsx(Link, { to: item.path, className: cn("px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors", isActive(item.path) ? "font-medium text-black" : "text-gray-500"), children: item.label }, item.path)))] }), _jsx("div", { className: "hidden md:flex items-center space-x-3", children: isAuthenticated ? (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(UserCircle, { size: 18 }), _jsx("span", { children: user?.user_metadata?.name || 'Account' })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: "My Account" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { onClick: () => navigate("/profile"), children: "Profile" }), _jsx(DropdownMenuItem, { onClick: () => navigate("/my-activities"), children: "My Activities" }), _jsx(DropdownMenuItem, { onClick: () => navigate("/matches"), children: "Matches" }), _jsx(DropdownMenuItem, { onClick: () => navigate("/activity-management"), children: "Organizer Portal" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { onClick: handleSignOut, children: "Sign Out" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => navigate("/login"), children: "Sign In" }), _jsx(Button, { onClick: () => navigate("/signup"), children: "Sign Up" })] })) })] }))] }) }), isMobile && isMenuOpen && (_jsx("div", { className: "md:hidden absolute top-[64px] left-0 right-0 bg-white border-b border-gray-200 z-20", children: _jsxs("div", { className: "flex flex-col p-4 space-y-3", children: [navItems.map((item) => (_jsx(Link, { to: item.path, onClick: closeMenu, className: cn("px-3 py-2.5 rounded-md text-base hover:bg-gray-100 transition-colors", isActive(item.path) ? "font-medium text-black" : "text-gray-500"), children: item.label }, item.path))), isAuthenticated && authenticatedNavItems.map((item) => (_jsx(Link, { to: item.path, onClick: closeMenu, className: cn("px-3 py-2.5 rounded-md text-base hover:bg-gray-100 transition-colors", isActive(item.path) ? "font-medium text-black" : "text-gray-500"), children: item.label }, item.path))), _jsx("div", { className: "pt-2 border-t border-gray-100", children: isAuthenticated ? (_jsx(Button, { className: "w-full mt-2", variant: "outline", onClick: handleSignOut, children: "Sign Out" })) : (_jsxs(_Fragment, { children: [_jsx(Button, { className: "w-full", variant: "outline", onClick: () => {
                                            closeMenu();
                                            navigate("/login");
                                        }, children: "Sign In" }), _jsx(Button, { className: "w-full mt-2", onClick: () => {
                                            closeMenu();
                                            navigate("/signup");
                                        }, children: "Sign Up" })] })) })] }) }))] }));
};
export default Header;
