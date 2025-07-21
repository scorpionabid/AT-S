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
  console.log('ScheduleGenerator: UPDATED VERSION - NO API CALLS - TIMESTAMP: 2025-07-20 23:25');
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
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    setIsLoading(true);
    console.log('loadInitialData: Starting direct mock data load');
    
    // Load mock data directly - no async operations
    setClasses(getMockClasses());
    setTeachers(getMockTeachers());
    setSubjects(getMockSubjects());
    setTimeSlots(getMockTimeSlots());
    setScheduleSlots(getMockScheduleSlots());

    // Show success message for demo data
    toast.success('Demo məlumatlar yükləndi!');
    setIsLoading(false);
    console.log('loadInitialData: Mock data loaded successfully');
  };

  const getMockClasses = (): ClassInfo[] => {
    console.log('getMockClasses: Returning static mock data');
    return [
      { id: 1, name: '9A', grade_level: 9, section: 'A', max_capacity: 30, current_enrollment: 28 },
      { id: 2, name: '9B', grade_level: 9, section: 'B', max_capacity: 30, current_enrollment: 26 },
      { id: 3, name: '10A', grade_level: 10, section: 'A', max_capacity: 30, current_enrollment: 29 },
      { id: 4, name: '10B', grade_level: 10, section: 'B', max_capacity: 30, current_enrollment: 27 },
      { id: 5, name: '11A', grade_level: 11, section: 'A', max_capacity: 25, current_enrollment: 24 },
      { id: 6, name: '11B', grade_level: 11, section: 'B', max_capacity: 25, current_enrollment: 23 },
    ];
  };

  const getMockTeachers = (): TeacherInfo[] => {
    console.log('getMockTeachers: Returning static mock data');
    return [
      {
        id: 1,
        first_name: 'Aygün',
        last_name: 'Məmmədova',
        username: 'ayggun.m',
        subjects: [{ id: 1, name: 'Riyaziyyat', code: 'MAT' }],
        max_weekly_hours: 24,
        current_weekly_hours: 18
      },
      {
        id: 2,
        first_name: 'Elnur',
        last_name: 'Əliyev',
        username: 'elnur.a',
        subjects: [{ id: 2, name: 'Fizika', code: 'PHY' }],
        max_weekly_hours: 20,
        current_weekly_hours: 16
      },
      {
        id: 3,
        first_name: 'Səbinə',
        last_name: 'Həsənova',
        username: 'sebine.h',
        subjects: [{ id: 3, name: 'Kimya', code: 'CHE' }],
        max_weekly_hours: 22,
        current_weekly_hours: 19
      },
      {
        id: 4,
        first_name: 'Rəşad',
        last_name: 'Quliyev',
        username: 'reshad.q',
        subjects: [{ id: 4, name: 'Tarix', code: 'HIS' }],
        max_weekly_hours: 18,
        current_weekly_hours: 15
      },
      {
        id: 5,
        first_name: 'Leyla',
        last_name: 'İbrahimova',
        username: 'leyla.i',
        subjects: [{ id: 5, name: 'Ədəbiyyat', code: 'LIT' }],
        max_weekly_hours: 20,
        current_weekly_hours: 17
      }
    ];
  };

  const getMockSubjects = (): SubjectInfo[] => {
    console.log('getMockSubjects: Returning static mock data');
    return [
      { id: 1, name: 'Riyaziyyat', short_name: 'Riy', code: 'MAT', default_weekly_hours: 4 },
      { id: 2, name: 'Fizika', short_name: 'Fiz', code: 'PHY', default_weekly_hours: 3 },
      { id: 3, name: 'Kimya', short_name: 'Kim', code: 'CHE', default_weekly_hours: 3 },
      { id: 4, name: 'Tarix', short_name: 'Tar', code: 'HIS', default_weekly_hours: 2 },
      { id: 5, name: 'Ədəbiyyat', short_name: 'Ədb', code: 'LIT', default_weekly_hours: 3 },
      { id: 6, name: 'İngilis dili', short_name: 'İng', code: 'ENG', default_weekly_hours: 3 },
      { id: 7, name: 'Coğrafiya', short_name: 'Coğ', code: 'GEO', default_weekly_hours: 2 },
      { id: 8, name: 'Biologiya', short_name: 'Bio', code: 'BIO', default_weekly_hours: 2 }
    ];
  };

  const getMockTimeSlots = (): TimeSlot[] => {
    console.log('getMockTimeSlots: Returning static mock data');
    return [
      { period: 1, start_time: '09:00', end_time: '09:45', duration_minutes: 45 },
      { period: 2, start_time: '09:55', end_time: '10:40', duration_minutes: 45 },
      { period: 3, start_time: '10:50', end_time: '11:35', duration_minutes: 45 },
      { period: 4, start_time: '11:45', end_time: '12:30', duration_minutes: 45 },
      { period: 5, start_time: '13:30', end_time: '14:15', duration_minutes: 45 },
      { period: 6, start_time: '14:25', end_time: '15:10', duration_minutes: 45 },
      { period: 7, start_time: '15:20', end_time: '16:05', duration_minutes: 45 },
      { period: 8, start_time: '16:15', end_time: '17:00', duration_minutes: 45 }
    ];
  };

  const getMockScheduleSlots = (): ScheduleSlot[] => {
    console.log('getMockScheduleSlots: Returning static mock data');
    return [
      {
        id: 1,
        day_of_week: 1,
        period_number: 1,
        class_id: 1,
        subject_id: 1,
        teacher_id: 1,
        room_location: '101',
        start_time: '09:00',
        end_time: '09:45',
        slot_type: 'regular',
        status: 'active',
        notes: '9A sinfi üçün riyaziyyat dərsi'
      },
      {
        id: 2,
        day_of_week: 1,
        period_number: 2,
        class_id: 2,
        subject_id: 2,
        teacher_id: 2,
        room_location: '201',
        start_time: '09:55',
        end_time: '10:40',
        slot_type: 'regular',
        status: 'active',
        notes: '9B sinfi üçün fizika dərsi'
      },
      {
        id: 3,
        day_of_week: 2,
        period_number: 1,
        class_id: 3,
        subject_id: 3,
        teacher_id: 3,
        room_location: 'Lab-1',
        start_time: '09:00',
        end_time: '09:45',
        slot_type: 'regular',
        status: 'active',
        notes: '10A sinfi üçün kimya dərsi'
      },
      {
        id: 4,
        day_of_week: 3,
        period_number: 3,
        class_id: 1,
        subject_id: 4,
        teacher_id: 4,
        room_location: '105',
        start_time: '10:50',
        end_time: '11:35',
        slot_type: 'regular',
        status: 'active',
        notes: '9A sinfi üçün tarix dərsi'
      },
      {
        id: 5,
        day_of_week: 4,
        period_number: 2,
        class_id: 5,
        subject_id: 5,
        teacher_id: 5,
        room_location: '301',
        start_time: '09:55',
        end_time: '10:40',
        slot_type: 'regular',
        status: 'active',
        notes: '11A sinfi üçün ədəbiyyat dərsi'
      }
    ];
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    
    // Always generate mock schedule in demo mode
    setTimeout(() => {
      const mockSchedule = generateMockSchedule();
      setScheduleSlots(mockSchedule);
      setConflicts([]);
      toast.success('Demo cədvəl yaradıldı!');
      setIsGenerating(false);
    }, 1200); // Simulate generation time
  };

  const generateMockSchedule = (): ScheduleSlot[] => {
    const newSchedule: ScheduleSlot[] = [];
    let id = scheduleSlots.length + 1;

    // Generate schedule for each working day and period
    settings.working_days.forEach(day => {
      for (let period = 1; period <= settings.periods_per_day; period++) {
        // Skip break periods
        if (settings.break_periods.includes(period)) return;

        // Randomly assign classes, subjects, and teachers
        const classId = Math.floor(Math.random() * 6) + 1;
        const subjectId = Math.floor(Math.random() * 8) + 1;
        const teacherId = Math.floor(Math.random() * 5) + 1;
        const timeSlot = timeSlots.find(ts => ts.period === period);

        newSchedule.push({
          id: id++,
          day_of_week: day,
          period_number: period,
          class_id: classId,
          subject_id: subjectId,
          teacher_id: teacherId,
          room_location: `${Math.floor(Math.random() * 3) + 1}0${Math.floor(Math.random() * 9) + 1}`,
          start_time: timeSlot?.start_time || '09:00',
          end_time: timeSlot?.end_time || '09:45',
          slot_type: 'regular',
          status: 'active',
          notes: `Avtomatik yaradılmış dərs`
        });
      }
    });

    return newSchedule;
  };

  const handleSaveSchedule = async () => {
    // Always simulate save in demo mode
    toast.success('Cədvəl demo olaraq saxlanıldı!');
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

  // Export functions
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({
      slots: scheduleSlots,
      settings,
      exportDate: new Date().toISOString(),
      metadata: {
        totalSlots: scheduleSlots.length,
        workingDays: settings.working_days.length,
        periodsPerDay: settings.periods_per_day,
      }
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('JSON formatında export edildi!');
  };

  const handleExportCSV = () => {
    const dayNames = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];
    
    // Create CSV header
    const headers = [
      'Gün',
      'Saat',
      'Başlanğıc vaxtı',
      'Bitiş vaxtı',
      'Sinif',
      'Fənn',
      'Müəllim',
      'Otaq',
      'Status',
      'Növ',
      'Qeydlər'
    ];
    
    // Create CSV data
    const csvData = scheduleSlots.map(slot => {
      const teacher = teachers.find(t => t.id === slot.teacher_id);
      const classInfo = classes.find(c => c.id === slot.class_id);
      const subject = subjects.find(s => s.id === slot.subject_id);
      
      return [
        dayNames[slot.day_of_week - 1] || '',
        slot.period_number.toString(),
        slot.start_time,
        slot.end_time,
        classInfo?.name || '',
        subject?.name || '',
        teacher ? `${teacher.first_name} ${teacher.last_name}` : '',
        slot.room_location || '',
        slot.status === 'active' ? 'Aktiv' : 
        slot.status === 'cancelled' ? 'Ləğv edilmiş' :
        slot.status === 'moved' ? 'Köçürülmüş' : 'Əvəzlənmiş',
        slot.slot_type === 'regular' ? 'Adi dərs' :
        slot.slot_type === 'exam' ? 'İmtahan' :
        slot.slot_type === 'break' ? 'Fasilə' : 'Xüsusi',
        slot.notes || ''
      ];
    });
    
    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('CSV formatında export edildi!');
  };

  const handleExportPDF = () => {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const dayNames = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];
    const workingDays = settings.working_days.map(day => ({
      number: day,
      name: dayNames[day - 1]
    }));
    
    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Dərs Cədvəli</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #2563eb; margin-bottom: 10px; }
          .header p { color: #666; margin: 5px 0; }
          .schedule-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          .schedule-table th { background-color: #f8fafc; font-weight: bold; }
          .schedule-table .time-cell { background-color: #f1f5f9; font-weight: bold; }
          .schedule-table .slot-content { font-size: 12px; line-height: 1.4; }
          .subject-name { font-weight: bold; color: #1f2937; }
          .teacher-name { color: #6b7280; }
          .class-name { color: #374151; }
          .room-name { color: #9ca3af; font-style: italic; }
          .empty-slot { color: #d1d5db; font-style: italic; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dərs Cədvəli</h1>
          <p>Export tarixi: ${new Date().toLocaleDateString('az')}</p>
          <p>Ümumi dərs sayı: ${scheduleSlots.length}</p>
        </div>
        
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Saat</th>
              ${workingDays.map(day => `<th>${day.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${timeSlots.map(timeSlot => `
              <tr>
                <td class="time-cell">
                  ${timeSlot.period}<br>
                  <small>${timeSlot.start_time} - ${timeSlot.end_time}</small>
                </td>
                ${workingDays.map(day => {
                  const slot = scheduleSlots.find(s => 
                    s.day_of_week === day.number && s.period_number === timeSlot.period
                  );
                  
                  if (!slot) {
                    return `<td class="empty-slot">Boş</td>`;
                  }
                  
                  const teacher = teachers.find(t => t.id === slot.teacher_id);
                  const classInfo = classes.find(c => c.id === slot.class_id);
                  const subject = subjects.find(s => s.id === slot.subject_id);
                  
                  return `
                    <td>
                      <div class="slot-content">
                        <div class="subject-name">${subject?.name || ''}</div>
                        <div class="teacher-name">${teacher ? `${teacher.first_name} ${teacher.last_name}` : ''}</div>
                        <div class="class-name">${classInfo?.name || ''}</div>
                        <div class="room-name">${slot.room_location || ''}</div>
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Bu cədvəl ATİS sistemi tərəfindən yaradılmışdır.</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    toast.success('PDF formatında export edildi!');
  };

  const handlePrintSchedule = () => {
    handleExportPDF();
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
          <div className="view-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('calendar')}
              className={currentView === 'calendar' ? 'active' : ''}
            >
              <Calendar size={16} />
              <span className="button-text">Cədvəl</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('conflicts')}
              className={currentView === 'conflicts' ? 'active' : ''}
            >
              <AlertTriangle size={16} />
              <span className="button-text">Konfliktlər</span>
              {conflicts.length > 0 && <span className="conflict-badge">{conflicts.length}</span>}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('templates')}
              className={currentView === 'templates' ? 'active' : ''}
            >
              <Settings size={16} />
              <span className="button-text">Şablonlar</span>
            </Button>
          </div>

          <div className="action-buttons">
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
              <span className="button-text">Yeni Cədvəl</span>
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={handleSaveSchedule}
              disabled={scheduleSlots.length === 0}
            >
              <Save size={16} />
              <span className="button-text">Saxla</span>
            </Button>

            <div className="export-dropdown">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={scheduleSlots.length === 0}
                className="export-trigger"
              >
                <Download size={16} />
                <span className="button-text">Export</span>
              </Button>

              {showExportMenu && (
                <div className="export-menu">
                  <button
                    className="export-option"
                    onClick={() => {
                      handleExportJSON();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download size={14} />
                    JSON formatı
                  </button>
                  <button
                    className="export-option"
                    onClick={() => {
                      handleExportCSV();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download size={14} />
                    CSV formatı
                  </button>
                  <button
                    className="export-option"
                    onClick={() => {
                      handleExportPDF();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download size={14} />
                    PDF formatı
                  </button>
                  <button
                    className="export-option"
                    onClick={() => {
                      handlePrintSchedule();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download size={14} />
                    Çap et
                  </button>
                </div>
              )}
            </div>
          </div>
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