import { useState, useEffect, ReactNode, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookText, 
  FileText, 
  Target, 
  LineChart, 
  Settings, 
  History,
  HeartPulse,
  ImageDown,
  ChevronLeft,
  ChevronRight,
  Quote,
  Skull,
  Sword,
  Shield,
  Flame,
  Menu,
  X,
  CheckCircle2,
  UserCircle,
  LogIn,
  UserPlus,
  Moon,
  Sun,
  Palette,
  Scroll,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getHistory } from "@/utils/historyUtils";
import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/components/Sidebar/ProfileSection";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  
} from "@/components/ui/dropdown-menu"

const warriorQuotes = [
  "Winter is coming.",
  "The man who passes the sentence should swing the sword.",
  "I am the sword in the darkness.",
  "The night is dark and full of terrors.",
  "A man can only be brave when he is afraid.",
  "There is only one thing we say to death: not today."
];

interface HistoryItem {
  id: string;
  type: string;
  action: string;
  name: string;
  details?: string;
  timestamp: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  status: 'pending' | 'completed';
  dueDate?: string;
}

interface Habit {
  id: string;
  frequency: string;
  completedDates: string[];
}

interface Goal {
  id: string;
  status: string;
  progress: number;
  target: number;
}

interface NavItemProps {
  item: {
    id: string;
    icon: ReactNode;
    label: string;
    path: string;
    count: number | null;
  };
  isActive: boolean;
  collapsed: boolean;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
}

const NavItem = ({ item, isActive, collapsed, hoveredItem, setHoveredItem }: NavItemProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative"
      key={item.id}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      whileHover={{ x: collapsed ? 0 : 5 }}
      transition={{ duration: 0.2 }}
    >
      <a 
        href={item.path}
        onClick={(e) => {
          e.preventDefault();
          navigate(item.path);
        }}
        className={cn(
          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium",
          "hover:bg-primary/10 hover:shadow-inner-glow",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isActive 
            ? "bg-primary/15 text-foreground shadow-inner-glow" 
            : "text-muted-foreground hover:text-foreground"
            
        )}
        >
         <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: hoveredItem === item.id || isActive ? 1.15 : 1,
            rotate: hoveredItem === item.id || isActive ? 5 : 0
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-shrink-0 mr-2",
            collapsed && "mr-0",
            isActive && "text-primary drop-shadow-glow"
          )}>

          {item.icon}
        </motion.div>
        {!collapsed && (
          <motion.span className="flex-1 truncate">
            {item.label}
          </motion.span>
        )}


        {!collapsed && item.count !== null && (
          <Badge 
            variant="default" 
            className={cn(
              "ml-auto text-[10px] h-5 px-1.5",
              "bg-primary/15 text-primary",
              "animate-pulse-soft"
            )}
          >
            {item.count}
          </Badge>
          )}
      </a>
      
      {isActive && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
          layoutId="activeIndicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      </motion.div>
  );
};

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ collapsed = false, onToggleCollapse }: SidebarProps) => {
  const { currentTheme, isDark, toggleDarkMode, changeAccentColor } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const authContext = useAuth();
  const currentUser = authContext?.currentUser || null;
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [todayActivityCount, setTodayActivityCount] = useState(0);
  const [pendingGoalsCount, setPendingGoalsCount] = useState(0);
  const [pendingHabitsCount, setPendingHabitsCount] = useState(0);
  const [pendingTodosCount, setPendingTodosCount] = useState(0);
  const [currentQuote, setCurrentQuote] = useState("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Close mobile nav when location changes
  useEffect(() => {
      setIsMobileNavOpen(false);
  }, [location]);

  // Update quote periodically
  useEffect(() => {
    const randomQuote = warriorQuotes[Math.floor(Math.random() * warriorQuotes.length)];
    setCurrentQuote(randomQuote);

    const interval = setInterval(() => {
      const newQuote = warriorQuotes[Math.floor(Math.random() * warriorQuotes.length)];
      setCurrentQuote(newQuote);
    }, 60000); // Change quote every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      // Count today's activity for badges
    const history = getHistory();
    const today = new Date().toISOString().split('T')[0];
    
    const todayHistory = history.filter((item: HistoryItem) => {
      const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
      return itemDate === today;
    });
    
    setTodayActivityCount(todayHistory.length);

      // Count pending goals
      const goalsData = localStorage.getItem('goals');
      if (goalsData) {
        const goals = JSON.parse(goalsData) as Goal[];
        const pendingGoals = goals.filter((goal) => {
        return goal.status === 'active' && goal.progress < goal.target;
      });
      setPendingGoalsCount(pendingGoals.length);
    }
    
    // Count today's pending habits
    const habitsData = localStorage.getItem('habits');
    if (habitsData) {
      const habits = JSON.parse(habitsData) as Habit[];
      const today = new Date().toISOString().split('T')[0];
      const pendingHabits = habits.filter((habit) => {
        return habit.frequency === 'daily' && !habit.completedDates?.includes(today);
      });
      setPendingHabitsCount(pendingHabits.length);
    }
    
    // Count today's pending todos
    const todosData = localStorage.getItem('todos');
    if (todosData) {
      const todos = JSON.parse(todosData) as Todo[];
      const todayTodos = todos.filter((todo) => {
        return todo.status === 'pending' && todo.dueDate === today;
      });
      setPendingTodosCount(todayTodos.length);
    }
  }, [location.pathname]); // Refresh counts when changing pages

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: "Throne Room", path: "/", count: null },
    { id: 'calendar', icon: <CalendarDays size={20} />, label: "Moon Cycles", path: "/calendar", count: null },
    { id: 'journal', icon: <BookText size={20} />, label: "Raven Scrolls", path: "/journal", count: null },
    { id: 'chronicles', icon: <Scroll size={20} />, label: "Chronicles", path: "/chronicles", count: null },
    { id: 'todos', icon: <CheckCircle2 size={20} />, label: "Quests", path: "/todos", count: pendingTodosCount > 0 ? pendingTodosCount : null },
    { id: 'goals', icon: <Target size={20} />, label: "Oaths", path: "/goals", count: pendingGoalsCount > 0 ? pendingGoalsCount : null },
    { id: 'habits', icon: <HeartPulse size={20} />, label: "Rituals", path: "/habits", count: pendingHabitsCount > 0 ? pendingHabitsCount : null },
    { id: 'motivation', icon: <Flame size={20} />, label: "Dragonfire", path: "/motivation", count: null },
    { id: 'memories', icon: <ImageDown size={20} />, label: "Wall of Faces", path: "/memories", count: null },
    { id: 'analytics', icon: <LineChart size={20} />, label: "Maester's Ledger", path: "/analytics", count: null },
    { id: 'history', icon: <History size={20} />, label: "Tales of the Past", path: "/history", count: todayActivityCount > 0 ? todayActivityCount : null },
    { id: 'how-to-use', icon: <FileText size={20} />, label: "Tome of Wisdom", path: "/how-to-use", count: null },
    { id: 'settings', icon: <Settings size={20} />, label: "Settings", path: "/settings", count: null }
  ];

  // Authentication items - safely handle when auth context isn't ready
  const authItems = currentUser 
    ? [
        { id: 'profile', icon: <UserCircle size={20} />, label: "Profile", path: "/profile", count: null },
      ] : [
        { id: 'login', icon: <LogIn size={20} />, label: "Log In", path: "/login", count: null },
        { id: 'signup', icon: <UserPlus size={20} />, label: "Sign Up", path: "/signup", count: null },
      ];

  const sidebarVariants = {
    expanded: { 
      width: "272px", // Slightly wider to account for border and shadow
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: { 
      width: "64px", // Slightly wider to account for border and shadow
      transition: { duration: 0.3, ease: "easeInOut" },
    },
};

  // Mobile nav overlay variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  // Mobile sidebar variants
  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 }
  };

  const colorSchemes = [
        { name: "blue", label: "Blue" },
        { name: "purple", label: "Purple" },
        { name: "pink", label: "Pink" },
        { name: "red", label: "Red" },
    { name: "lime", label: "Lime" },
    { name: "green", label: "Green" },
    { name: "emerald", label: "Emerald" },
    { name: "teal", label: "Teal" },
    { name: "cyan", label: "Cyan" },
    { name: "indigo", label: "Indigo" },
    { name: "violet", label: "Violet" },
    { name: "rose", label: "Rose" }
  ];

  // Function to convert color names to hex values
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      blue: "#3B82F6",     // blue-500
      purple: "#8B5CF6",   // purple-500
      pink: "#EC4899",     // pink-500
      red: "#EF4444",      // red-500
      orange: "#F97316",   // orange-500
      amber: "#F59E0B",    // amber-500
      yellow: "#EAB308",   // yellow-500
      lime: "#84CC16",     // lime-500
      green: "#22C55E",    // green-500
      emerald: "#10B981",  // emerald-500
      teal: "#14B8A6",     // teal-500
      cyan: "#06B6D4",     // cyan-500
      indigo: "#6366F1",   // indigo-500
      violet: "#8B5CF6",   // violet-500
      rose: "#F43F5E",     // rose-500
    };
    return colorMap[colorName] || "#3B82F6"; // Default to blue if color not found
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <motion.button 
          className="lg:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-md border border-border/50"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          >
          <AnimatePresence mode="wait" >
              {isMobileNavOpen ? <X size={20} key="x" className="transition-all duration-300" /> : <Menu size={20} key="menu" className="transition-all duration-300" />}
          </AnimatePresence>
      </motion.button>

      {/* Desktop sidebar */}
      <motion.div 
          className={cn(
          "fixed left-0 top-0 h-screen",
          "hidden lg:flex",
          "bg-background/95 backdrop-blur-sm",
          "border-r border-border/50",
          "shadow-xl z-40",
          currentTheme
        )}
        initial={collapsed ? "collapsed" : "expanded"}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
      >
        <nav className={cn(
          "flex flex-col h-full w-full",
          "relative"
        )}>
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent"></div>
            </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            
            <div className="relative flex items-center justify-between p-4">
              <AnimatePresence mode="wait">
                {!collapsed ? (
                    <motion.div
                    className="flex items-center gap-3" 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    key="expanded-logo"
                  >
                    <div className="relative">
                      <Shield 
                        size={24} 
                        className="text-primary drop-shadow-glow animate-float-gentle" 
                      />
                      <div className="absolute inset-0 bg-primary/20 blur-xl"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold tracking-wider text-foreground/90">
                        MENACE
                      </span>
                      <span className="text-[10px] tracking-widest text-muted-foreground/70 uppercase">
                        Guardian's Watch
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full flex justify-center"
                    key="collapsed-logo"
                  >
                    <Shield size={24} className="text-primary drop-shadow-glow animate-float-gentle" />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                  onClick={onToggleCollapse}
                  className={cn(
                      "p-1.5 rounded-full",
                      "hover:bg-primary/10 hover:shadow-inner-glow",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      "transition-all duration-200"
                  )}
                whileHover={{ scale: 1.1 }}                
                whileTap={{ scale: 0.95 }}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </motion.button>
            </div>
          </div>
          
            {/* Navigation Section */} 
            <div className={cn("flex-1 px-3 overflow-y-auto","scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent","hover:scrollbar-thumb-primary/20")}>
            
                {/* Navigation Items */}
                <div className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                  item={item}
                  isActive={location.pathname === item.path}
                  collapsed={collapsed}
                  hoveredItem={hoveredItem}
                  setHoveredItem={setHoveredItem}
                />
              ))}
                </div>
                
            {/* Decorative Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background/95 px-2">
                  <Crown className="h-4 w-4 text-primary/40" />
                </span>
              </div>
            </div>

            {/* Quote Section */}
            {!collapsed && (
              <motion.div
                className="px-3 py-3 rounded-lg bg-primary/5 border border-primary/10"
              >
                <Quote className="h-4 w-4 text-primary/40 mb-2" />
                <p className="text-xs italic text-muted-foreground">{currentQuote}</p>
              </motion.div>
            )}
          </div>

          {/* Profile Section */}
          <div className={cn(
            "mt-auto pt-3 border-t border-border/30",
            "bg-gradient-to-t from-background/80 to-transparent"
          )}>
            <ProfileSection collapsed={collapsed} />
          </div>
        </nav>
      </motion.div>

      {/* Mobile navigation overlay */}
      <AnimatePresence>
          {isMobileNavOpen && (
              <motion.div 
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            initial="hidden"
            animate="visible" 
            exit="hidden"
            variants={overlayVariants}
            onClick={() => setIsMobileNavOpen(false)}
          >            
            <motion.div 
              className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[300px] bg-sidebar p-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileSidebarVariants}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                  <Sword size={22} className="mr-2 text-primary" />
                  <span className="text-sm font-medium">MENACE</span>
                  </div>              
                  <button 
                      className="p-1 rounded-full hover:bg-primary/10"
                      onClick={() => setIsMobileNavOpen(false)}
                  >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={location.pathname === item.path}
                    collapsed={false}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  />
                ))}
              </div>

              <div className="mt-6">
                <div className="rounded-lg border bg-card/30 border-border/60 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Quote size={16} className="text-primary" />
                    <span>Warrior's Wisdom</span>
                  </div>
                  <p className="text-xs italic opacity-90">"{currentQuote}"</p>
                </div>
              </div>                
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <ProfileSection collapsed={false} />
                
                <div className="flex justify-center mt-4">
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => navigate('/settings')}
                    className="h-8 w-8"
                    title="Settings"
                  >
                    <Settings size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      {/* Collapsed tooltips */}
        {collapsed && (
          <>
              {navItems.map((item) => (
                <div
                  key={`tooltip-${item.id}`}
                  className={cn(
                    "fixed left-16 ml-1 px-2 py-1",
                    "rounded bg-background/80 backdrop-blur-sm",
                    "border border-border/50 text-foreground text-xs",
                    "transition-opacity duration-200 pointer-events-none",
                    "z-50 shadow-lg whitespace-nowrap",
                    hoveredItem === item.id ? "opacity-100" : "opacity-0"
                  )}
                  style={{
                    top: document.querySelector(`[href="${item.path}"]`)?.getBoundingClientRect().top,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {item.label}
                  {item.count !== null && (
                    <span className="ml-1 px-1 py-0.5 rounded text-[10px] bg-primary/10">
                      {item.count}
                    </span>
                  )}
                </div>
            ))}
          </>
        )}
    </>
  );
};

export default Sidebar;