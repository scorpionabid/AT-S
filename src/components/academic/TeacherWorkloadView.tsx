import React, { useState, useMemo } from 'react';
import { User, Clock, BookOpen, Users, TrendingUp, AlertTriangle, CheckCircle, Edit3, Search, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TeacherInfo, TeachingLoad, WorkloadSummary } from './types/teachingLoadTypes';

interface TeacherWorkloadViewProps {
  teachers: TeacherInfo[];
  teachingLoads: TeachingLoad[];
  workloadSummaries: WorkloadSummary[];
  selectedTeacher: TeacherInfo | null;
  academicYear: number;
  onTeacherSelect: (teacher: TeacherInfo | null) => void;
  onLoadUpdate: (load: TeachingLoad) => void;
}

const TeacherWorkloadView: React.FC<TeacherWorkloadViewProps> = ({
  teachers,
  teachingLoads,
  workloadSummaries,
  selectedTeacher,
  academicYear,
  onTeacherSelect,
  onLoadUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'utilization' | 'hours' | 'classes'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort teachers with their workload data
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher => {
      const summary = workloadSummaries.find(s => s.teacher_id === teacher.id);
      const matchesSearch = `${teacher.first_name} ${teacher.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || summary?.status === statusFilter;
      const matchesEmployment = employmentFilter === 'all' || teacher.employment_type === employmentFilter;
      
      return matchesSearch && matchesStatus && matchesEmployment;
    });

    // Sort teachers
    filtered.sort((a, b) => {
      const summaryA = workloadSummaries.find(s => s.teacher_id === a.id);
      const summaryB = workloadSummaries.find(s => s.teacher_id === b.id);
      
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        case 'utilization':
          compareValue = (summaryA?.utilization_percentage || 0) - (summaryB?.utilization_percentage || 0);
          break;
        case 'hours':
          compareValue = (summaryA?.total_weekly_hours || 0) - (summaryB?.total_weekly_hours || 0);
          break;
        case 'classes':
          compareValue = (summaryA?.class_count || 0) - (summaryB?.class_count || 0);
          break;
      }
      
      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [teachers, workloadSummaries, searchTerm, statusFilter, employmentFilter, sortBy, sortDirection]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="status-optimal" size={16} />;
      case 'overloaded':
      case 'critical':
        return <AlertTriangle className="status-overloaded" size={16} />;
      case 'underloaded':
        return <TrendingUp className="status-underloaded" size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const getStatusClass = (status: string) => {
    return `workload-status status-${status}`;
  };

  const renderTeacherCard = (teacher: TeacherInfo) => {
    const summary = workloadSummaries.find(s => s.teacher_id === teacher.id);
    const loads = teachingLoads.filter(l => l.teacher_id === teacher.id);
    
    return (
      <Card 
        key={teacher.id} 
        className={`teacher-card ${selectedTeacher?.id === teacher.id ? 'selected' : ''}`}
        onClick={() => onTeacherSelect(selectedTeacher?.id === teacher.id ? null : teacher)}
      >
        <div className="teacher-header">
          <div className="teacher-info">
            <User size={20} />
            <div>
              <h4>{teacher.first_name} {teacher.last_name}</h4>
              <p className="teacher-position">{teacher.position}</p>
              {teacher.department && (
                <p className="teacher-department">{teacher.department}</p>
              )}
            </div>
          </div>
          <div className={getStatusClass(summary?.status || 'unknown')}>
            {getStatusIcon(summary?.status || 'unknown')}
          </div>
        </div>

        <div className="workload-metrics">
          <div className="metric">
            <Clock size={14} />
            <span className="metric-label">İş yükü:</span>
            <span className="metric-value">
              {summary?.total_weekly_hours || 0}/{teacher.max_weekly_hours} saat
            </span>
          </div>
          <div className="metric">
            <TrendingUp size={14} />
            <span className="metric-label">İstifadə:</span>
            <span className="metric-value">
              {summary?.utilization_percentage?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="metric">
            <BookOpen size={14} />
            <span className="metric-label">Siniflər:</span>
            <span className="metric-value">{summary?.class_count || 0}</span>
          </div>
          <div className="metric">
            <Users size={14} />
            <span className="metric-label">Şagirdlər:</span>
            <span className="metric-value">{summary?.student_count || 0}</span>
          </div>
        </div>

        <div className="employment-badge">
          <span className={`badge employment-${teacher.employment_type}`}>
            {teacher.employment_type === 'full_time' && 'Tam ştat'}
            {teacher.employment_type === 'part_time' && 'Yarım ştat'}
            {teacher.employment_type === 'contract' && 'Müqavilə'}
            {teacher.employment_type === 'substitute' && 'Əvəzedici'}
          </span>
        </div>

        {summary && (
          <div className="workload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(summary.utilization_percentage, 100)}%`,
                  backgroundColor: summary.utilization_percentage > 100 ? '#ff4444' : 
                                 summary.utilization_percentage < 50 ? '#ffa500' : '#44ff44'
                }}
              />
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderTeacherDetails = () => {
    if (!selectedTeacher) {
      return (
        <Card className="teacher-details empty">
          <div className="empty-state">
            <User size={48} />
            <h3>Müəllim seçin</h3>
            <p>Detallı məlumat görmək üçün sol tərəfdən müəllim seçin</p>
          </div>
        </Card>
      );
    }

    const summary = workloadSummaries.find(s => s.teacher_id === selectedTeacher.id);
    const loads = teachingLoads.filter(l => l.teacher_id === selectedTeacher.id);

    return (
      <div className="teacher-details">
        <Card className="teacher-summary">
          <div className="summary-header">
            <div className="teacher-info">
              <h3>{selectedTeacher.first_name} {selectedTeacher.last_name}</h3>
              <p>{selectedTeacher.position}</p>
              {selectedTeacher.department && <p>{selectedTeacher.department}</p>}
            </div>
            <div className={getStatusClass(summary?.status || 'unknown')}>
              {getStatusIcon(summary?.status || 'unknown')}
              <span>{summary?.status || 'Məlumat yoxdur'}</span>
            </div>
          </div>

          {summary && (
            <div className="summary-stats">
              <div className="stat-group">
                <div className="stat">
                  <span className="stat-label">Ümumi saatlar</span>
                  <span className="stat-value">{summary.total_weekly_hours} / {selectedTeacher.max_weekly_hours}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">İstifadə faizi</span>
                  <span className="stat-value">{summary.utilization_percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="stat-group">
                <div className="stat">
                  <span className="stat-label">Sinif sayı</span>
                  <span className="stat-value">{summary.class_count}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Fənn sayı</span>
                  <span className="stat-value">{summary.subject_count}</span>
                </div>
              </div>
              <div className="stat-group">
                <div className="stat">
                  <span className="stat-label">Şagird sayı</span>
                  <span className="stat-value">{summary.student_count}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Balans skoru</span>
                  <span className="stat-value">{summary.workload_balance_score.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="teacher-loads">
          <div className="loads-header">
            <h4>Dərs Təyinatları</h4>
            <Button variant="outline" size="sm">
              <Edit3 size={14} />
              Yeni Təyinat
            </Button>
          </div>

          <div className="loads-list">
            {loads.length === 0 ? (
              <div className="empty-loads">
                <BookOpen size={32} />
                <p>Bu müəllimə hələ dərs təyin edilməyib</p>
              </div>
            ) : (
              loads.map(load => (
                <div key={load.id} className="load-item">
                  <div className="load-info">
                    <div className="load-main">
                      <span className="subject-name">{load.subject.name}</span>
                      <span className="class-name">{load.class_info.name}</span>
                    </div>
                    <div className="load-details">
                      <span>{load.weekly_hours} saat/həftə</span>
                      <span>{load.class_info.current_enrollment} şagird</span>
                    </div>
                  </div>
                  <div className="load-actions">
                    <Button variant="ghost" size="xs">
                      <Edit3 size={12} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {selectedTeacher.subjects.length > 0 && (
          <Card className="teacher-subjects">
            <h4>İxtisas Fənləri</h4>
            <div className="subjects-list">
              {selectedTeacher.subjects.map(subject => (
                <div key={subject.id} className="subject-badge">
                  <span className="subject-name">{subject.name}</span>
                  <span className="subject-code">({subject.code})</span>
                  {subject.qualified_for && (
                    <CheckCircle size={14} className="qualified-icon" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <Card className="workload-filters">
        <div className="filter-row">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Müəllim axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Bütün statuslar</option>
            <option value="optimal">Optimal</option>
            <option value="underloaded">Az yüklənmiş</option>
            <option value="overloaded">Çox yüklənmiş</option>
            <option value="critical">Kritik</option>
          </select>

          <select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
          >
            <option value="all">Bütün növlər</option>
            <option value="full_time">Tam ştat</option>
            <option value="part_time">Yarım ştat</option>
            <option value="contract">Müqavilə</option>
            <option value="substitute">Əvəzedici</option>
          </select>
        </div>

        <div className="sort-controls">
          <label>Sırala:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name">Ad</option>
            <option value="utilization">İstifadə faizi</option>
            <option value="hours">Saatlar</option>
            <option value="classes">Sinif sayı</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="teacher-workload-view">
      {renderFilters()}
      
      <div className="workload-content">
        <div className="teachers-list">
          <div className="list-header">
            <h3>Müəllimlər ({filteredTeachers.length})</h3>
          </div>
          <div className="teachers-grid">
            {filteredTeachers.map(teacher => renderTeacherCard(teacher))}
          </div>
        </div>

        <div className="teacher-details-panel">
          {renderTeacherDetails()}
        </div>
      </div>
    </div>
  );
};

export default TeacherWorkloadView;