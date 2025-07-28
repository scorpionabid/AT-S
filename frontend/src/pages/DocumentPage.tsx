import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import DocumentLibrary from '../components/document/DocumentLibrary';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiFileText } from 'react-icons/fi';

const DocumentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Sənəd Kitabxanası"
        subtitle="Regional sənədləri idarə edin və paylaşın"
        icon={<FiFileText className="w-6 h-6 text-indigo-600" />}
      >
        <DocumentLibrary />
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default DocumentPage;