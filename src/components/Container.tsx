import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass";
}

export function Container({ children, className, variant = "default" }: ContainerProps) {
  return (
    <div 
      className={cn(
        "container mx-auto px-4 py-6 max-w-7xl relative z-10",
        variant === "glass" && "rounded-xl backdrop-blur-sm border border-border/10 shadow-lg bg-background/50",
        variant === "glass" && "overflow-hidden",
        className
      )}
    >
      {variant === "glass" && (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-30 pointer-events-none z-0"></div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
