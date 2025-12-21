import React, { createContext, useContext, useState, useEffect } from 'react';
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

const LanguageContext = createContext({
  language: 'vi',
  setLanguage: () => { },
  t: (key) => key,
});

/**
 * useLanguage Hook
 * Custom React hook to access language context for translations and language switching.
 * Provides current language and translation lookup function.
 *
 * @hook
 * @throws {Error} Throws error if used outside of LanguageProvider
 * @returns {Object} Language context with language, setLanguage, and t function
 * @returns {string} return.language - Current active language ('vi' or 'en')
 * @returns {Function} return.setLanguage - Function to change active language
 * @returns {Function} return.t - Translation function that looks up and returns translated strings
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

const translations = {
  vi: viTranslations,
  en: enTranslations,
};

/**
 * LanguageProvider Component
 * Provides i18n context and translation functionality to the entire application.
 * Manages language state, loads translation files, and provides translation lookup function.
 * Persists language preference to localStorage.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to provide language context to
 * @returns {JSX.Element} Context provider wrapping children with language context
 */
export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang) => {
    setLanguageState(lang);
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) =>
          str.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue),
        value
      );
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}


