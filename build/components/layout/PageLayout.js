import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Header from "./Header";
import Footer from "./Footer";
const PageLayout = ({ children, fullWidth = false }) => {
    return (_jsxs("div", { className: "flex flex-col min-h-screen", children: [_jsx(Header, {}), _jsx("main", { className: "flex-grow pt-28", children: _jsx("div", { className: `${fullWidth ? '' : 'max-w-7xl mx-auto px-4 md:px-6'} py-8`, children: children }) }), _jsx(Footer, {})] }));
};
export default PageLayout;
