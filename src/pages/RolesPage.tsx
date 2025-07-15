import React from 'react';
import Dashboard from '../components/layout/Dashboard';
import RolesList from '../components/roles/RolesList';

const RolesPage: React.FC = () => {
  return (
    <Dashboard>
      <RolesList />
    </Dashboard>
  );
};

export default RolesPage;