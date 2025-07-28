import React from 'react';
import Dashboard from '../components/layout/Dashboard';
import AssessmentDashboardUnified from '../components/assessment/AssessmentDashboardUnified';

const AssessmentPage: React.FC = () => {
  return (
    <Dashboard>
      <AssessmentDashboardUnified />
    </Dashboard>
  );
};

export default AssessmentPage;