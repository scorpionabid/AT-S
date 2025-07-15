import React, { useMemo, useState } from 'react';
import { Clock, Users, BookOpen, MapPin, Edit3, Eye, Copy, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  ScheduleSlot, 
  TimeSlot, 
  ClassInfo, 
  TeacherInfo, 
  SubjectInfo,
  GenerationSettings 
} from './types/scheduleTypes';

interface ScheduleCalendarProps {
  scheduleSlots: ScheduleSlot[];
  timeSlots: TimeSlot[];
  classes: ClassInfo[];
  teachers: TeacherInfo[];
  subjects: SubjectInfo[];
  onSlotSelect: (slot: ScheduleSlot) => void;
  onSlotUpdate: (slot: ScheduleSlot) => void;
  settings: GenerationSettings;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  scheduleSlots,
  timeSlots,
  classes,
  teachers,
  subjects,
  onSlotSelect,
  onSlotUpdate,
  settings,
}) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'teacher' | 'class'>('week');
  const [selectedFilter, setSelectedFilter] = useState<{
    type: 'teacher' | 'class' | 'subject' | null;
    id: number | null;
  }>({ type: null, id: null });

  const dayNames = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];
  
  // Get working days based on settings
  const workingDays = useMemo(() => {
    return settings.working_days.map(day => ({
      number: day,
      name: dayNames[day - 1],
    }));
  }, [settings.working_days]);

  // Create schedule grid
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: ScheduleSlot | null } = {};
    
    // Initialize grid
    workingDays.forEach(day => {
      timeSlots.forEach(timeSlot => {
        const key = `${day.number}-${timeSlot.period}`;
        grid[key] = null;
      });
    });

    // Fill grid with slots
    scheduleSlots.forEach(slot => {
      const key = `${slot.day_of_week}-${slot.period_number}`;
      grid[key] = slot;
    });

    return grid;
  }, [scheduleSlots, workingDays, timeSlots]);

  // Filter slots based on selected filter
  const filteredSlots = useMemo(() => {
    if (!selectedFilter.type || !selectedFilter.id) {
      return scheduleSlots;
    }

    return scheduleSlots.filter(slot => {
      switch (selectedFilter.type) {
        case 'teacher':
          return slot.teacher_id === selectedFilter.id;
        case 'class':
          return slot.class_id === selectedFilter.id;
        case 'subject':
          return slot.subject_id === selectedFilter.id;
        default:
          return true;
      }
    });
  }, [scheduleSlots, selectedFilter]);

  const getSlotInfo = (slot: ScheduleSlot) => {
    const teacher = teachers.find(t => t.id === slot.teacher_id);
    const classInfo = classes.find(c => c.id === slot.class_id);
    const subject = subjects.find(s => s.id === slot.subject_id);

    return {
      teacher: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Müəllim seçilməyib',
      class: classInfo?.name || 'Sinif seçilməyib',
      subject: subject?.name || 'Fənn seçilməyib',
      room: slot.room_location || 'Otaq təyin edilməyib',
    };
  };

  const getSlotClass = (slot: ScheduleSlot | null) => {
    if (!slot) return 'schedule-slot empty';
    
    const baseClass = 'schedule-slot filled';
    const statusClass = `status-${slot.status}`;
    const typeClass = `type-${slot.slot_type}`;
    
    return `${baseClass} ${statusClass} ${typeClass}`;
  };

  const handleSlotClick = (slot: ScheduleSlot | null) => {
    if (slot) {
      onSlotSelect(slot);
    }
  };

  const handleSlotAction = (slot: ScheduleSlot, action: 'edit' | 'copy' | 'delete') => {
    switch (action) {
      case 'edit':
        onSlotSelect(slot);
        break;
      case 'copy':
        const copiedSlot = { ...slot, id: undefined };
        // You would implement slot copying logic here
        break;
      case 'delete':
        onSlotUpdate({ ...slot, status: 'cancelled' });
        break;
    }
  };

  const renderSlot = (slot: ScheduleSlot | null, day: number, period: number) => {
    if (!slot) {
      return (
        <div 
          key={`${day}-${period}`}
          className={getSlotClass(slot)}
          onClick={() => handleSlotClick(slot)}
        >
          <div className="slot-content empty-slot">
            <span>Boş</span>
          </div>
        </div>
      );
    }

    const info = getSlotInfo(slot);
    const isFiltered = selectedFilter.type && (
      (selectedFilter.type === 'teacher' && slot.teacher_id !== selectedFilter.id) ||
      (selectedFilter.type === 'class' && slot.class_id !== selectedFilter.id) ||
      (selectedFilter.type === 'subject' && slot.subject_id !== selectedFilter.id)
    );

    return (
      <div 
        key={`${day}-${period}-${slot.id}`}
        className={`${getSlotClass(slot)} ${isFiltered ? 'filtered-out' : ''}`}
        onClick={() => handleSlotClick(slot)}
      >
        <div className="slot-content">
          <div className="slot-header">
            <span className="subject-name">{info.subject}</span>
            <div className="slot-actions">
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlotAction(slot, 'edit');
                }}
              >
                <Edit3 size={12} />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlotAction(slot, 'copy');
                }}
              >
                <Copy size={12} />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlotAction(slot, 'delete');
                }}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
          <div className="slot-details">
            <div className="detail-row">
              <Users size={12} />
              <span>{info.class}</span>
            </div>
            <div className="detail-row">
              <BookOpen size={12} />
              <span>{info.teacher}</span>
            </div>
            <div className="detail-row">
              <MapPin size={12} />
              <span>{info.room}</span>
            </div>
          </div>
          {slot.notes && (
            <div className="slot-notes">
              <small>{slot.notes}</small>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="schedule-week-view">
        <div className="schedule-grid">
          {/* Header row with days */}
          <div className="grid-header">
            <div className="time-header">Vaxt</div>
            {workingDays.map(day => (
              <div key={day.number} className="day-header">
                {day.name}
              </div>
            ))}
          </div>

          {/* Time rows */}
          {timeSlots.map(timeSlot => (
            <div key={timeSlot.period} className="time-row">
              <div className="time-label">
                <div className="period-number">{timeSlot.period}</div>
                <div className="time-range">
                  <Clock size={12} />
                  {timeSlot.start_time} - {timeSlot.end_time}
                </div>
              </div>
              {workingDays.map(day => {
                const slot = scheduleGrid[`${day.number}-${timeSlot.period}`];
                return (
                  <div key={`${day.number}-${timeSlot.period}`} className="time-slot">
                    {renderSlot(slot, day.number, timeSlot.period)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <Card className="schedule-filters">
        <div className="filter-group">
          <label>Görünüş rejimi:</label>
          <div className="filter-buttons">
            <Button
              variant={viewMode === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Həftə
            </Button>
            <Button
              variant={viewMode === 'day' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Gün
            </Button>
            <Button
              variant={viewMode === 'teacher' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('teacher')}
            >
              Müəllim
            </Button>
            <Button
              variant={viewMode === 'class' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('class')}
            >
              Sinif
            </Button>
          </div>
        </div>

        <div className="filter-group">
          <label>Filtr:</label>
          <select
            value={selectedFilter.type || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setSelectedFilter({ type: value as any, id: null });
              } else {
                setSelectedFilter({ type: null, id: null });
              }
            }}
          >
            <option value="">Hamısı</option>
            <option value="teacher">Müəllim</option>
            <option value="class">Sinif</option>
            <option value="subject">Fənn</option>
          </select>

          {selectedFilter.type && (
            <select
              value={selectedFilter.id || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                setSelectedFilter(prev => ({ ...prev, id }));
              }}
            >
              <option value="">Seçin...</option>
              {selectedFilter.type === 'teacher' && teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
              {selectedFilter.type === 'class' && classes.map(classInfo => (
                <option key={classInfo.id} value={classInfo.id}>
                  {classInfo.name}
                </option>
              ))}
              {selectedFilter.type === 'subject' && subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="filter-stats">
          <span>Ümumi slotlar: {scheduleSlots.length}</span>
          {selectedFilter.type && (
            <span>Filtrlənmiş: {filteredSlots.length}</span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="schedule-calendar">
      {renderFilters()}
      
      <div className="calendar-content">
        {viewMode === 'week' && renderWeekView()}
        {/* Add other view modes here */}
      </div>
    </div>
  );
};

export default ScheduleCalendar;