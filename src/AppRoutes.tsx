import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RepoProvider, useQuotes } from './repo/RepoProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { initializeSeedData } from './repo/seedData';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import QuotesList from './pages/QuotesList';
import QuoteEditor from './pages/QuoteEditor';
import QuoteView from './pages/QuoteView';
import ProductList from './pages/ProductList';
import LogisticsConfig from './pages/LogisticsConfig';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const AppContent: React.FC = () => {
  const quotes = useQuotes();

  useEffect(() => {
    initializeSeedData(quotes);
  }, [quotes]);

  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quotes" element={<QuotesList />} />
        <Route path="/quotes/new" element={<QuoteEditor mode="create" />} />
        <Route path="/quotes/:id" element={<QuoteView />} />
        <Route path="/quotes/:id/edit" element={<QuoteEditor mode="edit" />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/logistics" element={<LogisticsConfig />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <RepoProvider>
          <AppContent />
        </RepoProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
