import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import DocumentLibrary from '../components/document/DocumentLibrary';

const DocumentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="page-container">
        <h1>Sənəd Kitabxanası</h1>
        <p>Regional sənədləri idarə edin və paylaşın</p>
        <DocumentLibrary />
      </div>
    </DashboardLayout>
  );
};

export default DocumentPage;