import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Save, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';
import classAttendanceService, { ClassAttendanceData as ServiceClassAttendanceData, ClassStats } from '../../services/classAttendanceService';
import '../../styles/academic/attendance-tracker.css';

interface ClassAttendanceData {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  attendance_date: string;
  period_number: number;
  start_time: string;
  end_time: string;
  total_students_registered: number;
  students_present: number;
  students_absent_excused: number;
  students_absent_unexcused: number;
  students_late: number;
  lesson_status: 'completed' | 'cancelled' | 'partial' | 'substituted';
  notes?: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  approved_by?: number;
  approved_at?: string;
}

interface ClassInfo {
  id: number;
  name: string; // "7A", "11B", "5C"
  grade_level: number;
  section: string;
  max_capacity: number;
  current_enrollment: number;
  classroom_location?: string;
}

interface SubjectInfo {
  id: number;
  name: string;
  short_name?: string;
  code: string;
}

interface AttendanceFormData {
  class_id: number;
  subject_id: number;
  attendance_date: string;
  period_number: number;
  start_time: string;
  end_time: string;
  total_students_registered: number;
  students_present: number;
  students_absent_excused: number;
  students_absent_unexcused: number;
  students_late: number;
  lesson_status: string;
  notes: string;
}

const ClassAttendanceTracker: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<ClassAttendanceData[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClassAttendanceData | null>(null);

  const [formData, setFormData] = useState<AttendanceFormData>({
    class_id: 0,
    subject_id: 0,
    attendance_date: new Date().toISOString().split('T')[0],
    period_number: 1,
    start_time: '08:00',
    end_time: '08:45',
    total_students_registered: 0,
    students_present: 0,
    students_absent_excused: 0,
    students_absent_unexcused: 0,
    students_late: 0,
    lesson_status: 'completed',
    notes: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendanceRecords();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const stats = await classAttendanceService.getClassStats();
      setClasses(stats.map(stat => ({
        id: stat.id,
        name: stat.name,
        grade_level: parseInt(stat.name.substring(0, stat.name.length - 1)) || 1,
        section: stat.name.slice(-1),
        max_capacity: stat.capacity,
        current_enrollment: stat.current_enrollment
      })));
    } catch (error) {
      toast.error('Siniflər yüklənərkən xəta baş verdi');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data || []);
      }
    } catch (error) {
      toast.error('Fənlər yüklənərkən xəta baş verdi');
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!selectedClass || !selectedDate) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/class-attendance?class_id=${selectedClass}&date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.data || []);
      }
    } catch (error) {
      toast.error('Davamiyyət məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingRecord 
        ? `/api/class-attendance/${editingRecord.id}` 
        : '/api/class-attendance';
      
      const method = editingRecord ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingRecord ? 'Davamiyyət yeniləndi' : 'Davamiyyət qeydə alındı');
        setShowForm(false);
        setEditingRecord(null);
        resetForm();
        fetchAttendanceRecords();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Xəta baş verdi');
      }
    } catch (error) {
      toast.error('Məlumatlar saxlanılarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: selectedClass || 0,
      subject_id: 0,
      attendance_date: selectedDate,
      period_number: 1,
      start_time: '08:00',
      end_time: '08:45',
      total_students_registered: 0,
      students_present: 0,
      students_absent_excused: 0,
      students_absent_unexcused: 0,
      students_late: 0,
      lesson_status: 'completed',
      notes: ''
    });
  };

  const handleEdit = (record: ClassAttendanceData) => {
    setEditingRecord(record);
    setFormData({
      class_id: record.class_id,
      subject_id: record.subject_id,
      attendance_date: record.attendance_date,
      period_number: record.period_number,
      start_time: record.start_time,
      end_time: record.end_time,
      total_students_registered: record.total_students_registered,
      students_present: record.students_present,
      students_absent_excused: record.students_absent_excused,
      students_absent_unexcused: record.students_absent_unexcused,
      students_late: record.students_late,
      lesson_status: record.lesson_status,
      notes: record.notes || ''
    });
    setShowForm(true);
  };

  const selectedClassInfo = useMemo(() => {
    return classes.find(c => c.id === selectedClass);
  }, [classes, selectedClass]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'orange', icon: Clock, text: 'Gözləyir' },
      approved: { color: 'green', icon: CheckCircle, text: 'Təsdiqləndi' },
      rejected: { color: 'red', icon: XCircle, text: 'Rədd edildi' },
      needs_review: { color: 'yellow', icon: AlertCircle, text: 'Yenidən baxış' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const IconComponent = badge.icon;
    
    return (
      <span className={`status-badge status-${badge.color}`}>
        <IconComponent size={16} />
        {badge.text}
      </span>
    );
  };

  const calculateAttendanceStats = (records: ClassAttendanceData[]) => {
    if (records.length === 0) return null;

    const totalLessons = records.length;
    const totalPresent = records.reduce((sum, r) => sum + r.students_present, 0);
    const totalRegistered = records.reduce((sum, r) => sum + r.total_students_registered, 0);
    const avgPresent = totalLessons > 0 ? totalPresent / totalLessons : 0;
    const avgRegistered = totalLessons > 0 ? totalRegistered / totalLessons : 0;
    const attendanceRate = avgRegistered > 0 ? (avgPresent / avgRegistered) * 100 : 0;

    return {
      totalLessons,
      avgPresent: Math.round(avgPresent),
      avgRegistered: Math.round(avgRegistered),
      attendanceRate: Math.round(attendanceRate * 100) / 100
    };
  };

  const stats = calculateAttendanceStats(attendanceRecords);

  return (
    <div className="attendance-tracker">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="attendance-header">
        <h1>Sinif Davamiyyət İzləməsi</h1>
        <p>7A sinfi: səhər 20 şagird, son dərs 18 şagird, 1 İcazəli, 1 İcazəsiz</p>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <div className="filters-row">
          <div className="filter-group">
            <label>Sinif</label>
            <select 
              value={selectedClass || ''} 
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="filter-select"
            >
              <option value="">Sinif seçin</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.classroom_location} ({cls.current_enrollment}/{cls.max_capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tarix</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            disabled={!selectedClass}
            className="add-button"
          >
            <Plus size={16} />
            Davamiyyət Əlavə Et
          </Button>
        </div>

        {selectedClassInfo && (
          <div className="class-info">
            <h3>{selectedClassInfo.name} - {selectedClassInfo.classroom_location}</h3>
            <div className="class-stats">
              <span>Sinif: {selectedClassInfo.grade_level}{selectedClassInfo.section}</span>
              <span>Tutum: {selectedClassInfo.current_enrollment}/{selectedClassInfo.max_capacity}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Statistics */}
      {stats && (
        <Card className="stats-card">
          <h3>Günlük Statistika</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Ümumi Dərslər</span>
              <span className="stat-value">{stats.totalLessons}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Orta Qeydiyyatlı</span>
              <span className="stat-value">{stats.avgRegistered}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Orta İştirak</span>
              <span className="stat-value">{stats.avgPresent}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Davamiyyət Faizi</span>
              <span className="stat-value">{stats.attendanceRate}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Attendance Records */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card className="records-card">
          <h3>Davamiyyət Qeydləri</h3>
          
          {attendanceRecords.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Seçilmiş tarix və sinif üçün davamiyyət qeydi tapılmadı</p>
            </div>
          ) : (
            <div className="records-table">
              <div className="table-header">
                <span>Dərs</span>
                <span>Fən</span>
                <span>Vaxt</span>
                <span>İştirak</span>
                <span>İcazəli</span>
                <span>İcazəsiz</span>
                <span>Geç gələn</span>
                <span>Status</span>
                <span>Təsdiq</span>
                <span>Əməliyyat</span>
              </div>
              
              {attendanceRecords.map(record => {
                const subject = subjects.find(s => s.id === record.subject_id);
                return (
                  <div key={record.id} className="table-row">
                    <span>{record.period_number}</span>
                    <span>{subject?.short_name || subject?.name}</span>
                    <span>{record.start_time} - {record.end_time}</span>
                    <span className="attendance-number present">
                      {record.students_present}/{record.total_students_registered}
                    </span>
                    <span className="attendance-number excused">{record.students_absent_excused}</span>
                    <span className="attendance-number unexcused">{record.students_absent_unexcused}</span>
                    <span className="attendance-number late">{record.students_late}</span>
                    <span className={`lesson-status ${record.lesson_status}`}>
                      {record.lesson_status === 'completed' && 'Tamamlandı'}
                      {record.lesson_status === 'cancelled' && 'Ləğv edildi'}
                      {record.lesson_status === 'partial' && 'Qismən'}
                      {record.lesson_status === 'substituted' && 'Əvəzləndi'}
                    </span>
                    <span>{getStatusBadge(record.approval_status)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record)}
                      disabled={record.approval_status === 'approved'}
                    >
                      Düzəlt
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingRecord ? 'Davamiyyət Düzəlt' : 'Yeni Davamiyyət'}</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="attendance-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Fən</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({...formData, subject_id: Number(e.target.value)})}
                    required
                  >
                    <option value="">Fən seçin</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Dərs Nömrəsi</label>
                  <select
                    value={formData.period_number}
                    onChange={(e) => setFormData({...formData, period_number: Number(e.target.value)})}
                    required
                  >
                    {[1,2,3,4,5,6,7,8].map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Başlama Vaxtı</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bitmə Vaxtı</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Qeydiyyatlı Şagird Sayı</label>
                  <input
                    type="number"
                    value={formData.total_students_registered}
                    onChange={(e) => setFormData({...formData, total_students_registered: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>İştirak edən Şagird</label>
                  <input
                    type="number"
                    value={formData.students_present}
                    onChange={(e) => setFormData({...formData, students_present: Number(e.target.value)})}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>İcazəli Qayıb</label>
                  <input
                    type="number"
                    value={formData.students_absent_excused}
                    onChange={(e) => setFormData({...formData, students_absent_excused: Number(e.target.value)})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>İcazəsiz Qayıb</label>
                  <input
                    type="number"
                    value={formData.students_absent_unexcused}
                    onChange={(e) => setFormData({...formData, students_absent_unexcused: Number(e.target.value)})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Geç gələn</label>
                  <input
                    type="number"
                    value={formData.students_late}
                    onChange={(e) => setFormData({...formData, students_late: Number(e.target.value)})}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dərs Statusu</label>
                <select
                  value={formData.lesson_status}
                  onChange={(e) => setFormData({...formData, lesson_status: e.target.value})}
                >
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">Ləğv edildi</option>
                  <option value="partial">Qismən</option>
                  <option value="substituted">Əvəzləndi</option>
                </select>
              </div>

              <div className="form-group">
                <label>Qeydlər</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Əlavə qeydlər..."
                />
              </div>

              <div className="form-actions">
                <Button type="submit" disabled={isLoading}>
                  <Save size={16} />
                  {isLoading ? 'Saxlanılır...' : 'Saxla'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                  }}
                >
                  Ləğv et
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAttendanceTracker;