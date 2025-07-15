import React, { useState, useEffect } from 'react';
import { Save, X, Clock, Users, BookOpen, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { 
  ScheduleSlot, 
  TimeSlot, 
  ClassInfo, 
  TeacherInfo, 
  SubjectInfo 
} from './types/scheduleTypes';

interface ScheduleSlotEditorProps {
  slot: ScheduleSlot | null;
  classes: ClassInfo[];
  teachers: TeacherInfo[];
  subjects: SubjectInfo[];
  timeSlots: TimeSlot[];
  onSlotUpdate: (slot: ScheduleSlot) => void;
  onCancel: () => void;
}

const ScheduleSlotEditor: React.FC<ScheduleSlotEditorProps> = ({
  slot,
  classes,
  teachers,
  subjects,
  timeSlots,
  onSlotUpdate,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<ScheduleSlot>>({
    day_of_week: 1,
    period_number: 1,
    class_id: 0,
    subject_id: 0,
    teacher_id: 0,
    room_location: '',
    slot_type: 'regular',
    status: 'active',
    notes: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (slot) {
      setFormData(slot);
    } else {
      // Reset form for new slot
      setFormData({
        day_of_week: 1,
        period_number: 1,
        class_id: 0,
        subject_id: 0,
        teacher_id: 0,
        room_location: '',
        slot_type: 'regular',
        status: 'active',
        notes: '',
      });
    }
  }, [slot]);

  useEffect(() => {
    validateForm();
    checkForConflicts();
  }, [formData]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.class_id) {
      errors.push('Sinif seçilməlidir');
    }
    if (!formData.subject_id) {
      errors.push('Fənn seçilməlidir');
    }
    if (!formData.teacher_id) {
      errors.push('Müəllim seçilməlidir');
    }
    if (!formData.room_location?.trim()) {
      errors.push('Otaq göstərilməlidir');
    }

    // Check if teacher can teach the subject
    if (formData.teacher_id && formData.subject_id) {
      const teacher = teachers.find(t => t.id === formData.teacher_id);
      if (teacher && !teacher.subjects.some(s => s.id === formData.subject_id)) {
        errors.push('Seçilən müəllim bu fənni tədris etmir');
      }
    }

    setValidationErrors(errors);
  };

  const checkForConflicts = () => {
    const warnings: string[] = [];

    // Add conflict detection logic here
    // This is simplified - in a real app you'd check against existing schedule
    
    setConflictWarnings(warnings);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationErrors.length > 0) {
      return;
    }

    // Get time slot info
    const timeSlot = timeSlots.find(ts => ts.period === formData.period_number);
    
    const updatedSlot: ScheduleSlot = {
      ...formData,
      start_time: timeSlot?.start_time || '',
      end_time: timeSlot?.end_time || '',
    } as ScheduleSlot;

    onSlotUpdate(updatedSlot);
  };

  const handleInputChange = (field: keyof ScheduleSlot, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getFilteredTeachers = () => {
    if (!formData.subject_id) return teachers;
    return teachers.filter(teacher => 
      teacher.subjects.some(subject => subject.id === formData.subject_id)
    );
  };

  const dayNames = [
    { value: 1, label: 'Bazar ertəsi' },
    { value: 2, label: 'Çərşənbə axşamı' },
    { value: 3, label: 'Çərşənbə' },
    { value: 4, label: 'Cümə axşamı' },
    { value: 5, label: 'Cümə' },
    { value: 6, label: 'Şənbə' },
    { value: 7, label: 'Bazar' },
  ];

  return (
    <div className="schedule-slot-editor">
      <Card>
        <div className="editor-header">
          <h3>
            {slot ? 'Dərs Slotunu Düzəlt' : 'Yeni Dərs Slotu'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={16} />
          </Button>
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <AlertTriangle size={16} />
            <div>
              {validationErrors.map((error, index) => (
                <div key={index} className="error-message">{error}</div>
              ))}
            </div>
          </div>
        )}

        {conflictWarnings.length > 0 && (
          <div className="conflict-warnings">
            <AlertTriangle size={16} />
            <div>
              {conflictWarnings.map((warning, index) => (
                <div key={index} className="warning-message">{warning}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Gün</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => handleInputChange('day_of_week', parseInt(e.target.value))}
                required
              >
                {dayNames.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dərs saatı</label>
              <select
                value={formData.period_number}
                onChange={(e) => handleInputChange('period_number', parseInt(e.target.value))}
                required
              >
                {timeSlots.map(timeSlot => (
                  <option key={timeSlot.period} value={timeSlot.period}>
                    {timeSlot.period}. saat ({timeSlot.start_time} - {timeSlot.end_time})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Users size={16} />
                Sinif
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => handleInputChange('class_id', parseInt(e.target.value))}
                required
              >
                <option value={0}>Sinif seçin...</option>
                {classes.map(classInfo => (
                  <option key={classInfo.id} value={classInfo.id}>
                    {classInfo.name} ({classInfo.current_enrollment}/{classInfo.max_capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <BookOpen size={16} />
                Fənn
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => {
                  const subjectId = parseInt(e.target.value);
                  handleInputChange('subject_id', subjectId);
                  // Reset teacher when subject changes
                  if (formData.teacher_id) {
                    const teacher = teachers.find(t => t.id === formData.teacher_id);
                    if (teacher && !teacher.subjects.some(s => s.id === subjectId)) {
                      handleInputChange('teacher_id', 0);
                    }
                  }
                }}
                required
              >
                <option value={0}>Fənn seçin...</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Users size={16} />
                Müəllim
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) => handleInputChange('teacher_id', parseInt(e.target.value))}
                required
              >
                <option value={0}>Müəllim seçin...</option>
                {getFilteredTeachers().map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                    {teacher.current_weekly_hours > 0 && 
                      ` (${teacher.current_weekly_hours}/${teacher.max_weekly_hours} saat)`
                    }
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <MapPin size={16} />
                Otaq
              </label>
              <input
                type="text"
                value={formData.room_location}
                onChange={(e) => handleInputChange('room_location', e.target.value)}
                placeholder="Otaq nömrəsi və ya adı"
                required
              />
            </div>

            <div className="form-group">
              <label>Slot növü</label>
              <select
                value={formData.slot_type}
                onChange={(e) => handleInputChange('slot_type', e.target.value)}
              >
                <option value="regular">Adi dərs</option>
                <option value="exam">İmtahan</option>
                <option value="break">Fasilə</option>
                <option value="special">Xüsusi</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Aktiv</option>
                <option value="cancelled">Ləğv edilmiş</option>
                <option value="moved">Köçürülmüş</option>
                <option value="substituted">Əvəzlənmiş</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Qeydlər</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Əlavə qeydlər və ya şərhlər..."
              rows={3}
            />
          </div>

          <div className="editor-actions">
            <Button variant="outline" type="button" onClick={onCancel}>
              Ləğv et
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={validationErrors.length > 0}
            >
              <Save size={16} />
              {slot ? 'Yenilə' : 'Yarad'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ScheduleSlotEditor;