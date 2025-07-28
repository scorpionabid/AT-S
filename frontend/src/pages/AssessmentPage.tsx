import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import AssessmentDashboardUnified from '../components/assessment/AssessmentDashboardUnified';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiAward } from 'react-icons/fi';

const AssessmentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Qiymətləndirmə Sistemi"
        subtitle="KSQ və BSQ nəticələrinin idarəetməsi"
        icon={<FiAward className="w-6 h-6 text-yellow-600" />}
      >
        <AssessmentDashboardUnified />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default AssessmentPage;