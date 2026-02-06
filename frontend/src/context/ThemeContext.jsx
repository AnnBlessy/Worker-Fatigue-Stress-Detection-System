import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const colors = {
    dark: {
      background: '#0a0e27',
      cardBackground: 'rgba(15, 23, 42, 0.8)',
      textPrimary: '#f0f4ff',
      textSecondary: '#a0aec0',
      border: 'rgba(0, 217, 255, 0.1)',
      accent: '#00d9ff',
      accentHover: '#00b8d4',
      navBackground: 'rgba(10, 14, 39, 0.8)',
    },
    light: {
      background: '#f8fafc',
      cardBackground: '#ffffff',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      accent: '#0284c7',
      accentHover: '#0369a1',
      navBackground: '#ffffff',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: colors[theme], isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
