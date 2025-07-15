import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
// Import Tailwind CSS first for proper cascade
import './index.css';
// Import existing SCSS for gradual migration
import './styles/main-optimized.scss';
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

// Create a wrapper component to handle i18n initialization
const I18nWrapper = () => {
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // Detect browser language or default to 'en'
        const browserLanguage = navigator.language.split('-')[0];
        const defaultLanguage = ['en', 'az'].includes(browserLanguage) ? browserLanguage : 'en';
        
        await initI18n(defaultLanguage);
        setI18nInitialized(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setI18nInitialized(true); // Continue rendering even if i18n fails
      }
    };

    initializeI18n();
  }, []);

  // Show loading state while initializing i18n
  if (!i18nInitialized) {
    return <div>Loading translations...</div>;
  }

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
    <I18nWrapper />
  </StrictMode>,
);
