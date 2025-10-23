// src/context/ThemeContext.jsx
import React, {createContext, useContext, useMemo, useState} from 'react';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {createVolunteerTheme} from '../theme/theme.js'; // Đảm bảo đường dẫn đúng

// Tạo context với giá trị mặc định (có thể không cần thiết nếu Provider luôn bao bọc)
const ThemeModeContext = createContext({
  mode: 'light', // Giá trị mặc định
  toggleColorMode: () => {
  }, // Hàm rỗng mặc định
});

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}

export default function ThemeModeProvider({children}) {
  const [mode, setMode] = useState('light');

  // Hàm toggle được đặt bên ngoài useMemo vì nó cần setMode
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Chỉ tạo lại theme khi mode thay đổi
  const theme = useMemo(() => createVolunteerTheme(mode), [mode]);

  // Tạo context value bao gồm cả mode và hàm toggle
  const contextValue = useMemo(
      () => ({
        mode, // <- Cung cấp mode
        toggleColorMode, // <- Cung cấp hàm toggle
      }),
      [mode] // Chỉ tạo lại value khi mode thay đổi
  );

  return (
      // Truyền contextValue mới vào Provider
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
  );
}