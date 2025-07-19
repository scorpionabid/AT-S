import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Settings, Save, Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';

// Import separated components
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleSlotEditor from './ScheduleSlotEditor';
import ScheduleConflictDetector from './ScheduleConflictDetector';
import ScheduleTemplateManager from './ScheduleTemplateManager';

// Import types
import { 
  ScheduleSlot, 
  ClassInfo, 
  TeacherInfo, 
  SubjectInfo, 
  ScheduleConflict,
  GenerationSettings,
  TimeSlot 
} from './types/scheduleTypes';

import '../../styles/schedule/schedule-generator.css';

const ScheduleGenerator: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calendar' | 'editor' | 'conflicts' | 'templates'>('calendar');
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    week_start_date: new Date().toISOString().split('T')[0],
    schedule_type: 'weekly',
    working_days: [1, 2, 3, 4, 5], // Monday to Friday
    periods_per_day: 8,
    break_periods: [3, 6],
    lunch_period: 6,
    respect_teacher_preferences: true,
    avoid_conflicts: true,
    allow_room_sharing: false,
    max_consecutive_periods: 4,
    min_break_between_subjects: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [classesData, teachersData, subjectsData, timeSlotsData, existingSchedule] = await Promise.all([
        fetchClasses(),
        fetchTeachers(),
        fetchSubjects(),
        fetchTimeSlots(),
        fetchExistingSchedule()
      ]);

      setClasses(classesData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setTimeSlots(timeSlotsData);
      setScheduleSlots(existingSchedule);
    } catch (error) {
      toast.error('Məlumatlar yüklənərkən xəta baş verdi.');
      console.error('Data loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async (): Promise<ClassInfo[]> => {
    const response = await fetch('/api/classes');
    return response.json().then(data => data.data || []);
  };

  const fetchTeachers = async (): Promise<TeacherInfo[]> => {
    const response = await fetch('/api/teachers');
    return response.json().then(data => data.data || []);
  };

  const fetchSubjects = async (): Promise<SubjectInfo[]> => {
    const response = await fetch('/api/subjects');
    return response.json().then(data => data.data || []);
  };

  const fetchTimeSlots = async (): Promise<TimeSlot[]> => {
    const response = await fetch('/api/schedule/time-slots');
    return response.json().then(data => data.data || []);
  };

  const fetchExistingSchedule = async (): Promise<ScheduleSlot[]> => {
    const response = await fetch('/api/schedule/current');
    return response.json().then(data => data.data || []);
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      
      if (result.success) {
        setScheduleSlots(result.data.schedule);
        setConflicts(result.data.conflicts || []);
        toast.success('Cədvəl uğurla yaradıldı!');
      } else {
        toast.error(result.message || 'Cədvəl yaradılarkən xəta baş verdi.');
      }
    } catch (error) {
      toast.error('Cədvəl yaradılarkən xəta baş verdi.');
      console.error('Schedule generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const response = await fetch('/api/schedule/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: scheduleSlots, settings }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Cədvəl saxlanıldı!');
      } else {
        toast.error(result.message || 'Cədvəl saxlanılarkən xəta baş verdi.');
      }
    } catch (error) {
      toast.error('Cədvəl saxlanılarkən xəta baş verdi.');
      console.error('Schedule save error:', error);
    }
  };

  const handleSlotUpdate = (updatedSlot: ScheduleSlot) => {
    setScheduleSlots(prev => 
      prev.map(slot => 
        slot.id === updatedSlot.id ? updatedSlot : slot
      )
    );
    setSelectedSlot(null);
    // Re-detect conflicts after update
    detectConflicts();
  };

  const detectConflicts = () => {
    // This will be handled by ScheduleConflictDetector component
    // We pass the slots and it returns detected conflicts
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="schedule-loading">
          <LoadingSpinner size="large" />
          <p>Məlumatlar yüklənir...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'calendar':
        return (
          <ScheduleCalendar
            scheduleSlots={scheduleSlots}
            timeSlots={timeSlots}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            onSlotSelect={setSelectedSlot}
            onSlotUpdate={handleSlotUpdate}
            settings={settings}
          />
        );
      
      case 'editor':
        return (
          <ScheduleSlotEditor
            slot={selectedSlot}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            timeSlots={timeSlots}
            onSlotUpdate={handleSlotUpdate}
            onCancel={() => setSelectedSlot(null)}
          />
        );
      
      case 'conflicts':
        return (
          <ScheduleConflictDetector
            scheduleSlots={scheduleSlots}
            classes={classes}
            teachers={teachers}
            timeSlots={timeSlots}
            onConflictsDetected={setConflicts}
            onSlotSelect={setSelectedSlot}
          />
        );
      
      case 'templates':
        return (
          <ScheduleTemplateManager
            onTemplateLoad={(template) => {
              setScheduleSlots(template.slots);
              setSettings(template.settings);
              toast.success('Şablon yükləndi!');
            }}
            currentSchedule={{ slots: scheduleSlots, settings }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="schedule-generator">
      <div className="schedule-header">
        <div className="schedule-title">
          <h1>
            <Calendar className="title-icon" />
            Dərs Cədvəli Generatoru
          </h1>
          <p>Məktəb dərs cədvəlini avtomatik yaradın və idarə edin</p>
        </div>

        <div className="schedule-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('calendar')}
            className={currentView === 'calendar' ? 'active' : ''}
          >
            <Calendar size={16} />
            Cədvəl
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('conflicts')}
            className={currentView === 'conflicts' ? 'active' : ''}
          >
            <AlertTriangle size={16} />
            Konfliktlər ({conflicts.length})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('templates')}
            className={currentView === 'templates' ? 'active' : ''}
          >
            <Settings size={16} />
            Şablonlar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw size={16} className="spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Yeni Cədvəl
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={handleSaveSchedule}
            disabled={scheduleSlots.length === 0}
          >
            <Save size={16} />
            Saxla
          </Button>
        </div>
      </div>

      <div className="schedule-content">
        {renderMainContent()}
      </div>

      {selectedSlot && currentView !== 'editor' && (
        <div className="schedule-quick-edit">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentView('editor')}
          >
            Düzəlt
          </Button>
        </div>
      )}

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

export default ScheduleGenerator;