import { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const locales = { en, hi };
const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('adminLang') || 'en');

  const t = (key) => locales[lang]?.[key] || locales.en?.[key] || key;

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('adminLang', newLang);
  };

  return (
    <I18nContext.Provider value={{ t, lang, switchLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
