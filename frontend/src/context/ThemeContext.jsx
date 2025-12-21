import React, { createContext, useContext, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createVolunteerTheme } from '../theme/theme.js';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {
  },
});

/**
 * useThemeMode Hook
 * Custom React hook to access theme context for theme mode control.
 * Provides current theme mode and function to toggle between light and dark modes.
 *
 * @hook
 * @throws {Error} Throws error if used outside of ThemeModeProvider
 * @returns {Object} Theme mode context with mode and toggleColorMode function
 * @returns {string} return.mode - Current theme mode ('light' or 'dark')
 * @returns {Function} return.toggleColorMode - Function to toggle between light and dark theme
 */
export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}

/**
 * ThemeModeProvider Component
 * Provides theme context and Material-UI theme to the entire application.
 * Manages light/dark mode switching with memoized theme creation.
 * Applies CssBaseline for consistent styling across browsers.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to provide theme context to
 * @returns {JSX.Element} ThemeProvider wrapper with theme context and CssBaseline
 */
export default function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createVolunteerTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}