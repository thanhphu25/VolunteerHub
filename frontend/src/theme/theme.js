// src/theme/theme.js
import {createTheme} from '@mui/material/styles'
import palette from './palette'
import typography from './typography'

export const getDesignTokens = (mode) => ({
  palette: palette(mode),
  typography,
  shape: {borderRadius: 10},
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

export const createVolunteerTheme = (mode = 'light') =>
    createTheme(getDesignTokens(mode))
