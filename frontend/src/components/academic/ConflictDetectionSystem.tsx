import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { TeacherInfo, TeachingLoad, WorkloadSummary } from './types/teachingLoadTypes';

interface ConflictDetectionSystemProps {
  teachers: TeacherInfo[];
  teachingLoads: TeachingLoad[];
  workloadSummaries: WorkloadSummary[];
  onConflictResolve: (resolvedLoads: TeachingLoad[], resolvedConflicts: any[]) => void;
}

const ConflictDetectionSystem: React.FC<ConflictDetectionSystemProps> = ({
  teachers,
  teachingLoads,
  workloadSummaries,
  onConflictResolve,
}) => {
  return (
    <div className="conflict-detection-system">
      <div className="system-header">
        <h2>
          <Shield size={24} />
          Konflikt Aşkarlama və Həll Sistemi (Demo)
        </h2>
        <p>Bu komponent təkmilləşdirilməkdədir - demo məlumatları yükləndi</p>
      </div>

      <Card className="demo-content">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Demo Rejimi</h3>
          <p>Müəllim sayı: {teachers.length}</p>
          <p>Dərs sayı: {teachingLoads.length}</p>
          <p>İş yükü hesabatı: {workloadSummaries.length}</p>
          <div style={{ marginTop: '20px' }}>
            <p>Konflikt aşkarlanması tezliklə əlavə ediləcək</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConflictDetectionSystem;