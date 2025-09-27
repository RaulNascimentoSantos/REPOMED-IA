'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'medical' | 'clinical' | 'accessibility-contrast' | 'accessibility-elderly' | 'blue' | 'green' | 'purple' | 'orange';
type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
type Language = 'pt' | 'en';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  isMedicalTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [language, setLanguageState] = useState<Language>('pt');

  // Carregar configurações salvas uma única vez no mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('repomed_theme') as Theme;
      const savedFontSize = localStorage.getItem('repomed_font_size') as FontSize;
      const savedLanguage = localStorage.getItem('repomed_language') as Language;

      if (savedTheme && ['dark', 'light', 'medical', 'clinical', 'accessibility-contrast', 'accessibility-elderly', 'blue', 'green', 'purple', 'orange'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
      if (savedFontSize && ['small', 'medium', 'large', 'extra-large'].includes(savedFontSize)) {
        setFontSizeState(savedFontSize);
      }
      if (savedLanguage && ['pt', 'en'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn('[ThemeProvider] Erro ao carregar configurações:', error);
    }
  }, []);

  // Aplicar mudanças no DOM quando o estado mudar
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-font-size', fontSize);
      document.documentElement.setAttribute('data-language', language);

      // Adicionar classes CSS específicas para temas médicos
      document.documentElement.className = `theme-${theme} font-${fontSize} lang-${language}`;
    } catch (error) {
      console.warn('[ThemeProvider] Erro ao aplicar tema:', error);
    }
  }, [theme, fontSize, language]);

  // Funções para alterar configurações (sem auto-refresh)
  const setTheme = useCallback((newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('repomed_theme', newTheme);
      console.log('[ThemeProvider] Tema alterado para:', newTheme);
    } catch (error) {
      console.warn('[ThemeProvider] Erro ao salvar tema:', error);
    }
  }, []);

  const setFontSize = useCallback((newSize: FontSize) => {
    try {
      setFontSizeState(newSize);
      localStorage.setItem('repomed_font_size', newSize);
      console.log('[ThemeProvider] Tamanho da fonte alterado para:', newSize);
    } catch (error) {
      console.warn('[ThemeProvider] Erro ao salvar tamanho da fonte:', error);
    }
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      localStorage.setItem('repomed_language', newLanguage);
      console.log('[ThemeProvider] Idioma alterado para:', newLanguage);
    } catch (error) {
      console.warn('[ThemeProvider] Erro ao salvar idioma:', error);
    }
  }, []);

  // Computed properties para facilitar uso em componentes
  const isDarkMode = theme === 'dark' || theme === 'medical';
  const isMedicalTheme = theme === 'medical' || theme === 'clinical';

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      fontSize,
      setFontSize,
      language,
      setLanguage,
      isDarkMode,
      isMedicalTheme
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