import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import TeachingLoadManager from '../components/academic/TeachingLoadManager';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiClock } from 'react-icons/fi';

const TeachingLoadPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Dərs Yükü İdarəetməsi"
        subtitle="Müəllimlərin dərs yüklərini izləyin və optimallaşdırın"
        icon={<FiClock className="w-6 h-6 text-blue-600" />}
      >
        <TeachingLoadManager />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default TeachingLoadPage;