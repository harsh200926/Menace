import * as React from "react"
import { ReactNode, useEffect, ComponentPropsWithoutRef, ForwardedRef, forwardRef } from "react"
import { Link } from "react-router-dom"
import { motion, useMotionValue, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useWindowSize } from "@/hooks/use-window-size"

// Interfaces
interface AnimatedSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: ReactNode;
}

interface SidebarBodyProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

interface SidebarHeaderProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

interface SidebarFooterProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

interface SidebarSectionProps extends ComponentPropsWithoutRef<"div"> {
  title?: string;
  children: ReactNode;
}

interface SidebarLinkContent {
  icon: ReactNode;
  label: string;
  href: string;
  count: number | null;
}

interface SidebarLinkProps extends ComponentPropsWithoutRef<"div"> {
  link: SidebarLinkContent;
  isActive?: boolean;
}

// Components
export const AnimatedSidebar = ({ open, setOpen, children }: AnimatedSidebarProps) => {
  const { width } = useWindowSize()

  return (
    <motion.div
      initial={{ width: open ? 240 : 70 }}
      animate={{ width: open ? 240 : 70 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

export const SidebarBody = forwardRef(
  ({ className, children, ...props }: SidebarBodyProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className={cn("h-full", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarBody.displayName = "SidebarBody";

export const SidebarHeader = forwardRef(
  ({ className, children, ...props }: SidebarHeaderProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className={cn("px-2 py-4", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = forwardRef(
  ({ className, children, ...props }: SidebarFooterProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className={cn("px-2 py-4", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";

export const SidebarSection = forwardRef(
  ({ className, title, children, ...props }: SidebarSectionProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className={cn("py-2", className)} {...props}>
        {title && <h3 className="px-3 text-xs uppercase tracking-wider text-sidebar-muted mb-2">{title}</h3>}
        {children}
      </div>
    );
  }
);
SidebarSection.displayName = "SidebarSection";

export const SidebarLink = forwardRef(
  ({ className, link, isActive, ...props }: SidebarLinkProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { icon, label, href, count } = link;
    
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <Link 
          to={href}
          className={cn(
            "flex items-center px-3 py-2.5 mb-1 text-sm font-medium rounded-md transition-all",
            "hover:bg-primary/5",
            isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground"
          )}
        >
          <div className="mr-3 flex-shrink-0 text-sidebar-icon">
            {icon}
          </div>
          
          <AnimatePresence initial={false}>
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-grow"
            >
              {label}
            </motion.span>
          </AnimatePresence>
          
          {count !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="outline" className="ml-auto bg-primary/5 border-primary/20 text-xs">
                {count}
              </Badge>
            </motion.div>
          )}
        </Link>
      </div>
    );
  }
);
SidebarLink.displayName = "SidebarLink"; 