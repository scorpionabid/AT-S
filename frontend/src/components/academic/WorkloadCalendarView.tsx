import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { TeacherInfo, TeachingLoad, WorkloadSummary } from './types/teachingLoadTypes';

interface WorkloadCalendarViewProps {
  teachers: TeacherInfo[];
  teachingLoads: TeachingLoad[];
  workloadSummaries: WorkloadSummary[];
  selectedTeacher: TeacherInfo | null;
  onTeacherSelect?: (teacher: TeacherInfo | null) => void;
}

const WorkloadCalendarView: React.FC<WorkloadCalendarViewProps> = ({
  teachers,
  teachingLoads,
  workloadSummaries,
  selectedTeacher,
  onTeacherSelect,
}) => {
  return (
    <div className="workload-calendar-view">
      <div className="calendar-container">
        <div className="calendar-title">
          <h2>
            <Calendar size={24} />
            Dərs Cədvəli Təqvimi (Demo)
          </h2>
          <p>Bu komponent təkmilləşdirilməkdədir - demo məlumatları yükləndi</p>
        </div>
        
        <Card className="demo-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3>Demo Rejimi</h3>
            <p>Müəllim sayı: {teachers.length}</p>
            <p>Dərs sayı: {teachingLoads.length}</p>
            <p>Seçilən müəllim: {selectedTeacher ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}` : 'Yoxdur'}</p>
            <div style={{ marginTop: '20px' }}>
              <p>Təqvim görünüşü tezliklə əlavə ediləcək</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkloadCalendarView;