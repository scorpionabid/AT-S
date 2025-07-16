import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import ClassAttendanceTracker from '../components/academic/ClassAttendanceTracker';

const ClassAttendancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="page-container">
        <h1>Sinif Davamiyyəti</h1>
        <p>Sinflərdə şagird davamiyyətini izləyin və idarə edin</p>
        <ClassAttendanceTracker />
      </div>
    </DashboardLayout>
  );
};

export default ClassAttendancePage;