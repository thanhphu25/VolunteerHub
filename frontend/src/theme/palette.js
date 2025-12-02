// src/theme/palette.js
const palette = (mode) => ({
  mode,
  ...(mode === 'light'
    ? {
      // 🌞 Light mode colors - VolunteerHub.com inspired
      primary: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#fff' }, // Professional blue
      secondary: { main: '#00bcd4', light: '#4dd0e1', dark: '#0097a7', contrastText: '#fff' }, // Teal accent
      success: { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
      warning: { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
      error: { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
      info: { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#1a1a1a', secondary: '#6b7280' },
      divider: 'rgba(0, 0, 0, 0.08)',
    }
    : {
      // 🌙 Dark mode colors
      primary: { main: '#03a9f4', light: '#4fc3f7', dark: '#0288d1', contrastText: '#fff' },
      secondary: { main: '#00bcd4', light: '#4dd0e1', dark: '#0097a7', contrastText: '#fff' },
      success: { main: '#66bb6a', light: '#81c784', dark: '#4caf50' },
      warning: { main: '#ffa726', light: '#ffb74d', dark: '#f57c00' },
      error: { main: '#ef5350', light: '#e57373', dark: '#d32f2f' },
      info: { main: '#42a5f5', light: '#64b5f6', dark: '#1976d2' },
      background: { default: '#121212', paper: '#1e1e1e' },
      text: { primary: '#e0e0e0', secondary: '#b0b0b0' },
      divider: 'rgba(255, 255, 255, 0.12)',
    }),
})

export default palette
