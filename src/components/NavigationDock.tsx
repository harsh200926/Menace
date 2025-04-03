import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  BookOpen, 
  Settings, 
  Ticket, 
  Music,
  MessageSquare, 
  CalendarDays, 
  BookType,
  UserCircle,
  LogOut,
  Bell,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";

// Import the dock styles
import "@/components/ui/dock/styles.css";

interface NavigationDockProps {
  dockPosition?: 'bottom' | 'top' | 'left' | 'right';
}

export default function NavigationDock({ dockPosition = 'bottom' }: NavigationDockProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { currentUser, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'reading', path: '/reading-list', label: 'Reading', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'tickets', path: '/tickets', label: 'Tickets', icon: <Ticket className="w-5 h-5" /> },
    { id: 'music', path: '/music', label: 'Music', icon: <Music className="w-5 h-5" /> },
    { id: 'notes', path: '/notes', label: 'Notes', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'calendar', path: '/calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'memories', path: '/memories', label: 'Memories', icon: <BookType className="w-5 h-5" /> },
  ];
  
  // Add profile/login items
  const profileItems = currentUser ? [
    { id: 'profile', path: '/profile', label: 'Profile', icon: <UserAvatar className="w-6 h-6" size="sm" showStatus={false} /> },
    { id: 'notifications', path: '/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, count: 3 },
    { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ] : [
    { id: 'login', path: '/login', label: 'Login', icon: <LogOut className="w-5 h-5" /> },
    { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isVertical = dockPosition === 'left' || dockPosition === 'right';
  
  const containerClasses = cn(
    'dock-container',
    isActive && 'active',
    `dock-${dockPosition}`
  );
  
  // Handle profile click (right-click for logout)
  const handleProfileClick = (e: React.MouseEvent) => {
    if (e.button === 2 && currentUser) { // right click
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        logout();
        navigate('/login');
      }
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className={containerClasses}>
      <div className="dock-trigger" />
      
      <div className={cn(
        'macos-dock',
        isVertical && 'vertical',
        'bg-background/80 backdrop-blur-md border border-border/40 shadow-lg'
      )}>
        {/* Main nav items */}
        <div className={cn(
          'flex',
          isVertical ? 'flex-col' : 'items-end',
          'gap-1 p-1'
        )}>
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              className="dock-item relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className={cn(
                  'flex items-center justify-center',
                  location.pathname === item.path && 'active',
                  'relative rounded-xl p-2 transition-all duration-150',
                  'hover:bg-primary/20',
                  location.pathname === item.path && 'bg-primary/30'
                )}
              >
                <div className="dock-item-icon">
                  {item.icon}
                </div>
                
                <div className="dock-item-label">
                  {item.label}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Divider */}
        <div className={cn(
          isVertical ? 'h-px w-full my-1' : 'w-px h-full mx-1',
          'bg-border/50'
        )} />
        
        {/* Profile items */}
        <div className={cn(
          'flex',
          isVertical ? 'flex-col' : 'items-end',
          'gap-1 p-1'
        )}>
          {profileItems.map((item) => (
            <motion.div
              key={item.id}
              className="dock-item relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onContextMenu={item.id === 'profile' ? handleProfileClick : undefined}
            >
              <Link
                to={item.path}
                className={cn(
                  'flex items-center justify-center',
                  location.pathname === item.path && 'active',
                  'relative rounded-xl p-2 transition-all duration-150',
                  'hover:bg-primary/20',
                  location.pathname === item.path && 'bg-primary/30'
                )}
                onClick={item.id === 'profile' ? (e) => {
                  if (e.button !== 2) handleProfileClick(e);
                } : undefined}
              >
                <div className="dock-item-icon">
                  {item.icon}
                </div>
                
                {/* Notification badge for items with count */}
                {'count' in item && item.count && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {item.count}
                  </span>
                )}
                
                <div className="dock-item-label">
                  {item.id === 'profile' && currentUser ? (
                    currentUser.displayName || 'Profile'
                  ) : (
                    item.label
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {dockPosition === 'bottom' && <div className="dock-reflection" />}
      </div>
    </div>
  );
} 