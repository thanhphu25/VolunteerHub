/**
 * ThemeApplicator Component
 * Provides Material-UI theme context to the entire application.
 * Manages light/dark mode switching and applies consistent styling throughout the app.
 * Wraps children with ThemeProvider and CssBaseline for theme consistency.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to theme
 * @returns {JSX.Element} ThemeProvider wrapper with CssBaseline and children
 */
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeMode } from '../context/ThemeContext';
import { createVolunteerTheme } from '../theme/theme.js';

/**
 * Theme applicator wrapper component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to apply theme to
 * @returns {JSX.Element} Themed component wrapper
 */
function ThemeApplicator({ children }) {
  const { mode } = useThemeMode();
  const theme = React.useMemo(() => createVolunteerTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default ThemeApplicator;