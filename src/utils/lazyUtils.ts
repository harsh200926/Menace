/**
 * Utilities for lazily loading non-critical scripts and resources
 * This helps improve initial page load performance
 */
import React from 'react';

// Track loaded scripts to avoid duplicates
const loadedScripts = new Set<string>();

/**
 * Dynamically load a script when needed
 * @param src Script URL to load
 * @param attributes Optional attributes to add to the script tag
 * @returns Promise that resolves when the script is loaded
 */
export const loadScript = (src: string, attributes: Record<string, string> = {}): Promise<void> => {
  // Return immediately if already loaded
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Add any custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    
    // Handle load events
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    
    script.onerror = (error) => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Preload resources in the background
 * @param urls List of URLs to preload
 * @param type Resource type (script, style, image, font)
 */
export const preloadResources = (urls: string[], type: 'script' | 'style' | 'image' | 'font'): void => {
  // Skip in SSR environment
  if (typeof window === 'undefined') return;
  
  // Use requestIdleCallback if available, or setTimeout as fallback
  const scheduleTask = window.requestIdleCallback || 
    ((callback) => setTimeout(callback, 1000));
  
  scheduleTask(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      
      if (type === 'font') {
        link.setAttribute('crossorigin', 'anonymous');
      }
      
      document.head.appendChild(link);
    });
  });
};

/**
 * Lazy load an image and track when it's in viewport
 * @param imgElement Image element to lazy load
 * @param src Image source URL
 */
export const lazyLoadImage = (imgElement: HTMLImageElement, src: string): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    imgElement.src = src;
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '100px', // Load images when they're within 100px of viewport
    threshold: 0.1
  });
  
  observer.observe(imgElement);
};

/**
 * Utility to dynamically import a React component only when needed
 * @param importFn Function that imports the component
 * @param fallback Optional fallback component while loading
 * @returns Dynamic component with proper loading handling
 */
export const createLazyComponent = <T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
): React.FC<T> => {
  return (props: T) => {
    const [Component, setComponent] = React.useState<React.ComponentType<T> | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
      let isMounted = true;
      
      // Only import when component mounts
      importFn()
        .then(module => {
          if (isMounted) {
            setComponent(() => module.default);
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Failed to load component:', error);
          setIsLoading(false);
        });
      
      return () => {
        isMounted = false;
      };
    }, []);
    
    if (isLoading || !Component) {
      return fallback as React.ReactElement || null;
    }
    
    return <Component {...props} />;
  };
};

// Type declaration for requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
  }
} 