import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { getTheme } from '@/utils/themes';


type ThemeContextType = {
  mode: PaletteMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Check localStorage for saved theme preference
  const savedTheme = localStorage.getItem('theme') as PaletteMode;
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const [mode, setMode] = useState<PaletteMode>(
    savedTheme || (prefersDarkMode ? 'dark' : 'light')
  );

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme', newMode);
  };

  // Update theme when mode changes
  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};