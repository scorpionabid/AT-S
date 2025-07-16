import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import ScheduleGenerator from '../components/schedule/ScheduleGenerator';

const SchedulePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="page-container">
        <h1>Cədvəl Generatoru</h1>
        <p>Dərs cədvəllərini avtomatik yaradın və konfliktləri həll edin</p>
        <ScheduleGenerator />
      </div>
    </DashboardLayout>
  );
};

export default SchedulePage;