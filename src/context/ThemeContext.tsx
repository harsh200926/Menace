import React, { createContext, useContext, useState, useEffect } from "react";

// Theme options
export const themes = [
  "crystal",  // Light minimalist
  "shadow",   // Dark minimalist
  "pure-black", // Extra dark/black theme
];

// Modern themes with rich color palettes
export const modernThemes = [
  "midnight", // Dark blue
  "ember",    // Warm dark
  "forest",   // Dark green
  "arctic",   // Icy blue
  "twilight", // Purple dark
  "sunset",   // Orange/pink gradient
  "ocean",    // Blue/teal gradient
  "cosmic",   // Space-inspired dark theme
];

// Accent color options
export const accentColors = [
  "blue",
  "purple",
  "pink",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "indigo",
  "violet",
  "rose",
];

interface ThemeContextType {
  currentTheme: string;
  changeTheme: (theme: string) => void;
  randomThemesEnabled: boolean;
  toggleRandomThemes: () => void;
  customThemes: []; // Keep this for backwards compatibility
  isDark: boolean;
  toggleDarkMode: () => void;
  accentColor: string;
  changeAccentColor: (color: string) => void;
  useAnimations: boolean;
  toggleAnimations: () => void;
  blurEffects: boolean;
  toggleBlurEffects: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  currentTheme: "",
  changeTheme: () => {},
  randomThemesEnabled: false,
  toggleRandomThemes: () => {},
  customThemes: [],
  isDark: false,
  toggleDarkMode: () => {},
  accentColor: "blue",
  changeAccentColor: () => {},
  useAnimations: true,
  toggleAnimations: () => {},
  blurEffects: true,
  toggleBlurEffects: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with saved theme or default
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    // Check if the saved theme is in the available themes
    if (savedTheme && [...themes, ...modernThemes].includes(savedTheme)) {
      return savedTheme;
    }
    return "crystal"; // Default to crystal theme
  });
  
  // Dark mode state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("isDark");
    return saved === null ? false : saved === "true";
  });
  
  // Accent color state
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem("accentColor");
    return saved && accentColors.includes(saved) ? saved : "blue";
  });
  
  // Animation settings
  const [useAnimations, setUseAnimations] = useState(() => {
    const saved = localStorage.getItem("useAnimations");
    return saved === null ? true : saved === "true";
  });
  
  // Blur effects setting
  const [blurEffects, setBlurEffects] = useState(() => {
    const saved = localStorage.getItem("blurEffects");
    return saved === null ? true : saved === "true";
  });
  
  // Initialize random theme preference
  const [randomThemesEnabled, setRandomThemesEnabled] = useState(() => {
    const saved = localStorage.getItem("randomThemesEnabled");
    return saved === null ? false : saved === "true";
  });
  
  // Choose a random theme on initial load if enabled
  useEffect(() => {
    if (randomThemesEnabled) {
      const allThemes = [...themes, ...modernThemes];
      const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
      setCurrentTheme(randomTheme);
      localStorage.setItem("theme", randomTheme);
    }
  }, []);
  
  // Apply the theme settings to the document
  useEffect(() => {
    // First remove all theme classes
    document.body.classList.remove(...themes, ...modernThemes, "dark", "light");
    
    // Then add the current theme class
    document.body.classList.add(currentTheme);
    
    // Add dark/light mode class
    document.body.classList.add(isDark ? "dark" : "light");
    
    // Set data attributes for CSS variables
    document.documentElement.setAttribute("data-accent", accentColor);
    document.documentElement.setAttribute("data-animations", useAnimations.toString());
    document.documentElement.setAttribute("data-blur", blurEffects.toString());
    
    // Update local storage
    localStorage.setItem("theme", currentTheme);
    localStorage.setItem("isDark", isDark.toString());
    localStorage.setItem("accentColor", accentColor);
    localStorage.setItem("useAnimations", useAnimations.toString());
    localStorage.setItem("blurEffects", blurEffects.toString());
    
    // Apply prefers-reduced-motion if animations are disabled
    if (!useAnimations) {
      document.documentElement.style.setProperty('--reduce-motion', 'reduce');
    } else {
      document.documentElement.style.removeProperty('--reduce-motion');
    }
    
    // Apply backdrop-filter settings based on blur preference
    if (!blurEffects) {
      document.documentElement.style.setProperty('--backdrop-blur', '0');
      document.documentElement.style.setProperty('--glass-opacity', '0.9');
    } else {
      document.documentElement.style.removeProperty('--backdrop-blur');
      document.documentElement.style.removeProperty('--glass-opacity');
    }
  }, [currentTheme, isDark, accentColor, useAnimations, blurEffects]);
  
  // Change theme
  const changeTheme = (theme: string) => {
    setCurrentTheme(theme);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("isDark", newValue.toString());
  };
  
  // Change accent color
  const changeAccentColor = (color: string) => {
    if (accentColors.includes(color)) {
      setAccentColor(color);
      localStorage.setItem("accentColor", color);
    }
  };
  
  // Toggle animations
  const toggleAnimations = () => {
    const newValue = !useAnimations;
    setUseAnimations(newValue);
    localStorage.setItem("useAnimations", newValue.toString());
  };
  
  // Toggle blur effects
  const toggleBlurEffects = () => {
    const newValue = !blurEffects;
    setBlurEffects(newValue);
    localStorage.setItem("blurEffects", newValue.toString());
  };
  
  // Toggle random themes
  const toggleRandomThemes = () => {
    const newValue = !randomThemesEnabled;
    setRandomThemesEnabled(newValue);
    localStorage.setItem("randomThemesEnabled", newValue.toString());
  };
  
  return (
    <ThemeContext.Provider value={{
      currentTheme,
      changeTheme,
      randomThemesEnabled,
      toggleRandomThemes,
      customThemes: [],
      isDark,
      toggleDarkMode,
      accentColor,
      changeAccentColor,
      useAnimations,
      toggleAnimations,
      blurEffects,
      toggleBlurEffects,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
