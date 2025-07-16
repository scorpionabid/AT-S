import React from 'react';
import Dashboard from '../components/layout/Dashboard';
import SurveyResponseForm from '../components/surveys/SurveyResponseForm';

const SurveyResponsePage: React.FC = () => {
  return (
    <Dashboard>
      <SurveyResponseForm />
    </Dashboard>
  );
};

export default SurveyResponsePage;