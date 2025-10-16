// src/theme/palette.js
const palette = (mode) => ({
  mode,
  ...(mode === 'light'
      ? {
        // 🌞 Light mode colors
        primary: {main: '#0288d1', contrastText: '#fff'}, // xanh Volunteer
        secondary: {main: '#f50057'},
        background: {default: '#f4f6f8', paper: '#fff'},
        text: {primary: '#212121', secondary: '#555'},
      }
      : {
        // 🌙 Dark mode colors
        primary: {main: '#81d4fa'},
        secondary: {main: '#f48fb1'},
        background: {default: '#121212', paper: '#1e1e1e'},
        text: {primary: '#e0e0e0', secondary: '#bdbdbd'},
      }),
})

export default palette
