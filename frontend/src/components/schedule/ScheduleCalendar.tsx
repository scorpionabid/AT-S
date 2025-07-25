import React, { useMemo, useState } from 'react';
import { Clock, Users, BookOpen, MapPin, Edit3, Eye, Copy, Trash2, Move, Search, Filter, X } from 'lucide-react';
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
  const [draggedSlot, setDraggedSlot] = useState<ScheduleSlot | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{day: number, period: number} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    timeRange: { start: '', end: '' },
    days: [] as number[],
    rooms: [] as string[],
  });

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

  // Enhanced filtering with search and advanced filters
  const filteredSlots = useMemo(() => {
    let slots = scheduleSlots;

    // Basic filter
    if (selectedFilter.type && selectedFilter.id) {
      slots = slots.filter(slot => {
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
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      slots = slots.filter(slot => {
        const teacher = teachers.find(t => t.id === slot.teacher_id);
        const classInfo = classes.find(c => c.id === slot.class_id);
        const subject = subjects.find(s => s.id === slot.subject_id);
        
        return (
          teacher?.first_name?.toLowerCase().includes(searchLower) ||
          teacher?.last_name?.toLowerCase().includes(searchLower) ||
          classInfo?.name?.toLowerCase().includes(searchLower) ||
          subject?.name?.toLowerCase().includes(searchLower) ||
          slot.room_location?.toLowerCase().includes(searchLower) ||
          slot.notes?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Advanced filters
    if (advancedFilters.status.length > 0) {
      slots = slots.filter(slot => advancedFilters.status.includes(slot.status));
    }

    if (advancedFilters.type.length > 0) {
      slots = slots.filter(slot => advancedFilters.type.includes(slot.slot_type));
    }

    if (advancedFilters.days.length > 0) {
      slots = slots.filter(slot => advancedFilters.days.includes(slot.day_of_week));
    }

    if (advancedFilters.rooms.length > 0) {
      slots = slots.filter(slot => 
        slot.room_location && advancedFilters.rooms.includes(slot.room_location)
      );
    }

    if (advancedFilters.timeRange.start && advancedFilters.timeRange.end) {
      slots = slots.filter(slot => {
        return slot.start_time >= advancedFilters.timeRange.start && 
               slot.end_time <= advancedFilters.timeRange.end;
      });
    }

    return slots;
  }, [scheduleSlots, selectedFilter, searchTerm, advancedFilters, teachers, classes, subjects]);

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

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, slot: ScheduleSlot) => {
    setDraggedSlot(slot);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', slot.id?.toString() || '');
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedSlot(null);
    setDragOverCell(null);
    
    // Reset visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, day: number, period: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ day, period });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the entire cell area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCell(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDay: number, targetPeriod: number) => {
    e.preventDefault();
    setDragOverCell(null);

    if (!draggedSlot) return;

    // Check if we're dropping on the same cell
    if (draggedSlot.day_of_week === targetDay && draggedSlot.period_number === targetPeriod) {
      return;
    }

    // Check for conflicts in target cell
    const targetSlot = scheduleGrid[`${targetDay}-${targetPeriod}`];
    if (targetSlot) {
      // Could show a confirmation dialog or swap slots
      if (confirm('Bu yerdə artıq dərs var. Yerləri dəyişmək istəyirsiniz?')) {
        // Swap slots
        const updatedTargetSlot = {
          ...targetSlot,
          day_of_week: draggedSlot.day_of_week,
          period_number: draggedSlot.period_number,
        };
        
        const updatedDraggedSlot = {
          ...draggedSlot,
          day_of_week: targetDay,
          period_number: targetPeriod,
        };

        onSlotUpdate(updatedTargetSlot);
        onSlotUpdate(updatedDraggedSlot);
      }
      return;
    }

    // Move slot to new position
    const updatedSlot = {
      ...draggedSlot,
      day_of_week: targetDay,
      period_number: targetPeriod,
    };

    onSlotUpdate(updatedSlot);
    setDraggedSlot(null);
  };

  const isValidDropTarget = (day: number, period: number): boolean => {
    if (!draggedSlot) return false;
    
    // Check if it's the same position
    if (draggedSlot.day_of_week === day && draggedSlot.period_number === period) {
      return false;
    }

    // Add additional validation logic here (e.g., teacher availability, room conflicts)
    return true;
  };

  const renderSlot = (slot: ScheduleSlot | null, day: number, period: number) => {
    const isDragOver = dragOverCell?.day === day && dragOverCell?.period === period;
    const isValidDrop = isValidDropTarget(day, period);
    
    if (!slot) {
      return (
        <div 
          key={`${day}-${period}`}
          className={`${getSlotClass(slot)} ${isDragOver ? 'drag-over' : ''} ${isValidDrop ? 'valid-drop-target' : ''}`}
          onClick={() => handleSlotClick(slot)}
          onDragOver={(e) => handleDragOver(e, day, period)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, day, period)}
        >
          <div className="slot-content empty-slot">
            {isDragOver && isValidDrop ? (
              <span className="drop-indicator">
                <Move size={16} />
                Bura burax
              </span>
            ) : (
              <span>Boş</span>
            )}
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

    const isDragging = draggedSlot?.id === slot.id;

    return (
      <div 
        key={`${day}-${period}-${slot.id}`}
        className={`${getSlotClass(slot)} ${isFiltered ? 'filtered-out' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${isValidDrop ? 'valid-drop-target' : ''}`}
        onClick={() => handleSlotClick(slot)}
        draggable={!isFiltered}
        onDragStart={(e) => handleDragStart(e, slot)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, day, period)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day, period)}
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
                title="Düzəlt"
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
                title="Kopya yarat"
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
                title="Sil"
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
          {!isFiltered && (
            <div className="drag-handle" title="Sürükləyin">
              <Move size={14} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="schedule-week-view">
        <div className="schedule-grid" style={{ '--working-days': workingDays.length } as any}>
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

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(0);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);

  const renderDayView = () => {
    const selectedDaySlots = filteredSlots.filter(slot => slot.day_of_week === selectedDay);
    
    return (
      <div className="schedule-day-view">
        <div className="day-selector">
          <label>Gün seçin:</label>
          <select value={selectedDay} onChange={(e) => setSelectedDay(parseInt(e.target.value))}>
            {workingDays.map(day => (
              <option key={day.number} value={day.number}>{day.name}</option>
            ))}
          </select>
        </div>
        
        <div className="day-schedule">
          <div className="day-header">
            <h3>{dayNames[selectedDay - 1]}</h3>
            <p>{selectedDaySlots.length} dərs planlaşdırılıb</p>
          </div>
          
          <div className="day-timeline">
            {timeSlots.map(timeSlot => {
              const slot = scheduleGrid[`${selectedDay}-${timeSlot.period}`];
              return (
                <div key={timeSlot.period} className="timeline-slot">
                  <div className="timeline-time">
                    <span className="period">{timeSlot.period}</span>
                    <span className="time">{timeSlot.start_time} - {timeSlot.end_time}</span>
                  </div>
                  <div className="timeline-content">
                    {slot ? (
                      <div className="slot-card" onClick={() => handleSlotClick(slot)}>
                        {renderSlotContent(slot)}
                      </div>
                    ) : (
                      <div className="empty-timeline-slot">Boş</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherView = () => {
    const teacherSlots = selectedTeacherId 
      ? filteredSlots.filter(slot => slot.teacher_id === selectedTeacherId)
      : [];
    
    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    const totalHours = teacherSlots.reduce((sum, slot) => {
      const timeSlot = timeSlots.find(ts => ts.period === slot.period_number);
      return sum + (timeSlot?.duration_minutes || 45) / 60;
    }, 0);
    
    return (
      <div className="schedule-teacher-view">
        <div className="teacher-selector">
          <label>Müəllim seçin:</label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(parseInt(e.target.value))}>
            <option value={0}>Müəllim seçin...</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedTeacher && (
          <>
            <div className="teacher-info">
              <h3>{selectedTeacher.first_name} {selectedTeacher.last_name}</h3>
              <div className="teacher-stats">
                <div className="stat">
                  <span className="label">Həftəlik saat:</span>
                  <span className="value">{totalHours.toFixed(1)} / {selectedTeacher.max_weekly_hours}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, (totalHours / selectedTeacher.max_weekly_hours) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="stat">
                  <span className="label">Dərs sayı:</span>
                  <span className="value">{teacherSlots.length}</span>
                </div>
                <div className="stat">
                  <span className="label">Fənlər:</span>
                  <span className="value">{selectedTeacher.subjects.map(s => s.name).join(', ')}</span>
                </div>
              </div>
            </div>
            
            <div className="teacher-schedule-grid">
              {renderWeekView()}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderClassView = () => {
    const classSlots = selectedClassId 
      ? filteredSlots.filter(slot => slot.class_id === selectedClassId)
      : [];
    
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const totalHours = classSlots.reduce((sum, slot) => {
      const timeSlot = timeSlots.find(ts => ts.period === slot.period_number);
      return sum + (timeSlot?.duration_minutes || 45) / 60;
    }, 0);
    
    return (
      <div className="schedule-class-view">
        <div className="class-selector">
          <label>Sinif seçin:</label>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(parseInt(e.target.value))}>
            <option value={0}>Sinif seçin...</option>
            {classes.map(classInfo => (
              <option key={classInfo.id} value={classInfo.id}>
                {classInfo.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedClass && (
          <>
            <div className="class-info">
              <h3>{selectedClass.name}</h3>
              <div className="class-stats">
                <div className="stat">
                  <span className="label">Həftəlik saat:</span>
                  <span className="value">{totalHours.toFixed(1)}</span>
                </div>
                <div className="stat">
                  <span className="label">Dərs sayı:</span>
                  <span className="value">{classSlots.length}</span>
                </div>
                <div className="stat">
                  <span className="label">Məvcudluk:</span>
                  <span className="value">{selectedClass.current_enrollment} / {selectedClass.max_capacity}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(selectedClass.current_enrollment / selectedClass.max_capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="class-schedule-grid">
              {renderWeekView()}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSlotContent = (slot: ScheduleSlot) => {
    const info = getSlotInfo(slot);
    return (
      <div className="slot-content-detailed">
        <div className="slot-subject">{info.subject}</div>
        <div className="slot-details">
          <div className="detail"><Users size={12} /> {info.class}</div>
          <div className="detail"><BookOpen size={12} /> {info.teacher}</div>
          <div className="detail"><MapPin size={12} /> {info.room}</div>
        </div>
        {slot.notes && <div className="slot-notes">{slot.notes}</div>}
      </div>
    );
  };

  const clearAllFilters = () => {
    setSelectedFilter({ type: null, id: null });
    setSearchTerm('');
    setAdvancedFilters({
      status: [],
      type: [],
      timeRange: { start: '', end: '' },
      days: [],
      rooms: [],
    });
  };

  const toggleAdvancedFilter = (category: keyof typeof advancedFilters, value: any) => {
    if (category === 'timeRange') {
      setAdvancedFilters(prev => ({
        ...prev,
        timeRange: value
      }));
    } else {
      setAdvancedFilters(prev => {
        const currentValues = prev[category] as any[];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        return {
          ...prev,
          [category]: newValues
        };
      });
    }
  };

  const getUniqueRooms = () => {
    const rooms = new Set<string>();
    scheduleSlots.forEach(slot => {
      if (slot.room_location) {
        rooms.add(slot.room_location);
      }
    });
    return Array.from(rooms).sort();
  };

  const renderSearchAndFilters = () => {
    const activeFiltersCount = 
      (selectedFilter.type ? 1 : 0) +
      (searchTerm.trim() ? 1 : 0) +
      advancedFilters.status.length +
      advancedFilters.type.length +
      advancedFilters.days.length +
      advancedFilters.rooms.length +
      (advancedFilters.timeRange.start || advancedFilters.timeRange.end ? 1 : 0);

    return (
      <Card className="schedule-search-filters">
        <div className="search-filter-header">
          <div className="search-section">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Müəllim, sinif, fənn və ya otaq axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="search-clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-controls">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={isAdvancedFilterOpen ? 'active' : ''}
            >
              <Filter size={16} />
              Qabaqcıl filtr
              {activeFiltersCount > 0 && (
                <span className="filter-count">{activeFiltersCount}</span>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                <X size={16} />
                Təmizlə
              </Button>
            )}
          </div>
        </div>

        <div className="view-mode-section">
          <label>Görünüş:</label>
          <div className="view-mode-buttons">
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

        {isAdvancedFilterOpen && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Əsas filtr:</label>
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

              <div className="filter-group">
                <label>Status:</label>
                <div className="checkbox-group">
                  {['active', 'cancelled', 'moved', 'substituted'].map(status => (
                    <label key={status} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={advancedFilters.status.includes(status)}
                        onChange={() => toggleAdvancedFilter('status', status)}
                      />
                      <span>{status === 'active' ? 'Aktiv' : 
                             status === 'cancelled' ? 'Ləğv edilmiş' :
                             status === 'moved' ? 'Köçürülmüş' : 'Əvəzlənmiş'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Növ:</label>
                <div className="checkbox-group">
                  {['regular', 'exam', 'break', 'special'].map(type => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={advancedFilters.type.includes(type)}
                        onChange={() => toggleAdvancedFilter('type', type)}
                      />
                      <span>{type === 'regular' ? 'Adi dərs' : 
                             type === 'exam' ? 'İmtahan' :
                             type === 'break' ? 'Fasilə' : 'Xüsusi'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Günlər:</label>
                <div className="checkbox-group">
                  {workingDays.map(day => (
                    <label key={day.number} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={advancedFilters.days.includes(day.number)}
                        onChange={() => toggleAdvancedFilter('days', day.number)}
                      />
                      <span>{day.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Otaqlar:</label>
                <div className="checkbox-group room-list">
                  {getUniqueRooms().map(room => (
                    <label key={room} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={advancedFilters.rooms.includes(room)}
                        onChange={() => toggleAdvancedFilter('rooms', room)}
                      />
                      <span>{room}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Vaxt aralığı:</label>
                <div className="time-range">
                  <input
                    type="time"
                    value={advancedFilters.timeRange.start}
                    onChange={(e) => toggleAdvancedFilter('timeRange', {
                      ...advancedFilters.timeRange,
                      start: e.target.value
                    })}
                    placeholder="Başlanğıc"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={advancedFilters.timeRange.end}
                    onChange={(e) => toggleAdvancedFilter('timeRange', {
                      ...advancedFilters.timeRange,
                      end: e.target.value
                    })}
                    placeholder="Son"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="filter-stats">
          <span>Ümumi: {scheduleSlots.length}</span>
          <span>Göstərilən: {filteredSlots.length}</span>
          {activeFiltersCount > 0 && (
            <span>Aktiv filtr: {activeFiltersCount}</span>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="schedule-calendar">
      {renderSearchAndFilters()}
      
      <div className="calendar-content">
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'teacher' && renderTeacherView()}
        {viewMode === 'class' && renderClassView()}
      </div>
    </div>
  );
};

export default ScheduleCalendar;