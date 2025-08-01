import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

// ATİS Modular CSS Architecture
import './styles/index.css';

import App from './App.tsx';
import i18n from './i18n/config';
import { initI18n } from './i18n/initI18n';
import { ToastProvider } from './contexts/ToastContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Simplified wrapper without complex i18n initialization
const AppWrapper = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
