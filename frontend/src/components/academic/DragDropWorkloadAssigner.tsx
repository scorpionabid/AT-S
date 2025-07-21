import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { TeacherInfo, TeachingLoad, WorkloadSummary } from './types/teachingLoadTypes';

interface DragDropWorkloadAssignerProps {
  teachers: TeacherInfo[];
  teachingLoads: TeachingLoad[];
  workloadSummaries: WorkloadSummary[];
  onAssignmentChange: (newAssignments: TeachingLoad[]) => void;
}

const DragDropWorkloadAssigner: React.FC<DragDropWorkloadAssignerProps> = ({
  teachers,
  teachingLoads,
  workloadSummaries,
  onAssignmentChange,
}) => {
  return (
    <div className="drag-drop-workload-assigner">
      <div className="assigner-header">
        <h2>
          <Plus size={24} />
          Sürükle-Burax Dərs Təyinatı (Demo)
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
            <p>Drag & Drop funksionallığı tezliklə əlavə ediləcək</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DragDropWorkloadAssigner;