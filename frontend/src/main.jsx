// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import {AuthProvider} from './context/AuthContext';
import ThemeModeProvider from './context/ThemeContext';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeModeProvider>
          <AuthProvider>
            {/* <ThemeApplicator> */}
            <App/>
            {/* </ThemeApplicator> */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                // ... các props khác của ToastContainer
                theme="colored"
            />
          </AuthProvider>
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