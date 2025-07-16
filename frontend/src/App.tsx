import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { SessionProvider } from './contexts/SessionProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import SimpleLoginTest from './components/test/SimpleLoginTest';
import MinimalTest from './components/test/MinimalTest';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/UsersPage';
import SurveysPage from './pages/SurveysPage';
import SurveyResponsePage from './pages/SurveyResponsePage';
import RolesPage from './pages/RolesPage';
import InstitutionsPage from './pages/InstitutionsPage';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import AssessmentPage from './pages/AssessmentPage';
import ClassAttendancePage from './pages/ClassAttendancePage';
import ApprovalPage from './pages/ApprovalPage';
import TaskPage from './pages/TaskPage';
import DocumentPage from './pages/DocumentPage';
import SchedulePage from './pages/SchedulePage';
import TeachingLoadPage from './pages/TeachingLoadPage';
import { ROLES, ROLE_GROUPS } from './constants/roles';
import ErrorBoundary from './components/debug/ErrorBoundary';
import TestTailwind from './components/TestTailwind';
import TailwindTest from './components/test/TailwindTest';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
          <SessionProvider>
            <LayoutProvider>
            <Router>
            <div className="App">
              <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-test" element={<SimpleLoginTest />} />
            <Route path="/minimal-test" element={<MinimalTest />} />
            <Route path="/test" element={<TestTailwind />} />
            <Route path="/tailwind-test" element={<TailwindTest />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_MANAGE_USERS]}>
                  <UsersPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/surveys" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_RESPOND_SURVEYS]}>
                  <SurveysPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/surveys/:surveyId/respond" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_RESPOND_SURVEYS]}>
                  <SurveyResponsePage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/roles" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.SYSTEM_LEVEL]}>
                  <RolesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/institutions" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_MANAGE_USERS]}>
                  <InstitutionsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/assessments" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.ALL_ADMINS]}>
                  <AssessmentPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.ALL_ADMINS]}>
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.SYSTEM_LEVEL]}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />

            {/* FAZA 12: New Component Pages */}
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_MANAGE_ATTENDANCE]}>
                  <ClassAttendancePage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/approvals" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_APPROVE_DATA]}>
                  <ApprovalPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_ASSIGN_TASKS]}>
                  <TaskPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/schedules" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_MANAGE_SCHEDULES]}>
                  <SchedulePage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/teaching-loads" 
              element={
                <ProtectedRoute requiredRoles={[...ROLE_GROUPS.CAN_MANAGE_TEACHING_LOADS]}>
                  <TeachingLoadPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
            </Router>
            </LayoutProvider>
          </SessionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;