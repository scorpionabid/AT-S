import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/layout/Dashboard';
import UsersList from '../components/users/UsersList';
import RegionAdminUsers from './RegionAdminUsers';

const UsersPage: React.FC = () => {
  const { user } = useAuth();

  // Show RegionAdmin-specific page for regionadmin users
  if (user?.role === 'regionadmin') {
    return (
      <Dashboard>
        <RegionAdminUsers />
      </Dashboard>
    );
  }

  // Default SuperAdmin view
  return (
    <Dashboard>
      <UsersList />
    </Dashboard>
  );
};

export default UsersPage;