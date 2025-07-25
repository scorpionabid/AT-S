import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, AlertTriangle, CheckCircle, UserX, RotateCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';

interface Teacher {
  id: number;
  name: string;
  subject: string;
  classes: string[];
  email: string;
  phone?: string;
  is_available: boolean;
  workload_hours: number;
  max_hours: number;
}

interface AbsentTeacher {
  id: number;
  teacher_id: number;
  teacher_name: string;
  subject: string;
  classes: string[];
  absence_type: 'sick' | 'vacation' | 'emergency' | 'training';
  start_date: string;
  end_date: string;
  status: 'pending' | 'covered' | 'cancelled';
  reason?: string;
  total_periods: number;
  covered_periods: number;
}

interface SubstitutionRecord {
  id: number;
  absent_teacher_id: number;
  substitute_teacher_id: number;
  absent_teacher_name: string;
  substitute_teacher_name: string;
  class_name: string;
  subject: string;
  date: string;
  period: number;
  start_time: string;
  end_time: string;
  status: 'assigned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface SubstitutionStats {
  total_absences_this_month: number;
  active_substitutions: number;
  pending_assignments: number;
  coverage_rate: number;
}

const StaffSubstitutionManager: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [absentTeachers, setAbsentTeachers] = useState<AbsentTeacher[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionRecord[]>([]);
  const [stats, setStats] = useState<SubstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSubstitutionForm, setShowSubstitutionForm] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<AbsentTeacher | null>(null);

  useEffect(() => {
    fetchSubstitutionData();
  }, [selectedDate]);

  const fetchSubstitutionData = async () => {
    setLoading(true);
    try {
      const [teachersRes, absencesRes, substitutionsRes, statsRes] = await Promise.all([
        fetch('/api/teachers/available'),
        fetch(`/api/teacher-absences?date=${selectedDate}`),
        fetch(`/api/substitutions?date=${selectedDate}`),
        fetch('/api/substitutions/stats')
      ]);

      const [teachersData, absencesData, substitutionsData, statsData] = await Promise.all([
        teachersRes.json(),
        absencesRes.json(), 
        substitutionsRes.json(),
        statsRes.json()
      ]);

      setTeachers(teachersData.data || []);
      setAbsentTeachers(absencesData.data || []);
      setSubstitutions(substitutionsData.data || []);
      setStats(statsData.data || null);
    } catch (error) {
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssignSubstitute = async (absenceId: number) => {
    try {
      const response = await fetch(`/api/substitutions/auto-assign/${absenceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Avtomatik əvəzetmə təyin edildi: ${result.data.substitute_name}`);
        fetchSubstitutionData();
      } else {
        toast.error(result.message || 'Avtomatik əvəzetmə tapılmadı');
      }
    } catch (error) {
      toast.error('Əvəzetmə təyini zamanı xəta baş verdi');
    }
  };

  const handleManualAssignSubstitute = async (absenceId: number, substituteId: number, period: number) => {
    try {
      const response = await fetch('/api/substitutions/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          absence_id: absenceId,
          substitute_teacher_id: substituteId,
          period: period,
          date: selectedDate
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Əvəzetmə uğurla təyin edildi');
        fetchSubstitutionData();
        setShowSubstitutionForm(false);
      } else {
        toast.error(result.message || 'Əvəzetmə təyini zamanı xəta baş verdi');
      }
    } catch (error) {
      toast.error('Əvəzetmə təyini zamanı xəta baş verdi');
    }
  };

  const getAbsenceTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'sick': 'Xəstəlik',
      'vacation': 'Məzuniyyət',  
      'emergency': 'Təcili hal',
      'training': 'Təlim'
    };
    return types[type] || type;
  };

  const getAbsenceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'sick': 'bg-red-100 text-red-700 border-red-200',
      'vacation': 'bg-blue-100 text-blue-700 border-blue-200',
      'emergency': 'bg-orange-100 text-orange-700 border-orange-200',
      'training': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': { text: 'Gözləyir', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'covered': { text: 'Əvəz olundu', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      'cancelled': { text: 'Ləğv edildi', class: 'bg-gray-100 text-gray-700', icon: UserX }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badge.class}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Əvəzetmə məlumatları yüklənir..." />;
  }

  return (
    <div className="substitution-manager">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="substitution-header">
        <h1>Müəllim Əvəzetmə İdarəetməsi</h1>
        <p>Xəstəlik və məzuniyyət hallarında avtomatik əvəzetmə sistemi</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid mb-6">
          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu ay qeyri-iştiraki</p>
                <p className="text-xl font-semibold">{stats.total_absences_this_month}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <RotateCw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktiv əvəzetmə</p>
                <p className="text-xl font-semibold">{stats.active_substitutions}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gözləyən təyinat</p>
                <p className="text-xl font-semibold">{stats.pending_assignments}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Əhatəlik dərəcəsi</p>
                <p className="text-xl font-semibold">{stats.coverage_rate}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Date Filter */}
      <Card className="mb-6">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Tarix:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button onClick={fetchSubstitutionData}>
            <RotateCw className="w-4 h-4 mr-2" />
            Yenilə
          </Button>
        </div>
      </Card>

      {/* Absent Teachers */}
      <Card className="mb-6">
        <div className="card-header p-4 border-b">
          <h3 className="text-lg font-semibold">Qeyri-iştirak edən müəllimlər</h3>
          <p className="text-sm text-gray-600">Bu tarix üçün qeybi-iştirak eden müəllimlər və onların əvəz olunma vəziyyəti</p>
        </div>
        <div className="card-content">
          {absentTeachers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Bu tarix üçün qeybi-iştirak edən müəllim yoxdur</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {absentTeachers.map((absence) => (
                <div key={absence.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{absence.teacher_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getAbsenceTypeColor(absence.absence_type)}`}>
                          {getAbsenceTypeDisplay(absence.absence_type)}
                        </span>
                        {getStatusBadge(absence.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Fən:</span> {absence.subject}
                        </div>
                        <div>
                          <span className="font-medium">Siniflər:</span> {absence.classes.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Başlama:</span> {absence.start_date}
                        </div>
                        <div>
                          <span className="font-medium">Bitmə:</span> {absence.end_date}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Əvəzetmə vəziyyəti:</span>
                        <span className="text-green-600">{absence.covered_periods}</span>
                        <span className="mx-1">/</span>
                        <span className="text-gray-500">{absence.total_periods}</span>
                        <span className="ml-1">dərs əvəz olundu</span>
                      </div>

                      {absence.reason && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Səbəb:</span> {absence.reason}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {absence.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => handleAutoAssignSubstitute(absence.id)}
                          >
                            <RotateCw className="w-4 h-4 mr-1" />
                            Avtomatik
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAbsence(absence);
                              setShowSubstitutionForm(true);
                            }}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Manuel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Current Substitutions */}
      <Card>
        <div className="card-header p-4 border-b">
          <h3 className="text-lg font-semibold">Bu günün əvəzetmələri</h3>
          <p className="text-sm text-gray-600">Bugün təyin edilmiş əvəzetmələrin siyahısı</p>
        </div>
        <div className="card-content">
          {substitutions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Bu tarix üçün əvəzetmə qeydiyyatı yoxdur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dərs</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qeyb müəllim</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Əvəz müəllim</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaxt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {substitutions.map((substitution) => (
                    <tr key={substitution.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{substitution.period}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{substitution.class_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{substitution.absent_teacher_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{substitution.substitute_teacher_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {substitution.start_time} - {substitution.end_time}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getStatusBadge(substitution.status)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Button size="sm" variant="outline">
                          Təfərrüat
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Manual Assignment Modal */}
      {showSubstitutionForm && selectedAbsence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manuel Əvəzetmə Təyini</h3>
              <Button
                variant="outline"
                onClick={() => setShowSubstitutionForm(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Qeyb müəllim:</strong> {selectedAbsence.teacher_name}</p>
                <p><strong>Fən:</strong> {selectedAbsence.subject}</p>
                <p><strong>Siniflər:</strong> {selectedAbsence.classes.join(', ')}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Əlçatan müəllimlər:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teachers.filter(t => t.is_available && t.workload_hours < t.max_hours).map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-gray-600">{teacher.subject}</p>
                        <p className="text-sm text-gray-500">
                          Yük: {teacher.workload_hours}/{teacher.max_hours} saat
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleManualAssignSubstitute(selectedAbsence.id, teacher.id, 1)}
                      >
                        Təyin et
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSubstitutionManager;