// src/components/ThemeApplicator.jsx
import React from 'react';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {useThemeMode} from '../context/ThemeContext';
import {createVolunteerTheme} from '../theme/theme.js';

function ThemeApplicator({children}) {
  const {mode} = useThemeMode();
  const theme = React.useMemo(() => createVolunteerTheme(mode), [mode]);

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        {children}
      </ThemeProvider>
  );
}

export default ThemeApplicator;