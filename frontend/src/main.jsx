// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import {AuthProvider} from './context/AuthContext';
import ThemeModeProvider from './context/ThemeContext';
import LanguageProvider from './context/LanguageContext';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeModeProvider>
          <LanguageProvider>
            <AuthProvider>
              <App/>
              <ToastContainer
                  position="bottom-right"
                  autoClose={3000}
                  theme="colored"
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeModeProvider>
      </BrowserRouter>
    </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('ServiceWorker Đã đăng ký thành công:', registration.scope);
    })
    .catch((error) => {
      console.error('ServiceWorker Đăng ký thất bại:', error);
    });
  });
}