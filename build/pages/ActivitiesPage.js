import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageLayout from "@/components/layout/PageLayout";
import ActivitiesList from "@/components/activities/ActivitiesList";
const AllActivitiesPage = () => {
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "All Activities" }), _jsx("p", { className: "text-gray-600 text-lg max-w-2xl", children: "Discover and join activities that match your interests. From romantic encounters to professional networking, find the perfect event to connect with like-minded people." }), _jsx(ActivitiesList, {})] }) }));
};
export default AllActivitiesPage;
