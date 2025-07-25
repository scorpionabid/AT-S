import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/layout/Dashboard';
import SurveysList from '../components/surveys/SurveysList';
import RegionAdminSurveys from './RegionAdminSurveys';

const SurveysPage: React.FC = () => {
  const { user } = useAuth();

  // Show RegionAdmin-specific page for regionadmin users
  if (user?.role === 'regionadmin') {
    return (
      <Dashboard>
        <RegionAdminSurveys />
      </Dashboard>
    );
  }

  // Default view for other roles
  return (
    <Dashboard>
      <SurveysList />
    </Dashboard>
  );
};

export default SurveysPage;