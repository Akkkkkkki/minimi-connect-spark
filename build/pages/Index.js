import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
const Index = () => {
    return (_jsxs(PageLayout, { fullWidth: true, children: [_jsx(Hero, {}), _jsx(Features, {}), _jsx(HowItWorks, {}), _jsx(Testimonials, {}), _jsx(CTA, {})] }));
};
export default Index;
