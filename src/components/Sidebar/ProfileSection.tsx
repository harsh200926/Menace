import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut, 
  Settings, 
  UserCircle, 
  ChevronDown, 
  ChevronRight, 
  Shield,
  Medal,
  Flame,
  Sparkles,
  Star
} from "lucide-react";

interface ProfileSectionProps {
  collapsed: boolean;
}

// Calculate user level and experience
function calculateLevel(creationTime: Date | null) {
  if (!creationTime) return { level: 1, experience: 0, nextLevel: 100 };
  
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - creationTime.getTime()) / (1000 * 60 * 60 * 24));
  
  // Simple level formula - one level per week + extra for longer users
  const level = Math.max(1, Math.floor(daysSinceCreation / 7) + 1);
  const experience = Math.min(99, (daysSinceCreation % 7) * 14); // 0-99%
  const nextLevel = level * 100;
  
  return { level, experience, nextLevel };
}

export function ProfileSection({ collapsed }: ProfileSectionProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  
  // If not logged in, show login/signup buttons
  if (!currentUser) {
    return (
      <div 
        className={cn(
          "px-2 py-3 border-t border-border/30 backdrop-blur-sm bg-sidebar-background/80",
          "transition-all duration-300 ease-in-out"
        )}
      >
        {!collapsed ? (
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start gap-2 hover:text-primary" 
              onClick={() => navigate("/login")}
            >
              <LogOut className="h-4 w-4" />
              Sign In
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full justify-start gap-2 bg-primary/90 hover:bg-primary" 
              onClick={() => navigate("/signup")}
            >
              <UserCircle className="h-4 w-4" />
              Create Account
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:text-primary hover:bg-primary/10" 
              onClick={() => navigate("/login")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:text-primary hover:bg-primary/10" 
              onClick={() => navigate("/signup")}
            >
              <UserCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Get user level and experience
  const creationTime = currentUser.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime) 
    : null;
  const { level, experience } = calculateLevel(creationTime);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  
  return (
    <div 
      className={cn(
        "border-t border-border/30 bg-sidebar-background/80 backdrop-blur-sm transition-all duration-200",
        collapsed ? "p-2" : "p-3"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {collapsed ? (
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserAvatar 
              size="sm" 
              onClick={() => navigate("/profile")}
              showStatus={true}
            />
          </motion.div>
          
          <div className="w-full mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-md bg-background/90 border border-border/40">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-primary" />
                    <span>{currentUser.displayName || "Brave Warrior"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {/* Decoration */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-primary/5 blur-xl opacity-70"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-3 group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserAvatar 
                    size="md" 
                    onClick={() => navigate("/profile")} 
                    className="group-hover:shadow-glow transition-shadow duration-300"
                  />
                </motion.div>
                
                <div className="ml-3 overflow-hidden flex-1">
                  <motion.p 
                    className="text-sm font-medium truncate flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentUser.displayName || "Brave Warrior"}
                    
                    {/* Level badge */}
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-xs rounded-full h-5 px-1.5 ml-1">
                      <Star className="h-3 w-3 mr-0.5" /> {level}
                    </span>
                  </motion.p>
                  <motion.p 
                    className="text-xs text-muted-foreground truncate"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentUser.email}
                  </motion.p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 backdrop-blur-md bg-background/90 border border-border/40">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                      <UserCircle className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center mt-2">
                {level < 5 ? (
                  <Shield className={cn("h-5 w-5 mr-2", isHovering && "animate-pulse")} style={{ color: "#94a3b8" }} />
                ) : level < 10 ? (
                  <Medal className={cn("h-5 w-5 mr-2", isHovering && "animate-pulse")} style={{ color: "#f59e0b" }} />
                ) : level < 20 ? (
                  <Flame className={cn("h-5 w-5 mr-2", isHovering && "animate-pulse")} style={{ color: "#f97316" }} />
                ) : (
                  <Sparkles className={cn("h-5 w-5 mr-2", isHovering && "animate-pulse")} style={{ color: "#a855f7" }} />
                )}
                
                <div className="flex-1 relative overflow-hidden">
                  <div className="flex justify-between text-xs mb-1">
                    <motion.span 
                      className="font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Level {level}
                    </motion.span>
                    <motion.span 
                      className="text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {experience}%
                    </motion.span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className={cn(
                        "h-full rounded-full",
                        "bg-gradient-to-r from-primary/80 to-primary"
                      )}
                      initial={{ width: "0%" }}
                      animate={{ width: `${experience}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
} 