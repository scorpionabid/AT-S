import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import ApprovalDashboard from '../components/approval/ApprovalDashboard';

const ApprovalPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="page-container">
        <h1>Təsdiq Paneli</h1>
        <p>Gözləyən təsdiq sorğularını idarə edin</p>
        <ApprovalDashboard />
      </div>
    </DashboardLayout>
  );
};

export default ApprovalPage;