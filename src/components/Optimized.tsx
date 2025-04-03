import { ReactNode, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { hardwareAcceleratedSettings } from '@/lib/animation';

type OptimizedProps = {
  children: ReactNode;
  id?: string;
  shouldUpdate?: boolean;
  skipMemo?: boolean;
};

/**
 * A performance-optimized component wrapper that:
 * 1. Uses React.memo to prevent unnecessary re-renders
 * 2. Applies hardware acceleration for smooth animations
 * 3. Uses will-change-transform to hint the browser to prepare for animations
 * 4. Can be configured to force updates when needed
 * 
 * Use this to wrap components that:
 * - Have expensive rendering operations
 * - Have animations that need to be smooth
 * - Don't need to update on every parent re-render
 */
const OptimizedComponent = ({ 
  children, 
  id, 
  shouldUpdate = false,
  skipMemo = false
}: OptimizedProps) => {
  // Use useMemo to memoize the children when they don't need to update
  const memoizedChildren = useMemo(() => children, [
    // Only include shouldUpdate in the dependency array if it's true
    shouldUpdate ? Math.random() : id, 
    children
  ]);

  // Choose between memoized or regular children
  const renderChildren = skipMemo ? children : memoizedChildren;
  
  return (
    <motion.div
      style={hardwareAcceleratedSettings}
      className="will-change-transform"
      layout={false} // Disable layout animations for better performance
    >
      {renderChildren}
    </motion.div>
  );
};

// Export a memoized version to prevent re-renders from parent components
export const Optimized = memo(OptimizedComponent);

/**
 * A specialized version for list items that are frequently animated
 * Applies more aggressive optimization
 */
export const OptimizedListItem = memo(({ children, id }: OptimizedProps) => {
  return (
    <motion.li
      style={{
        ...hardwareAcceleratedSettings,
        // Disable CSS transitions during animation to reduce computation
        transition: 'none',
      }}
      className="will-change-transform"
      layout={false}
    >
      {children}
    </motion.li>
  );
});

/**
 * A version for components with complex animations that need to be smooth
 * Uses compositeTrigger: 'auto' to let Framer Motion decide when to use composite layers
 */
export const SmoothAnimated = memo(({ children }: OptimizedProps) => {
  return (
    <motion.div
      style={{
        ...hardwareAcceleratedSettings,
      }}
      className="will-change-transform"
      // @ts-expect-error - compositeTrigger is a valid prop but not in the types
      compositeTrigger="auto"
    >
      {children}
    </motion.div>
  );
}); 