import React, {createContext, useContext, useMemo, useState} from 'react'
import {CssBaseline, ThemeProvider} from '@mui/material'
import {createVolunteerTheme} from '../theme/theme'

const ThemeModeContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  return useContext(ThemeModeContext)
}

export default function ThemeModeProvider({children}) {
  const [mode, setMode] = useState('light')

  const colorMode = useMemo(
      () => ({
        toggleColorMode: () => {
          setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
        },
      }),
      []
  )

  const theme = useMemo(() => createVolunteerTheme(mode), [mode])

  return (
      <ThemeModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
  )
}
