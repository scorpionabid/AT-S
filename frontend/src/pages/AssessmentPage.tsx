import React from 'react';
import Dashboard from '../components/layout/Dashboard';
import AssessmentDashboard from '../components/assessment/AssessmentDashboard';

const AssessmentPage: React.FC = () => {
  return (
    <Dashboard>
      <AssessmentDashboard />
    </Dashboard>
  );
};

export default AssessmentPage;