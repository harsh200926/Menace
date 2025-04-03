/**
 * Theme Patches - Functions to fix theme-related issues
 * This file contains utilities to properly apply theme changes to all components
 */

/**
 * Applies theme-specific CSS variables to fix container/card colors not changing
 * Call this function whenever the theme changes
 */
export const applyThemePatches = (themeName: string): void => {
  // Get the document root element to apply CSS variables
  const root = document.documentElement;
  
  // Define theme-specific CSS variable overrides
  const themeOverrides: Record<string, Record<string, string>> = {
    // Light themes
    crystal: {
      '--background': '210 20% 98%',
      '--foreground': '224 71% 4%',
      '--card': '0 0% 100%',
      '--card-foreground': '224 71% 4%',
      '--border': '214 32% 91%',
    },
    arctic: {
      '--background': '210 30% 98%',
      '--foreground': '220 60% 5%',
      '--card': '210 30% 99%',
      '--card-foreground': '220 60% 5%',
      '--border': '210 30% 91%',
    },
    sunset: {
      '--background': '25 100% 97%',
      '--foreground': '20 80% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '20 80% 10%',
      '--border': '25 70% 90%',
    },
    ocean: {
      '--background': '200 60% 98%',
      '--foreground': '200 80% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '200 80% 10%',
      '--border': '200 50% 90%',
    },
    // Dark themes
    shadow: {
      '--background': '228 12% 8%',
      '--foreground': '220 20% 98%',
      '--card': '228 16% 12%',
      '--card-foreground': '220 20% 98%',
      '--border': '228 12% 16%',
    },
    'pure-black': {
      '--background': '0 0% 0%',
      '--foreground': '0 0% 100%',
      '--card': '0 0% 4%',
      '--card-foreground': '0 0% 100%',
      '--border': '0 0% 12%',
    },
    midnight: {
      '--background': '224 71% 4%',
      '--foreground': '210 40% 98%',
      '--card': '224 71% 6%',
      '--card-foreground': '210 40% 98%',
      '--border': '224 31% 15%',
    },
    ember: {
      '--background': '10 25% 8%',
      '--foreground': '20 80% 98%',
      '--card': '10 25% 10%',
      '--card-foreground': '20 80% 98%',
      '--border': '10 25% 15%',
    },
    forest: {
      '--background': '150 25% 8%',
      '--foreground': '150 80% 98%',
      '--card': '150 25% 10%',
      '--card-foreground': '150 80% 98%',
      '--border': '150 25% 15%',
    },
    twilight: {
      '--background': '260 25% 8%',
      '--foreground': '260 80% 98%',
      '--card': '260 25% 10%',
      '--card-foreground': '260 80% 98%',
      '--border': '260 25% 15%',
    },
    cosmic: {
      '--background': '250 25% 5%',
      '--foreground': '250 80% 98%',
      '--card': '250 25% 8%',
      '--card-foreground': '250 80% 98%',
      '--border': '250 25% 12%',
    },
  };
  
  // Apply the theme overrides based on the current theme
  if (themeName in themeOverrides) {
    Object.entries(themeOverrides[themeName]).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });
    
    // Only update the body styles (no DOM traversal)
    document.body.style.backgroundColor = `hsl(var(--background))`;
    document.body.style.color = `hsl(var(--foreground))`;
  }
};

/**
 * Apply theme patches but with a simplified approach
 * This version is safe to use without risk of performance issues
 */
export const applyCurrentTheme = (): void => {
  try {
    const savedTheme = localStorage.getItem('theme') || 'crystal';
    applyThemePatches(savedTheme);
  } catch (error) {
    console.error('Error applying theme:', error);
  }
};

// Export a safe version of the theme observer that won't cause infinite loops
export const safelySetupThemeObserver = (manualCall = false): void => {
  // Only run this function when explicitly called
  if (!manualCall) return;
  
  try {
    const savedTheme = localStorage.getItem('theme') || 'crystal';
    applyThemePatches(savedTheme);
  } catch (error) {
    console.error('Error setting up theme observer:', error);
  }
}; 