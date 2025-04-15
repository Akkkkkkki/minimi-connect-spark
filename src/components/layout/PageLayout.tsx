
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

const PageLayout = ({ children, fullWidth = false }: PageLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-28">
        <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto px-4 md:px-6'} py-8`}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
