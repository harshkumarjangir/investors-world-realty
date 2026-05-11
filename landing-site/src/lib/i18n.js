'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

const translations = { en, hi };

const I18nContext = createContext({ t: (key) => key, lang: 'en', switchLang: () => {} });

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'hi') {
      setLang(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lang', lang);
    }
  }, [lang, mounted]);

  const switchLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] || translations['en']?.[key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ t, lang, switchLang }}>
      {children}
    </I18nContext.Provider>
  );
}
