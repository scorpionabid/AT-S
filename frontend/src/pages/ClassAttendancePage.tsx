import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import ClassAttendanceTracker from '../components/academic/ClassAttendanceTracker';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiUserCheck } from 'react-icons/fi';

const ClassAttendancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Sinif Davamiyyəti"
        subtitle="Sinflərdə şagird davamiyyətini izləyin və idarə edin"
        icon={<FiUserCheck className="w-6 h-6 text-green-600" />}
      >
        <ClassAttendanceTracker />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default ClassAttendancePage;