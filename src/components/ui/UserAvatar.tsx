import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
  fallbackClassName?: string;
  onClick?: () => void;
}

export function UserAvatar({ 
  size = 'md', 
  showStatus = true, 
  className,
  fallbackClassName,
  onClick
}: UserAvatarProps) {
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return "U";
    return currentUser.displayName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase();
  };
  
  // Check online status
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  };
  
  const fallbackSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl'
  };
  
  return (
    <div className="relative" onClick={onClick}>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Avatar className={cn(sizeClasses[size], "border-2 border-primary/20", className)}>
          <AvatarImage 
            src={currentUser?.photoURL || ""} 
            alt={currentUser?.displayName || "User"} 
            className="object-cover"
          />
          <AvatarFallback className={cn(fallbackSizes[size], "bg-primary/10 text-primary font-semibold", fallbackClassName)}>
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      
      {showStatus && currentUser && (
        <motion.div 
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background", 
            isOnline ? "bg-green-500" : "bg-gray-400",
            size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
          )}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ repeat: isOnline ? Infinity : 0, duration: isOnline ? 2 : 0 }}
        />
      )}
    </div>
  );
} 