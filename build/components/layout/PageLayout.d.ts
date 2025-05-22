import { ReactNode } from "react";
interface PageLayoutProps {
    children: ReactNode;
    fullWidth?: boolean;
}
declare const PageLayout: ({ children, fullWidth }: PageLayoutProps) => import("react/jsx-runtime").JSX.Element;
export default PageLayout;
