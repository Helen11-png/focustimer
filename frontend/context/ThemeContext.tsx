import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTheme } from '../constants/theme';

type ThemeName = 'purple' | 'blue' | 'green';

interface ThemeContextType {
  theme: ReturnType<typeof getTheme>;
  themeName: ThemeName;
  isDark: boolean;
  setTheme: (name: ThemeName, dark?: boolean) => Promise<void>;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('purple');
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(getTheme('purple', false));

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    setTheme(getTheme(themeName, isDark));
  }, [themeName, isDark]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme) {
        const { name, dark } = JSON.parse(savedTheme);
        setThemeName(name);
        setIsDark(dark);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (name: ThemeName, dark: boolean) => {
    try {
      await AsyncStorage.setItem('userTheme', JSON.stringify({ name, dark }));
      setThemeName(name);
      setIsDark(dark);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleSetTheme = async (name: ThemeName, dark: boolean = isDark) => {
    await saveTheme(name, dark);
  };

  const toggleDarkMode = async () => {
    await saveTheme(themeName, !isDark);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeName, 
      isDark, 
      setTheme: handleSetTheme,
      toggleDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}