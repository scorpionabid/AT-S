import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import ApprovalDashboard from '../components/approval/ApprovalDashboard';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiCheckCircle } from 'react-icons/fi';

const ApprovalPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Təsdiq Paneli"
        subtitle="Gözləyən təsdiq sorğularını idarə edin"
        icon={<FiCheckCircle className="w-6 h-6 text-orange-600" />}
      >
        <ApprovalDashboard />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default ApprovalPage;