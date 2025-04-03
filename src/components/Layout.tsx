import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { LogoIcon } from "./ui/logo-icon";
import { Link } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { currentTheme, isDark } = useTheme();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const pageVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-5 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/20 to-transparent rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/20 to-transparent rounded-full"></div>
      </div>
      
      {/* Enhanced sidebar */}
      <div 
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-card transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:w-16" : "md:w-72"
        )}
      >
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r border-border bg-background h-full">
          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
            <Link to="/" className="flex items-center">
              <LogoIcon className="w-8 h-8 logo-hover animate-float-gentle" />
            </Link>
          </div>
          <Sidebar collapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        </div>
      </div>
      
      {/* Main content */}
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-72"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            className={cn(
              "flex-1 relative",
              location.pathname === "/calendar" ? "!p-0" : "p-6 md:p-8"
            )}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.2 }}
          >
            {/* Ambient background elements */}
            <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
              <div className="absolute -bottom-[40%] -right-[30%] w-[80%] h-[80%] rounded-full bg-primary/5" />
              <div className="absolute top-[10%] -left-[20%] w-[60%] h-[60%] rounded-full bg-primary/5" />
              <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/70 to-background/90"></div>
              <div className="absolute inset-0 bg-[url('/images/subtle-pattern.svg')] opacity-5"></div>
            </div>
            
            {/* Content container */}
            <div className="relative z-10 max-w-6xl mx-auto">
              <div className="absolute inset-0 bg-background/90 rounded-xl border border-border/20 shadow-lg -m-1"></div>
              <div className="relative">
                {children}
              </div>
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;
