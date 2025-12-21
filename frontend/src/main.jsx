import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Global Context Providers
import { AuthProvider } from './context/AuthContext';
import ThemeModeProvider from './context/ThemeContext';
import LanguageProvider from './context/LanguageContext';

// Notifications and Styling
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Default styles for toast notifications
import './styles/main.css'; // Global CSS variables and resets

/**
 * Root Rendering Logic
 * The App is wrapped in multiple Providers to manage global state:
 * 1. React.StrictMode: Highlights potential problems in the application.
 * 2. BrowserRouter: Enables client-side routing.
 * 3. ThemeModeProvider: Manages Dark/Light mode state.
 * 4. LanguageProvider: Manages i18n/Internationalization.
 * 5. AuthProvider: Manages user session, JWT, and authentication status.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <LanguageProvider>
          <AuthProvider>
            {/* Main Application Logic */}
            <App />
            
            {/* Global Toast Notification Container */}
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              theme="colored"
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </AuthProvider>
        </LanguageProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

/**
 * Service Worker Registration
 * Enables Progressive Web App (PWA) features such as:
 * - Offline support
 * - Background sync
 * - Push notifications
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}