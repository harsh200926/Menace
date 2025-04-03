'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import "./styles.css";

type DockPosition = "top" | "bottom" | "left" | "right";

interface DockItemProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  itemClassName?: string;
  isActive?: boolean;
  onClick?: () => void;
}

interface DockProps {
  children: React.ReactNode;
  position?: DockPosition;
  className?: string;
  magnification?: boolean;
  distance?: number;
  scale?: number;
}

/**
 * Individual dock item component that handles magnification on hover
 */
export function DockItem({
  children,
  label,
  className,
  itemClassName,
  isActive,
  onClick,
}: DockItemProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <motion.div
      className={cn("dock-item relative", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div 
        className={cn(
          "flex items-center justify-center",
          isActive && "active",
          "relative transition-all duration-150",
          itemClassName
        )}
      >
        <div className="dock-item-icon">
          {children}
        </div>
      </div>
      
      {label && (
        <div className="dock-item-label">
          {label}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Main dock component with macOS-like magnification effect
 */
export function Dock({
  children,
  position = "bottom",
  className,
  magnification = true,
  distance = 6,
  scale = 1.5
}: DockProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dockRef = useRef<HTMLDivElement>(null);
  const isVertical = position === "left" || position === "right";

  // Handle mouse move for magnification effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      
      const x = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
      const y = Math.min(rect.height, Math.max(0, e.clientY - rect.top));
      
      setMousePos({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  const containerClasses = cn(
    "dock-container",
    `dock-${position}`,
    className
  );
  
  return (
    <div className={containerClasses}>
      <div className="dock-trigger" />
      
      <div 
        ref={dockRef}
        className={cn(
          "macos-dock",
          isVertical && "vertical",
          "bg-background/80 backdrop-blur-md border border-border/40 shadow-lg"
        )}
      >
        {children}
        
        {position === "bottom" && <div className="dock-reflection" />}
      </div>
    </div>
  );
}

/**
 * A section divider for the dock
 */
export function DockDivider({ vertical }: { vertical?: boolean }) {
  return (
    <div className={cn(
      vertical ? "h-px w-full my-1" : "w-px h-full mx-1",
      "bg-border/50"
    )} />
  );
}

/**
 * Group of dock items
 */
export function DockGroup({ 
  children, 
  vertical
}: { 
  children: React.ReactNode;
  vertical?: boolean;
}) {
  return (
    <div className={cn(
      "flex",
      vertical ? "flex-col" : "items-end",
      "gap-1 p-1"
    )}>
      {children}
    </div>
  );
}
