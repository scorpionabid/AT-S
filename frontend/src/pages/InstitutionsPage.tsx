import React, { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { InstitutionProvider } from '../contexts/InstitutionContext';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiPlus, FiRefreshCw, FiMap } from 'react-icons/fi';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '../components/debug/ErrorBoundary';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import Dashboard from '../components/layout/Dashboard';
import RegionAdminInstitutionsList from '../components/regionadmin/institutions/RegionAdminInstitutionsList';
import InstitutionsList from '../components/institutions/InstitutionsList';
import { Button } from '../components/ui/Button';
import { regionAdminService } from '../services/regionAdminService';
import type { RegionInstitutionStats } from '../services/regionAdminService';

// Define ErrorFallback component type
type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

// Error fallback component
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <p>Xəta baş verdi: {error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Yenidən yoxla
    </button>
  </div>
);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const InstitutionsPage: React.FC = () => {
  const { user } = useAuth();
  
  const handleReset = () => {
    // Reset any necessary state here
    window.location.reload();
  };

  // Show RegionAdmin-specific page for regionadmin users
  const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;
  if (userRole === 'regionadmin') {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <InstitutionProvider>
            <Dashboard>
              <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
              <RegionAdminInstitutionsList />
            </Dashboard>
          </InstitutionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  // Default SuperAdmin view
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <InstitutionProvider>
          <Dashboard>
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
              <InstitutionsList />
          </Dashboard>
        </InstitutionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default InstitutionsPage;