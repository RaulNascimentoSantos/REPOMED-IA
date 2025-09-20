'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'medical';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  language: 'pt' | 'en';
  setLanguage: (lang: 'pt' | 'en') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [language, setLanguageState] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    const savedTheme = localStorage.getItem('repomed-theme') as Theme;
    const savedFontSize = localStorage.getItem('repomed-font-size') as 'small' | 'medium' | 'large';
    const savedLanguage = localStorage.getItem('repomed-language') as 'pt' | 'en';

    if (savedTheme) setThemeState(savedTheme);
    if (savedFontSize) setFontSizeState(savedFontSize);
    if (savedLanguage) setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-language', language);
  }, [theme, fontSize, language]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('repomed-theme', newTheme);
  };

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    localStorage.setItem('repomed-font-size', size);
  };

  const setLanguage = (lang: 'pt' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('repomed-language', lang);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      fontSize,
      setFontSize,
      language,
      setLanguage
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