import React from 'react';
import Dashboard from '../../components/layout/Dashboard';
import DashboardHome from '../Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <Dashboard>
      <DashboardHome />
    </Dashboard>
  );
};

export default DashboardPage;