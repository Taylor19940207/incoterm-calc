import React, { createContext, useContext, useMemo } from 'react';
import { QuoteRepo } from './QuoteRepo';
import { LocalQuoteRepo } from './LocalQuoteRepo';

interface RepoContextType {
  quotes: QuoteRepo;
}

const RepoContext = createContext<RepoContextType | null>(null);

interface RepoProviderProps {
  children: React.ReactNode;
}

export const RepoProvider: React.FC<RepoProviderProps> = ({ children }) => {
  const quotes = useMemo(() => new LocalQuoteRepo(), []);

  const value = useMemo(() => ({
    quotes
  }), [quotes]);

  return (
    <RepoContext.Provider value={value}>
      {children}
    </RepoContext.Provider>
  );
};

export const useRepos = (): RepoContextType => {
  const context = useContext(RepoContext);
  if (!context) {
    throw new Error('useRepos must be used within a RepoProvider');
  }
  return context;
};

// 便利的 hooks
export const useQuotes = () => {
  const { quotes } = useRepos();
  return quotes;
};
