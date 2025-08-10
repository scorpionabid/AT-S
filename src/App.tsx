import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Departments from "./pages/Departments";
import Institutions from "./pages/Institutions";
import Preschools from "./pages/Preschools";
import Regions from "./pages/Regions";
import Sectors from "./pages/Sectors";
import Hierarchy from "./pages/Hierarchy";
import Surveys from "./pages/Surveys";
import SurveyApproval from "./pages/SurveyApproval";
import SurveyResults from "./pages/SurveyResults";
import SurveyArchive from "./pages/SurveyArchive";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import Links from "./pages/Links";
import Reports from "./pages/Reports";
import { useState } from "react";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Login Page Component
const LoginPage = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const [loginError, setLoginError] = useState<string | undefined>();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoginError(undefined);
      const success = await login({ email, password });
      if (!success) {
        setLoginError('Giriş məlumatları yanlışdır');
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Giriş xətası');
    }
  };
  
  return (
    <LoginForm 
      onLogin={handleLogin} 
      isLoading={loading} 
      error={loginError} 
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Index />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Roles />} />
              <Route path="departments" element={<Departments />} />
              <Route path="institutions" element={<Institutions />} />
              <Route path="preschools" element={<Preschools />} />
              <Route path="regions" element={<Regions />} />
              <Route path="sectors" element={<Sectors />} />
              <Route path="hierarchy" element={<Hierarchy />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="survey-approval" element={<SurveyApproval />} />
              <Route path="survey-results" element={<SurveyResults />} />
              <Route path="survey-archive" element={<SurveyArchive />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="documents" element={<Documents />} />
              <Route path="links" element={<Links />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
