import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, Users, BookOpen, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { 
  ScheduleSlot, 
  TimeSlot, 
  ClassInfo, 
  TeacherInfo, 
  ScheduleConflict 
} from './types/scheduleTypes';

interface ScheduleConflictDetectorProps {
  scheduleSlots: ScheduleSlot[];
  classes: ClassInfo[];
  teachers: TeacherInfo[];
  timeSlots: TimeSlot[];
  onConflictsDetected: (conflicts: ScheduleConflict[]) => void;
  onSlotSelect: (slot: ScheduleSlot) => void;
}

const ScheduleConflictDetector: React.FC<ScheduleConflictDetectorProps> = ({
  scheduleSlots,
  classes,
  teachers,
  timeSlots,
  onConflictsDetected,
  onSlotSelect,
}) => {
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [selectedConflictType, setSelectedConflictType] = useState<string>('all');
  const [autoDetect, setAutoDetect] = useState(true);

  // Detect conflicts whenever schedule changes
  useEffect(() => {
    if (autoDetect) {
      detectConflicts();
    }
  }, [scheduleSlots, autoDetect]);

  const detectConflicts = () => {
    const detectedConflicts: ScheduleConflict[] = [];

    // 1. Teacher double booking conflicts
    const teacherConflicts = detectTeacherConflicts();
    detectedConflicts.push(...teacherConflicts);

    // 2. Room conflicts
    const roomConflicts = detectRoomConflicts();
    detectedConflicts.push(...roomConflicts);

    // 3. Class overload conflicts
    const classConflicts = detectClassConflicts();
    detectedConflicts.push(...classConflicts);

    // 4. Teacher overload conflicts
    const overloadConflicts = detectTeacherOverloadConflicts();
    detectedConflicts.push(...overloadConflicts);

    setConflicts(detectedConflicts);
    onConflictsDetected(detectedConflicts);
  };

  const detectTeacherConflicts = (): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    const teacherSchedules: { [key: string]: ScheduleSlot[] } = {};

    // Group slots by teacher and time
    scheduleSlots.forEach(slot => {
      if (slot.status === 'active') {
        const key = `${slot.teacher_id}-${slot.day_of_week}-${slot.period_number}`;
        if (!teacherSchedules[key]) {
          teacherSchedules[key] = [];
        }
        teacherSchedules[key].push(slot);
      }
    });

    // Find conflicts
    Object.entries(teacherSchedules).forEach(([key, slots]) => {
      if (slots.length > 1) {
        const teacherId = parseInt(key.split('-')[0]);
        const teacher = teachers.find(t => t.id === teacherId);
        
        conflicts.push({
          type: 'teacher_double_booking',
          severity: 'critical',
          description: `${teacher?.first_name} ${teacher?.last_name} eyni vaxtda iki fərqli yerdə dərs keçir`,
          affected_slots: slots,
          suggestions: [
            'Müəllimin bir slotunu başqa vaxta köçürün',
            'Başqa müəllim təyin edin',
            'Dərslərdən birini ləğv edin'
          ]
        });
      }
    });

    return conflicts;
  };

  const detectRoomConflicts = (): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    const roomSchedules: { [key: string]: ScheduleSlot[] } = {};

    // Group slots by room and time
    scheduleSlots.forEach(slot => {
      if (slot.status === 'active' && slot.room_location) {
        const key = `${slot.room_location}-${slot.day_of_week}-${slot.period_number}`;
        if (!roomSchedules[key]) {
          roomSchedules[key] = [];
        }
        roomSchedules[key].push(slot);
      }
    });

    // Find conflicts
    Object.entries(roomSchedules).forEach(([key, slots]) => {
      if (slots.length > 1) {
        const room = key.split('-')[0];
        
        conflicts.push({
          type: 'room_conflict',
          severity: 'critical',
          description: `${room} otağında eyni vaxtda iki dərs planlaşdırılıb`,
          affected_slots: slots,
          suggestions: [
            'Dərslərdən birini başqa otağa köçürün',
            'Dərslərdən birini başqa vaxta köçürün',
            'Əlavə otaq tapın'
          ]
        });
      }
    });

    return conflicts;
  };

  const detectClassConflicts = (): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    const classSchedules: { [key: string]: ScheduleSlot[] } = {};

    // Group slots by class and time
    scheduleSlots.forEach(slot => {
      if (slot.status === 'active') {
        const key = `${slot.class_id}-${slot.day_of_week}-${slot.period_number}`;
        if (!classSchedules[key]) {
          classSchedules[key] = [];
        }
        classSchedules[key].push(slot);
      }
    });

    // Find conflicts
    Object.entries(classSchedules).forEach(([key, slots]) => {
      if (slots.length > 1) {
        const classId = parseInt(key.split('-')[0]);
        const classInfo = classes.find(c => c.id === classId);
        
        conflicts.push({
          type: 'class_overload',
          severity: 'critical',
          description: `${classInfo?.name} sinfi üçün eyni vaxtda iki dərs planlaşdırılıb`,
          affected_slots: slots,
          suggestions: [
            'Dərslərdən birini başqa vaxta köçürün',
            'Sinfi iki qrupa bölün',
            'Dərslərdən birini ləğv edin'
          ]
        });
      }
    });

    return conflicts;
  };

  const detectTeacherOverloadConflicts = (): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    const teacherHours: { [key: number]: number } = {};

    // Calculate total hours per teacher
    scheduleSlots.forEach(slot => {
      if (slot.status === 'active') {
        if (!teacherHours[slot.teacher_id]) {
          teacherHours[slot.teacher_id] = 0;
        }
        
        const timeSlot = timeSlots.find(ts => ts.period === slot.period_number);
        const duration = timeSlot?.duration_minutes || 45;
        teacherHours[slot.teacher_id] += duration / 60; // Convert to hours
      }
    });

    // Check for overloads
    Object.entries(teacherHours).forEach(([teacherId, hours]) => {
      const teacher = teachers.find(t => t.id === parseInt(teacherId));
      if (teacher && hours > teacher.max_weekly_hours) {
        const overloadSlots = scheduleSlots.filter(slot => 
          slot.teacher_id === parseInt(teacherId) && slot.status === 'active'
        );

        conflicts.push({
          type: 'teacher_overload',
          severity: 'warning',
          description: `${teacher.first_name} ${teacher.last_name} həftəlik saat limitini aşır (${hours.toFixed(1)}/${teacher.max_weekly_hours})`,
          affected_slots: overloadSlots,
          suggestions: [
            'Bəzi dərsləri başqa müəllimə tapşırın',
            'Müəllimin həftəlik saat limitini artırın',
            'Dərslərin sayını azaldın'
          ]
        });
      }
    });

    return conflicts;
  };

  const filteredConflicts = useMemo(() => {
    if (selectedConflictType === 'all') {
      return conflicts;
    }
    return conflicts.filter(conflict => conflict.type === selectedConflictType);
  }, [conflicts, selectedConflictType]);

  const conflictTypeOptions = [
    { value: 'all', label: 'Bütün konfliktlər', count: conflicts.length },
    { value: 'teacher_double_booking', label: 'Müəllim dublikatları', count: conflicts.filter(c => c.type === 'teacher_double_booking').length },
    { value: 'room_conflict', label: 'Otaq konfliktləri', count: conflicts.filter(c => c.type === 'room_conflict').length },
    { value: 'class_overload', label: 'Sinif yüklənməsi', count: conflicts.filter(c => c.type === 'class_overload').length },
    { value: 'teacher_overload', label: 'Müəllim yüklənməsi', count: conflicts.filter(c => c.type === 'teacher_overload').length },
  ];

  const getSeverityIcon = (severity: ScheduleConflict['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="critical" size={16} />;
      case 'warning':
        return <AlertTriangle className="warning" size={16} />;
      case 'minor':
        return <AlertTriangle className="minor" size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const getSeverityClass = (severity: ScheduleConflict['severity']) => {
    return `conflict-item severity-${severity}`;
  };

  const renderConflictSummary = () => {
    const criticalCount = conflicts.filter(c => c.severity === 'critical').length;
    const warningCount = conflicts.filter(c => c.severity === 'warning').length;
    const minorCount = conflicts.filter(c => c.severity === 'minor').length;

    return (
      <Card className="conflict-summary">
        <div className="summary-header">
          <h3>Konflikt Xülasəsi</h3>
          <div className="auto-detect">
            <label>
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
              />
              Avtomatik aşkar et
            </label>
            {!autoDetect && (
              <Button size="sm" onClick={detectConflicts}>
                Yenidən Yoxla
              </Button>
            )}
          </div>
        </div>

        <div className="summary-stats">
          <div className="stat-item critical">
            <AlertTriangle size={20} />
            <span className="count">{criticalCount}</span>
            <span className="label">Kritik</span>
          </div>
          <div className="stat-item warning">
            <AlertTriangle size={20} />
            <span className="count">{warningCount}</span>
            <span className="label">Xəbərdarlıq</span>
          </div>
          <div className="stat-item minor">
            <AlertTriangle size={20} />
            <span className="count">{minorCount}</span>
            <span className="label">Kiçik</span>
          </div>
        </div>

        {conflicts.length === 0 && (
          <div className="no-conflicts">
            <CheckCircle size={24} className="success" />
            <p>Heç bir konflikt aşkar edilmədi!</p>
          </div>
        )}
      </Card>
    );
  };

  const renderConflictFilters = () => {
    return (
      <Card className="conflict-filters">
        <div className="filter-header">
          <h4>Filtr et</h4>
        </div>
        <div className="filter-options">
          {conflictTypeOptions.map(option => (
            <button
              key={option.value}
              className={`filter-button ${selectedConflictType === option.value ? 'active' : ''}`}
              onClick={() => setSelectedConflictType(option.value)}
            >
              {option.label}
              {option.count > 0 && <span className="count-badge">{option.count}</span>}
            </button>
          ))}
        </div>
      </Card>
    );
  };

  const renderConflictsList = () => {
    return (
      <div className="conflicts-list">
        {filteredConflicts.map((conflict, index) => (
          <Card key={index} className={getSeverityClass(conflict.severity)}>
            <div className="conflict-header">
              <div className="conflict-info">
                {getSeverityIcon(conflict.severity)}
                <span className="conflict-description">{conflict.description}</span>
              </div>
              <span className="conflict-type">{conflict.type.replace('_', ' ')}</span>
            </div>

            <div className="affected-slots">
              <h5>Təsir olunan slotlar:</h5>
              <div className="slots-grid">
                {conflict.affected_slots.map((slot, slotIndex) => {
                  const teacher = teachers.find(t => t.id === slot.teacher_id);
                  const classInfo = classes.find(c => c.id === slot.class_id);
                  
                  return (
                    <div 
                      key={slotIndex} 
                      className="slot-card"
                      onClick={() => onSlotSelect(slot)}
                    >
                      <div className="slot-info">
                        <div className="info-row">
                          <Clock size={14} />
                          <span>Gün {slot.day_of_week}, Saat {slot.period_number}</span>
                        </div>
                        <div className="info-row">
                          <Users size={14} />
                          <span>{classInfo?.name}</span>
                        </div>
                        <div className="info-row">
                          <BookOpen size={14} />
                          <span>{teacher?.first_name} {teacher?.last_name}</span>
                        </div>
                        <div className="info-row">
                          <MapPin size={14} />
                          <span>{slot.room_location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {conflict.suggestions && conflict.suggestions.length > 0 && (
              <div className="conflict-suggestions">
                <h5>Təkliflər:</h5>
                <ul>
                  {conflict.suggestions.map((suggestion, suggestionIndex) => (
                    <li key={suggestionIndex}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="schedule-conflict-detector">
      {renderConflictSummary()}
      {renderConflictFilters()}
      {renderConflictsList()}
    </div>
  );
};

export default ScheduleConflictDetector;