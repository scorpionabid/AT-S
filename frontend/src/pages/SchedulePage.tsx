import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import ScheduleGenerator from '../components/schedule/ScheduleGenerator';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiCalendar } from 'react-icons/fi';

const SchedulePage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Cədvəl Generatoru"
        subtitle="Dərs cədvəllərini avtomatik yaradın və konfliktləri həll edin"
        icon={<FiCalendar className="w-6 h-6 text-purple-600" />}
      >
        <ScheduleGenerator />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default SchedulePage;