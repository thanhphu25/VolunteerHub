// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import viTranslations from '../locales/vi.json';
import enTranslations from '../locales/en.json';

const LanguageContext = createContext({
  language: 'vi',
  setLanguage: () => {},
  t: (key) => key,
});

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

    // Simple parameter replacement
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


