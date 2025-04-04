import { ReactNode, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { LogoIcon } from "./ui/logo-icon";
import { Link} from "react-router-dom";
import { Menu } from "lucide-react";

type LayoutProps = {
  children: ReactNode;
};


const Layout = ({ children }: LayoutProps) => {
  const { currentTheme, isDark } = useTheme();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div className="flex min-h-screen bg-background ">
        {/* Mobile hamburger button */}
        <button
        className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-md border border-border/50"
        onClick={toggleSidebar}
        >
        <Menu size={20} />
        </button>
      {/* Background decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-3 z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/20 to-transparent rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/20 to-transparent rounded-full"></div>
      </div>
      
        {/* Enhanced sidebar */}
        <div
          ref={sidebarRef}
          className={cn(
            "md:flex md:flex-col md:fixed md:inset-y-0 bg-card transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "md:w-20" : "md:w-64",
            isSidebarOpen ? "w-64 z-50" : "w-0 md:w-auto z-50 hidden md:block"
          )}
        >
          <div className="flex flex-col flex-grow px-2 pt-5 overflow-y-auto border-r border-border bg-background h-full">
            <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
              <Link to="/" className="flex items-center ">
                <LogoIcon className="w-8 h-8 logo-hover animate-float-gentle" />
              </Link>
            </div>
            <Sidebar
              collapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            
          </div>
        </div>
      
      {/* Main content */}
      <div 
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
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
