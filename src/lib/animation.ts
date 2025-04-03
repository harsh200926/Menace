/**
 * Optimized animation configurations to improve performance across the app
 */

// Hardware-accelerated animation settings to prevent jank
export const hardwareAcceleratedSettings = {
  translateX: 0, // force GPU acceleration with transform properties
  translateY: 0,
  translateZ: 0, // creates a new layer for the GPU to handle
};

// Common animation transitions with performance settings
export const smoothTransition = {
  type: "tween", // using tween for smoother CPU performance vs. spring
  ease: [0.25, 0.1, 0.25, 1], // cubic bezier curve for smooth, natural motion
  duration: 0.3, // shorter duration reduces computation time
};

// Optimized page transition variants
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 5,
    ...hardwareAcceleratedSettings,
  },
  animate: {
    opacity: 1,
    y: 0,
    ...hardwareAcceleratedSettings,
  },
  exit: {
    opacity: 0,
    y: 5,
    ...hardwareAcceleratedSettings,
  },
};

// Sidebar item animation variants (optimized)
export const sidebarItemVariants = {
  initial: { 
    opacity: 0,
    x: -10,
    ...hardwareAcceleratedSettings,
  },
  animate: {
    opacity: 1,
    x: 0,
    ...hardwareAcceleratedSettings,
    transition: {
      ...smoothTransition,
      duration: 0.2,
    }
  },
  exit: {
    opacity: 0,
    x: -10,
    ...hardwareAcceleratedSettings,
  }
};

// Staggered animations for lists (with reduced computational load)
export const staggeredListVariants = {
  container: {
    initial: { opacity: 1 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, // reduce stagger time
        delayChildren: 0.05,
      } 
    },
    exit: { opacity: 1 }
  },
  item: {
    initial: { 
      opacity: 0,
      y: 10,
      ...hardwareAcceleratedSettings 
    },
    animate: { 
      opacity: 1,
      y: 0,
      ...hardwareAcceleratedSettings,
      transition: smoothTransition
    },
    exit: { 
      opacity: 0,
      ...hardwareAcceleratedSettings,
      transition: {
        ...smoothTransition,
        duration: 0.15 // faster exit to reduce visual lag
      }
    }
  }
};

// Reduce computation for hover animations
export const lightHoverVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05, // reduced scale for better performance
    ...hardwareAcceleratedSettings,
    transition: {
      ...smoothTransition,
      duration: 0.2
    }
  }
};

// Network connection type definition
interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
}

// Helper to determine if device is low-end (to potentially disable animations)
export const isLowEndDevice = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for slow devices
  const isLowEnd = 
    // RAM is a good indicator but not accessible via JS
    // Check CPU cores and connection speed as proxies
    navigator.hardwareConcurrency <= 4 || 
    ('connection' in navigator && 
     ['slow-2g', '2g', '3g'].includes((navigator as any).connection?.effectiveType));
  
  return isLowEnd;
};

// Simplified animations for low-end devices
export const getOptimizedVariants = (variants: Record<string, unknown>, forceSimplified = false) => {
  if (isLowEndDevice() || forceSimplified) {
    // Return simplified variants that avoid expensive animations
    return {
      ...variants,
      transition: {
        ...((variants as any).transition || {}),
        duration: Math.min(((variants as any).transition?.duration as number) || 0.3, 0.15),
        // Disable spring physics which can be CPU intensive
        type: "tween",
      }
    };
  }
  return variants;
}; 