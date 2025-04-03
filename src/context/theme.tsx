import React, { createContext, useContext, useEffect, useState } from 'react';

// Define theme type with the pure-black theme option
export type ThemeType = 'crystal' | 'shadow' | 'pure-black' | 'midnight' | 'ember' | 'forest' | 'arctic' | 'twilight' | 'sunset' | 'ocean' | 'cosmic';
export type AccentType = 'blue' | 'green' | 'violet' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'amber' | 'lime' | 'emerald' | 'teal' | 'cyan' | 'indigo' | 'rose';

export interface ThemeContextType {
  theme: ThemeType;
  accent: AccentType;
  setTheme: (theme: ThemeType) => void;
  setAccent: (accent: AccentType) => void;
  useBlur: boolean;
  setUseBlur: (useBlur: boolean) => void;
  useAnimations: boolean;
  setUseAnimations: (useAnimations: boolean) => void;
}

export const THEMES = {
  crystal: 'Minimalist light theme',
  shadow: 'Modern dark theme',
  'pure-black': 'True black theme for OLED displays',
  midnight: 'Dark blue-black theme',
  ember: 'Warm dark theme',
  forest: 'Dark green theme',
  arctic: 'Cool light blue theme',
  twilight: 'Dark with purple accents',
  sunset: 'Warm light theme',
  ocean: 'Teal-blue dark theme',
  cosmic: 'Space-inspired dark theme',
};

export const ACCENTS = {
  blue: 'Classic blue',
  green: 'Nature green',
  violet: 'Royal violet',
  purple: 'Deep purple',
  pink: 'Vibrant pink',
  red: 'Bold red',
  orange: 'Warm orange',
  yellow: 'Sunny yellow',
  amber: 'Rich amber',
  lime: 'Fresh lime',
  emerald: 'Lush emerald',
  teal: 'Cool teal',
  cyan: 'Bright cyan',
  indigo: 'Deep indigo',
  rose: 'Soft rose',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage or defaults
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'shadow';
  });
  
  const [accent, setAccentState] = useState<AccentType>(() => {
    const savedAccent = localStorage.getItem('accent');
    return (savedAccent as AccentType) || 'blue';
  });

  const [useBlur, setUseBlurState] = useState<boolean>(() => {
    return localStorage.getItem('useBlur') !== 'false'; // Default to true
  });

  const [useAnimations, setUseAnimationsState] = useState<boolean>(() => {
    return localStorage.getItem('useAnimations') !== 'false'; // Default to true
  });

  // Update localStorage and apply theme when changed
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove(
      'crystal', 'shadow', 'pure-black', 'midnight', 'ember', 'forest', 
      'arctic', 'twilight', 'sunset', 'ocean', 'cosmic'
    );
    
    // Add the current theme class
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Update localStorage and apply accent when changed
  useEffect(() => {
    localStorage.setItem('accent', accent);
    
    // Remove all accent classes
    document.documentElement.classList.remove(
      'accent-blue', 'accent-green', 'accent-violet', 'accent-purple', 
      'accent-pink', 'accent-red', 'accent-orange', 'accent-yellow',
      'accent-amber', 'accent-lime', 'accent-emerald', 'accent-teal',
      'accent-cyan', 'accent-indigo', 'accent-rose'
    );
    
    // Add the current accent class
    document.documentElement.classList.add(`accent-${accent}`);
  }, [accent]);

  // Update localStorage and apply blur effect when changed
  useEffect(() => {
    localStorage.setItem('useBlur', useBlur.toString());
    
    if (useBlur) {
      document.documentElement.classList.add('use-blur');
    } else {
      document.documentElement.classList.remove('use-blur');
    }
  }, [useBlur]);

  // Update localStorage and apply animations when changed
  useEffect(() => {
    localStorage.setItem('useAnimations', useAnimations.toString());
    
    if (useAnimations) {
      document.documentElement.classList.add('animations-enabled');
    } else {
      document.documentElement.classList.remove('animations-enabled');
    }
  }, [useAnimations]);

  // Wrapper functions to set values
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const setAccent = (newAccent: AccentType) => {
    setAccentState(newAccent);
  };

  const setUseBlur = (newUseBlur: boolean) => {
    setUseBlurState(newUseBlur);
  };

  const setUseAnimations = (newUseAnimations: boolean) => {
    setUseAnimationsState(newUseAnimations);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      accent, 
      setTheme, 
      setAccent,
      useBlur,
      setUseBlur,
      useAnimations,
      setUseAnimations
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function isDarkTheme(theme: ThemeType) {
  // Return true for dark themes
  return ['shadow', 'pure-black', 'midnight', 'ember', 'forest', 'twilight', 'ocean', 'cosmic'].includes(theme);
} 