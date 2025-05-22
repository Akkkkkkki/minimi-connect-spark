import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageLayout from "@/components/layout/PageLayout";
import ProfileInfo from "@/components/profile/ProfileInfo";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
const ProfileDashboard = () => {
    const { isLoading } = useAuth();
    if (isLoading) {
        return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6 mt-4", children: [_jsx(Skeleton, { className: "h-10 w-64" }), _jsx("div", { className: "mt-6 space-y-8", children: _jsx(Skeleton, { className: "h-96 w-full" }) })] }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6 mt-4", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Profile Dashboard" }), _jsx(ProfileInfo, {})] }) }));
};
export default ProfileDashboard;
