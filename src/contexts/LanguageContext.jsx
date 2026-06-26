import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'accord_language';
const USD_TO_RUB_RATE = 95; // Approximate exchange rate

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Язык залочен на 'ru' для MVP-питча. EN-версия архивирована, не удалена —
    // см. plans/mvp-pitch-roadmap.md, раздел "Зафиксированные решения".
    return 'ru';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const changeLanguage = (lang) => {
    // EN временно архивирован для MVP-питча — переключение недоступно через UI.
    if (lang === 'ru') {
      setLanguage(lang);
    }
  };

  // Format currency based on language
  const formatCurrency = (amountInRub) => {
    if (language === 'en') {
      const amountInUsd = Math.round(amountInRub / USD_TO_RUB_RATE);
      return `$${amountInUsd.toLocaleString('en-US')}`;
    }
    return `${amountInRub.toLocaleString('ru-RU')} ₽`;
  };

  // Get currency symbol
  const getCurrency = () => {
    return language === 'en' ? '$' : '₽';
  };

  // Get currency suffix for "per month"
  const getCurrencyPerMonth = () => {
    return language === 'en' ? '$ / month' : '₽ / мес';
  };

  // Convert displayed price to RUB for storage
  const convertToRub = (displayedPrice) => {
    if (language === 'en') {
      return Math.round(displayedPrice * USD_TO_RUB_RATE);
    }
    return displayedPrice;
  };

  // Convert RUB price to display currency
  const convertFromRub = (rubPrice) => {
    if (language === 'en') {
      return Math.round(rubPrice / USD_TO_RUB_RATE);
    }
    return rubPrice;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      changeLanguage,
      t,
      formatCurrency,
      getCurrency,
      getCurrencyPerMonth,
      convertToRub,
      convertFromRub
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
