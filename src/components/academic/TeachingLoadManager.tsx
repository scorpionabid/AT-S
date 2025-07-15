import React, { useState, useEffect } from 'react';
import { User, BarChart3, PieChart, FileText, Plus } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';

// Import separated components
import TeacherWorkloadView from './TeacherWorkloadView';
import LoadDistributionEngine from './LoadDistributionEngine';
import WorkloadAnalytics from './WorkloadAnalytics';

// Import types
import { TeacherInfo, TeachingLoad, WorkloadSummary } from './types/teachingLoadTypes';

import '../../styles/academic/teaching-load-manager.css';

const TeachingLoadManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workload' | 'distribution' | 'analytics'>('workload');
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [teachingLoads, setTeachingLoads] = useState<TeachingLoad[]>([]);
  const [workloadSummaries, setWorkloadSummaries] = useState<WorkloadSummary[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInfo | null>(null);
  const [academicYear, setAcademicYear] = useState<number>(2024);
  const [isLoading, setIsLoading] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [academicYear]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [teachersData, loadsData, summariesData] = await Promise.all([
        fetchTeachers(),
        fetchTeachingLoads(),
        fetchWorkloadSummaries()
      ]);

      setTeachers(teachersData);
      setTeachingLoads(loadsData);
      setWorkloadSummaries(summariesData);
    } catch (error) {
      toast.error('Məlumatlar yüklənərkən xəta baş verdi.');
      console.error('Data loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async (): Promise<TeacherInfo[]> => {
    const response = await fetch('/api/teachers?with_subjects=true');
    return response.json().then(data => data.data || []);
  };

  const fetchTeachingLoads = async (): Promise<TeachingLoad[]> => {
    const response = await fetch(`/api/teaching-loads?academic_year=${academicYear}`);
    return response.json().then(data => data.data || []);
  };

  const fetchWorkloadSummaries = async (): Promise<WorkloadSummary[]> => {
    const response = await fetch(`/api/teaching-loads/summaries?academic_year=${academicYear}`);
    return response.json().then(data => data.data || []);
  };

  const handleDistributeLoads = async (distributionData: any) => {
    setIsDistributing(true);
    try {
      const response = await fetch('/api/teaching-loads/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year: academicYear,
          ...distributionData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTeachingLoads(result.data.loads);
        setWorkloadSummaries(result.data.summaries);
        toast.success('İş yükü uğurla bölüşdürüldü!');
      } else {
        toast.error(result.message || 'İş yükü bölüşdürülməsində xəta baş verdi.');
      }
    } catch (error) {
      toast.error('İş yükü bölüşdürülməsində xəta baş verdi.');
      console.error('Load distribution error:', error);
    } finally {
      setIsDistributing(false);
    }
  };

  const handleLoadUpdate = (updatedLoad: TeachingLoad) => {
    setTeachingLoads(prev => 
      prev.map(load => 
        load.id === updatedLoad.id ? updatedLoad : load
      )
    );
    // Refresh summaries after update
    fetchWorkloadSummaries().then(setWorkloadSummaries);
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="teaching-load-loading">
          <LoadingSpinner size="large" />
          <p>İş yükü məlumatları yüklənir...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'workload':
        return (
          <TeacherWorkloadView
            teachers={teachers}
            teachingLoads={teachingLoads}
            workloadSummaries={workloadSummaries}
            selectedTeacher={selectedTeacher}
            academicYear={academicYear}
            onTeacherSelect={setSelectedTeacher}
            onLoadUpdate={handleLoadUpdate}
          />
        );
      
      case 'distribution':
        return (
          <LoadDistributionEngine
            teachers={teachers}
            teachingLoads={teachingLoads}
            academicYear={academicYear}
            onDistribute={handleDistributeLoads}
            isDistributing={isDistributing}
          />
        );
      
      case 'analytics':
        return (
          <WorkloadAnalytics
            teachers={teachers}
            teachingLoads={teachingLoads}
            workloadSummaries={workloadSummaries}
            academicYear={academicYear}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="teaching-load-manager">
      <div className="load-header">
        <div className="load-title">
          <h1>
            <User className="title-icon" />
            İş Yükü İdarəetməsi
          </h1>
          <p>Müəllimlərin iş yükünü optimallaşdırın və dərs təyinatlarını idarə edin</p>
        </div>

        <div className="academic-year-selector">
          <label>Təhsil ili:</label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(parseInt(e.target.value))}
          >
            <option value={2023}>2023-2024</option>
            <option value={2024}>2024-2025</option>
            <option value={2025}>2025-2026</option>
          </select>
        </div>

        <div className="load-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('workload')}
            className={currentView === 'workload' ? 'active' : ''}
          >
            <User size={16} />
            İş Yükü
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('distribution')}
            className={currentView === 'distribution' ? 'active' : ''}
          >
            <BarChart3 size={16} />
            Bölüşdürmə
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('analytics')}
            className={currentView === 'analytics' ? 'active' : ''}
          >
            <PieChart size={16} />
            Analitika
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentView('distribution')}
            disabled={isDistributing}
          >
            <Plus size={16} />
            Yeni Təyinat
          </Button>
        </div>
      </div>

      <div className="load-content">
        {renderMainContent()}
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default TeachingLoadManager;