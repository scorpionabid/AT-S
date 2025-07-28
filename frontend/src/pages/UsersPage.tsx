import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import UsersList from '../components/users/UsersList';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiUsers } from 'react-icons/fi';

const UsersPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="İstifadəçilər"
        subtitle="Sistem istifadəçilərini idarə edin"
        icon={<FiUsers className="w-6 h-6 text-blue-600" />}
      >
        <UsersList />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default UsersPage;