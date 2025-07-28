import React, { useState, useEffect } from 'react';
import { User, BarChart3, PieChart, FileText, Plus, Move, Brain, Calendar, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';

// Import separated components
import TeacherWorkloadView from './TeacherWorkloadView';
import LoadDistributionEngine from './LoadDistributionEngine';
import WorkloadAnalytics from './WorkloadAnalytics';
import DragDropWorkloadAssigner from './DragDropWorkloadAssigner';
import WorkloadOptimizationEngine from './WorkloadOptimizationEngine';
import WorkloadCalendarView from './WorkloadCalendarView';
import ConflictDetectionSystem from './ConflictDetectionSystem';

// Import types
import { TeacherInfo, TeachingLoad, WorkloadSummary } from './types/teachingLoadTypes';


const TeachingLoadManager: React.FC = () => {
  console.log('🚀 TeachingLoadManager: PURE DEMO VERSION - ZERO API CALLS');
  
  const [currentView, setCurrentView] = useState<'workload' | 'distribution' | 'analytics' | 'dragdrop' | 'ai-optimize' | 'calendar' | 'conflicts'>('workload');
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [teachingLoads, setTeachingLoads] = useState<TeachingLoad[]>([]);
  const [workloadSummaries, setWorkloadSummaries] = useState<WorkloadSummary[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherInfo | null>(null);
  const [academicYear, setAcademicYear] = useState<number>(2024);
  const [isLoading, setIsLoading] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  useEffect(() => {
    console.log('🔄 LOADING DEMO DATA - ABSOLUTELY NO API CALLS');
    loadDemoData();
  }, [academicYear]);

  const loadDemoData = () => {
    console.log('📊 Starting demo data load...');
    setIsLoading(true);
    
    try {
      // Load all demo data synchronously
      const demoTeachers = getDemoTeachers();
      const demoLoads = getDemoTeachingLoads();
      const demoSummaries = getDemoWorkloadSummaries();
      
      setTeachers(demoTeachers);
      setTeachingLoads(demoLoads);
      setWorkloadSummaries(demoSummaries);
      
      console.log('✅ Demo data loaded:', { 
        teachers: demoTeachers.length, 
        loads: demoLoads.length, 
        summaries: demoSummaries.length 
      });
      
      toast.success('Demo məlumatları yükləndi!');
      
    } catch (error) {
      console.error('❌ Demo data loading failed:', error);
      toast.error('Demo məlumat yüklənməsində xəta');
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoTeachers = (): TeacherInfo[] => {
    return [
      {
        id: 1,
        first_name: 'Aygün',
        last_name: 'Məmmədova',
        username: 'ayggun.m',
        position: 'Riyaziyyat Müəllimi',
        department: 'Dəqiq Elmlər',
        employment_type: 'full_time',
        max_weekly_hours: 24,
        subjects: [
          { id: 1, name: 'Riyaziyyat', code: 'MAT', qualified_for: true },
          { id: 8, name: 'Informatika', code: 'INF', qualified_for: true }
        ],
        preferences: {
          preferred_subjects: [1, 8],
          preferred_grades: [9, 10, 11],
          max_classes_per_day: 6,
          avoid_early_morning: false,
          avoid_late_afternoon: true
        }
      },
      {
        id: 2,
        first_name: 'Elnur',
        last_name: 'Əliyev',
        username: 'elnur.a',
        position: 'Fizika Müəllimi',
        department: 'Dəqiq Elmlər',
        employment_type: 'full_time',
        max_weekly_hours: 20,
        subjects: [
          { id: 2, name: 'Fizika', code: 'PHY', qualified_for: true },
          { id: 1, name: 'Riyaziyyat', code: 'MAT', qualified_for: false }
        ],
        preferences: {
          preferred_subjects: [2],
          preferred_grades: [10, 11],
          max_classes_per_day: 5,
          avoid_early_morning: true,
          avoid_late_afternoon: false
        }
      },
      {
        id: 3,
        first_name: 'Səbinə',
        last_name: 'Həsənova',
        username: 'sebine.h',
        position: 'Kimya Müəllimi',
        department: 'Dəqiq Elmlər',
        employment_type: 'full_time',
        max_weekly_hours: 22,
        subjects: [
          { id: 3, name: 'Kimya', code: 'CHE', qualified_for: true },
          { id: 8, name: 'Biologiya', code: 'BIO', qualified_for: true }
        ],
        preferences: {
          preferred_subjects: [3, 8],
          preferred_grades: [9, 10, 11],
          max_classes_per_day: 6,
          avoid_early_morning: false,
          avoid_late_afternoon: false
        }
      },
      {
        id: 4,
        first_name: 'Rəşad',
        last_name: 'Quliyev',
        username: 'reshad.q',
        position: 'Tarix Müəllimi',
        department: 'Humanitar Elmlər',
        employment_type: 'part_time',
        max_weekly_hours: 18,
        subjects: [
          { id: 4, name: 'Tarix', code: 'HIS', qualified_for: true },
          { id: 7, name: 'Coğrafiya', code: 'GEO', qualified_for: true }
        ],
        preferences: {
          preferred_subjects: [4],
          preferred_grades: [9, 10],
          max_classes_per_day: 4,
          avoid_early_morning: true,
          avoid_late_afternoon: true
        }
      },
      {
        id: 5,
        first_name: 'Leyla',
        last_name: 'İbrahimova',
        username: 'leyla.i',
        position: 'İngilis dili Müəllimi',
        department: 'Xarici Dillər',
        employment_type: 'full_time',
        max_weekly_hours: 24,
        subjects: [
          { id: 6, name: 'İngilis dili', code: 'ENG', qualified_for: true },
          { id: 5, name: 'Ədəbiyyat', code: 'LIT', qualified_for: false }
        ],
        preferences: {
          preferred_subjects: [6],
          preferred_grades: [9, 10, 11],
          max_classes_per_day: 6,
          avoid_early_morning: false,
          avoid_late_afternoon: false
        }
      }
    ];
  };

  const getDemoTeachingLoads = (): TeachingLoad[] => {
    return [
      {
        id: 1,
        teacher_id: 1,
        class_id: 1,
        subject_id: 1,
        academic_year_id: academicYear,
        weekly_hours: 4,
        total_hours: 144,
        start_date: '2024-09-01',
        status: 'active',
        teacher: {
          id: 1,
          first_name: 'Aygün',
          last_name: 'Məmmədova',
          username: 'ayggun.m',
          position: 'Riyaziyyat Müəllimi',
          employment_type: 'full_time',
          max_weekly_hours: 24,
          subjects: [{ id: 1, name: 'Riyaziyyat', code: 'MAT', qualified_for: true }]
        },
        class_info: {
          id: 1,
          name: '9A',
          grade_level: 9,
          section: 'A',
          current_enrollment: 28
        },
        subject: {
          id: 1,
          name: 'Riyaziyyat',
          short_name: 'Riy',
          code: 'MAT',
          default_weekly_hours: 4
        },
        schedule_slots: [
          {
            day_of_week: 1,
            period_number: 1,
            start_time: '08:00',
            end_time: '08:45',
            room_location: '101'
          },
          {
            day_of_week: 3,
            period_number: 2,
            start_time: '09:55',
            end_time: '10:40',
            room_location: '101'
          }
        ],
        workload_metrics: {
          difficulty_score: 8.5,
          student_count: 28,
          preparation_hours: 2,
          grading_hours: 3
        }
      },
      {
        id: 2,
        teacher_id: 1,
        class_id: 3,
        subject_id: 1,
        academic_year_id: academicYear,
        weekly_hours: 4,
        total_hours: 144,
        start_date: '2024-09-01',
        status: 'active',
        teacher: {
          id: 1,
          first_name: 'Aygün',
          last_name: 'Məmmədova',
          username: 'ayggun.m',
          position: 'Riyaziyyat Müəllimi',
          employment_type: 'full_time',
          max_weekly_hours: 24,
          subjects: [{ id: 1, name: 'Riyaziyyat', code: 'MAT', qualified_for: true }]
        },
        class_info: {
          id: 3,
          name: '10A',
          grade_level: 10,
          section: 'A',
          current_enrollment: 25
        },
        subject: {
          id: 1,
          name: 'Riyaziyyat',
          short_name: 'Riy',
          code: 'MAT',
          default_weekly_hours: 4
        },
        schedule_slots: [
          {
            day_of_week: 2,
            period_number: 3,
            start_time: '10:50',
            end_time: '11:35',
            room_location: '102'
          }
        ],
        workload_metrics: {
          difficulty_score: 9.0,
          student_count: 25,
          preparation_hours: 2.5,
          grading_hours: 3.5
        }
      },
      {
        id: 3,
        teacher_id: 2,
        class_id: 2,
        subject_id: 2,
        academic_year_id: academicYear,
        weekly_hours: 3,
        total_hours: 108,
        start_date: '2024-09-01',
        status: 'active',
        teacher: {
          id: 2,
          first_name: 'Elnur',
          last_name: 'Əliyev',
          username: 'elnur.a',
          position: 'Fizika Müəllimi',
          employment_type: 'full_time',
          max_weekly_hours: 20,
          subjects: [{ id: 2, name: 'Fizika', code: 'PHY', qualified_for: true }]
        },
        class_info: {
          id: 2,
          name: '9B',
          grade_level: 9,
          section: 'B',
          current_enrollment: 26
        },
        subject: {
          id: 2,
          name: 'Fizika',
          short_name: 'Fiz',
          code: 'PHY',
          default_weekly_hours: 3
        },
        schedule_slots: [
          {
            day_of_week: 4,
            period_number: 4,
            start_time: '11:45',
            end_time: '12:30',
            room_location: '201'
          }
        ],
        workload_metrics: {
          difficulty_score: 7.5,
          student_count: 26,
          preparation_hours: 2,
          grading_hours: 2.5
        }
      }
    ];
  };

  const getDemoWorkloadSummaries = (): WorkloadSummary[] => {
    const teachersList = getDemoTeachers();
    const loadsList = getDemoTeachingLoads();
    
    return teachersList.map(teacher => {
      const teacherLoads = loadsList.filter(load => load.teacher_id === teacher.id);
      const totalWeeklyHours = teacherLoads.reduce((sum, load) => sum + load.weekly_hours, 0);
      const utilizationPercentage = (totalWeeklyHours / teacher.max_weekly_hours) * 100;
      
      let status: 'underloaded' | 'optimal' | 'overloaded' | 'critical' = 'underloaded';
      if (utilizationPercentage >= 75 && utilizationPercentage <= 95) {
        status = 'optimal';
      } else if (utilizationPercentage > 95 && utilizationPercentage <= 110) {
        status = 'overloaded';
      } else if (utilizationPercentage > 110) {
        status = 'critical';
      }

      return {
        teacher_id: teacher.id,
        teacher_name: `${teacher.first_name} ${teacher.last_name}`,
        total_weekly_hours: totalWeeklyHours,
        max_weekly_hours: teacher.max_weekly_hours,
        utilization_percentage: Math.round(utilizationPercentage * 10) / 10,
        class_count: new Set(teacherLoads.map(load => load.class_id)).size,
        subject_count: new Set(teacherLoads.map(load => load.subject_id)).size,
        student_count: teacherLoads.reduce((sum, load) => sum + (load.workload_metrics?.student_count || 0), 0),
        difficulty_average: teacherLoads.length > 0 
          ? teacherLoads.reduce((sum, load) => sum + (load.workload_metrics?.difficulty_score || 0), 0) / teacherLoads.length
          : 0,
        workload_balance_score: Math.min(100, Math.max(0, 100 - Math.abs(utilizationPercentage - 85))),
        total_preparation_hours: teacherLoads.reduce((sum, load) => sum + (load.workload_metrics?.preparation_hours || 0), 0),
        total_grading_hours: teacherLoads.reduce((sum, load) => sum + (load.workload_metrics?.grading_hours || 0), 0),
        schedule_conflicts: 0,
        preferred_subject_percentage: teacher.preferences?.preferred_subjects 
          ? (teacherLoads.filter(load => teacher.preferences!.preferred_subjects.includes(load.subject_id)).length / teacherLoads.length) * 100
          : 0,
        employment_type: teacher.employment_type,
        status
      };
    });
  };

  const generateUpdatedSummaries = (newTeachingLoads: TeachingLoad[]): WorkloadSummary[] => {
    return teachers.map(teacher => {
      const teacherLoadsList = newTeachingLoads.filter(load => load.teacher_id === teacher.id);
      const totalWeeklyHours = teacherLoadsList.reduce((sum, load) => sum + load.weekly_hours, 0);
      const utilizationPercentage = teacher.max_weekly_hours > 0 
        ? (totalWeeklyHours / teacher.max_weekly_hours) * 100 
        : 0;
      
      let status: 'underloaded' | 'optimal' | 'overloaded' | 'critical';
      if (utilizationPercentage < 75) status = 'underloaded';
      else if (utilizationPercentage <= 95) status = 'optimal';
      else if (utilizationPercentage <= 110) status = 'overloaded';
      else status = 'critical';

      return {
        teacher_id: teacher.id,
        teacher_name: `${teacher.first_name} ${teacher.last_name}`,
        total_weekly_hours: totalWeeklyHours,
        max_weekly_hours: teacher.max_weekly_hours,
        utilization_percentage: utilizationPercentage,
        subject_count: [...new Set(teacherLoadsList.map(load => load.subject_id))].length,
        class_count: [...new Set(teacherLoadsList.map(load => load.class_id))].length,
        student_count: teacherLoadsList.reduce((sum, load) => sum + (load.workload_metrics?.student_count || 0), 0),
        difficulty_average: teacherLoadsList.length > 0 
          ? teacherLoadsList.reduce((sum, load) => sum + (load.workload_metrics?.difficulty_score || 0), 0) / teacherLoadsList.length
          : 0,
        workload_balance_score: Math.min(100, Math.max(0, 100 - Math.abs(utilizationPercentage - 85))),
        total_preparation_hours: teacherLoadsList.reduce((sum, load) => sum + (load.workload_metrics?.preparation_hours || 0), 0),
        total_grading_hours: teacherLoadsList.reduce((sum, load) => sum + (load.workload_metrics?.grading_hours || 0), 0),
        schedule_conflicts: 0,
        preferred_subject_percentage: teacher.preferences?.preferred_subjects 
          ? (teacherLoadsList.filter(load => teacher.preferences!.preferred_subjects.includes(load.subject_id)).length / teacherLoadsList.length) * 100
          : 0,
        employment_type: teacher.employment_type,
        status
      };
    });
  };

  const handleLoadUpdate = (updatedLoad: TeachingLoad) => {
    setTeachingLoads(prev => 
      prev.map(load => 
        load.id === updatedLoad.id ? updatedLoad : load
      )
    );
    const updatedSummaries = generateUpdatedSummaries(teachingLoads.map(load => 
      load.id === updatedLoad.id ? updatedLoad : load
    ));
    setWorkloadSummaries(updatedSummaries);
  };

  const handleDistributeLoads = async (distributionData: any) => {
    setIsDistributing(true);
    console.log('🎯 Simulating load distribution with demo data');
    
    setTimeout(() => {
      const updatedSummaries = generateUpdatedSummaries(teachingLoads);
      setWorkloadSummaries(updatedSummaries);
      toast.success('Demo iş yükü uğurla bölüşdürüldü!');
      setIsDistributing(false);
    }, 2000);
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="teaching-load-loading">
          <LoadingSpinner size="large" />
          <p>Demo məlumatları yüklənir...</p>
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
      
      case 'dragdrop':
        return (
          <DragDropWorkloadAssigner
            teachers={teachers}
            teachingLoads={teachingLoads}
            workloadSummaries={workloadSummaries}
            onAssignmentChange={(newAssignments) => {
              setTeachingLoads(newAssignments);
              const updatedSummaries = generateUpdatedSummaries(newAssignments);
              setWorkloadSummaries(updatedSummaries);
              toast.success('İş yükü təyinatları yeniləndi!');
            }}
          />
        );
      
      case 'ai-optimize':
        return (
          <WorkloadOptimizationEngine
            teachers={teachers}
            teachingLoads={teachingLoads}
            workloadSummaries={workloadSummaries}
            onOptimizationApply={(optimizedLoads, appliedSuggestions) => {
              setTeachingLoads(optimizedLoads);
              const updatedSummaries = generateUpdatedSummaries(optimizedLoads);
              setWorkloadSummaries(updatedSummaries);
              console.log('AI optimizations applied:', appliedSuggestions.length);
            }}
          />
        );
      
      case 'calendar':
        return (
          <WorkloadCalendarView
            teachers={teachers}
            teachingLoads={teachingLoads}
            workloadSummaries={workloadSummaries}
            selectedTeacher={selectedTeacher}
            onTeacherSelect={setSelectedTeacher}
          />
        );
      
      case 'conflicts':
        return (
          <ConflictDetectionSystem
            teachers={teachers}
            teachingLoads={teachingLoads}
            workloadSummaries={workloadSummaries}
            onConflictResolve={(resolvedLoads, resolvedConflicts) => {
              setTeachingLoads(resolvedLoads);
              const updatedSummaries = generateUpdatedSummaries(resolvedLoads);
              setWorkloadSummaries(updatedSummaries);
              console.log('Conflicts resolved:', resolvedConflicts.length);
            }}
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
            İş Yükü İdarəetməsi (Demo)
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
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('dragdrop')}
            className={currentView === 'dragdrop' ? 'active' : ''}
          >
            <Move size={16} />
            Drag & Drop
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('ai-optimize')}
            className={currentView === 'ai-optimize' ? 'active' : ''}
          >
            <Brain size={16} />
            AI Optimallaşdırma
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('calendar')}
            className={currentView === 'calendar' ? 'active' : ''}
          >
            <Calendar size={16} />
            Təqvim
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('conflicts')}
            className={currentView === 'conflicts' ? 'active' : ''}
          >
            <Shield size={16} />
            Konfliktlər
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