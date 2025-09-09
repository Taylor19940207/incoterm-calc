import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dict } from '../data/dictionary';
import { Lang } from '../types';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof dict.zh;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const savedLang = localStorage.getItem('app-language') as Lang;
    return savedLang || 'zh';
  });

  const t = dict[lang] || dict.zh;

  // 當語言改變時保存到 localStorage
  useEffect(() => {
    localStorage.setItem('app-language', lang);
  }, [lang]);

  const updateLang = (newLang: Lang) => {
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: updateLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
