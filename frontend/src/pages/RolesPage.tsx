import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import RolesList from '../components/roles/RolesList';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiShield } from 'react-icons/fi';

const RolesPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Rol İdarəetməsi"
        subtitle="Sistem rollarını və icazələrini idarə edin"
        icon={<FiShield className="w-6 h-6 text-red-600" />}
      >
        <RolesList />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default RolesPage;