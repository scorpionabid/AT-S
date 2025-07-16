import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import TeachingLoadManager from '../components/academic/TeachingLoadManager';

const TeachingLoadPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="page-container">
        <h1>Dərs Yükü İdarəetməsi</h1>
        <p>Müəllimlərin dərs yüklərini izləyin və optimallaşdırın</p>
        <TeachingLoadManager />
      </div>
    </DashboardLayout>
  );
};

export default TeachingLoadPage;