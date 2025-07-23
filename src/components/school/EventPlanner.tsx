import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users, MapPin, AlertCircle, CheckCircle, Edit, Trash } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { ToastContainer, toast } from 'react-toastify';

interface SchoolEvent {
  id: number;
  title: string;
  description: string;
  type: 'academic' | 'cultural' | 'sports' | 'administrative' | 'exam' | 'meeting' | 'excursion';
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  organized_by: string;
  organizer_id: number;
  target_audience: 'all_school' | 'specific_grades' | 'teachers' | 'parents' | 'specific_classes';
  target_grades?: string[];
  target_classes?: string[];
  max_participants?: number;
  current_participants: number;
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  resources_needed: string[];
  budget?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface EventFormData {
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  target_audience: string;
  target_grades: string[];
  target_classes: string[];
  max_participants?: number;
  resources_needed: string[];
  budget?: number;
  notes: string;
}

interface EventStats {
  total_events_this_month: number;
  upcoming_events: number;
  events_today: number;
  pending_approvals: number;
}

const EventPlanner: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'academic',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    target_audience: 'all_school',
    target_grades: [],
    target_classes: [],
    max_participants: undefined,
    resources_needed: [],
    budget: undefined,
    notes: ''
  });

  const eventTypes = [
    { value: 'academic', label: 'Akademik', color: 'bg-blue-100 text-blue-800' },
    { value: 'cultural', label: 'Mədəni', color: 'bg-purple-100 text-purple-800' },
    { value: 'sports', label: 'İdman', color: 'bg-green-100 text-green-800' },
    { value: 'administrative', label: 'İdarətmə', color: 'bg-gray-100 text-gray-800' },
    { value: 'exam', label: 'İmtahan', color: 'bg-red-100 text-red-800' },
    { value: 'meeting', label: 'Toplantı', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'excursion', label: 'Ekskursiya', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const targetAudienceOptions = [
    { value: 'all_school', label: 'Bütün məktəb' },
    { value: 'specific_grades', label: 'Müəyyən siniflər' },
    { value: 'teachers', label: 'Müəllimlər' },
    { value: 'parents', label: 'Valideynlər' },
    { value: 'specific_classes', label: 'Müəyyən sinif grupları' }
  ];

  useEffect(() => {
    fetchEvents();
    fetchEventStats();
  }, [selectedDate, filterType]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await fetch(`/api/school-events?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        toast.error('Tədbirlər yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      toast.error('Tədbirlər yüklənərkən xəta baş verdi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStats = async () => {
    try {
      const response = await fetch('/api/school-events/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats yüklənərkən xəta:', error);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingEvent 
        ? `/api/school-events/${editingEvent.id}` 
        : '/api/school-events';
      
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingEvent ? 'Tədbir yeniləndi' : 'Tədbir yaradıldı');
        setShowEventForm(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
        fetchEventStats();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Xəta baş verdi');
      }
    } catch (error) {
      toast.error('Tədbir saxlanılarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEventDelete = async (eventId: number) => {
    if (!confirm('Bu tədbiri silmək istədiyinizdən əminsiniz?')) return;

    try {
      const response = await fetch(`/api/school-events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Tədbir silindi');
        fetchEvents();
        fetchEventStats();
      } else {
        toast.error('Tədbir silinərkən xəta baş verdi');
      }
    } catch (error) {
      toast.error('Tədbir silinərkən xəta baş verdi');
    }
  };

  const handleEventEdit = (event: SchoolEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      start_date: event.start_date,
      end_date: event.end_date,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      target_audience: event.target_audience,
      target_grades: event.target_grades || [],
      target_classes: event.target_classes || [],
      max_participants: event.max_participants,
      resources_needed: event.resources_needed || [],
      budget: event.budget,
      notes: event.notes || ''
    });
    setShowEventForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'academic',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      target_audience: 'all_school',
      target_grades: [],
      target_classes: [],
      max_participants: undefined,
      resources_needed: [],
      budget: undefined,
      notes: ''
    });
  };

  const getEventTypeDisplay = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.label || type;
  };

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'planned': { text: 'Planlaşdırılıb', class: 'bg-blue-100 text-blue-700', icon: Clock },
      'confirmed': { text: 'Təsdiqlənib', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      'in_progress': { text: 'Davam edir', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'completed': { text: 'Tamamlanıb', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      'cancelled': { text: 'Ləğv edilib', class: 'bg-red-100 text-red-700', icon: AlertCircle }
    };
    const badge = badges[status as keyof typeof badges] || badges.planned;
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badge.class}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner size="lg" text="Tədbirlər yüklənir..." />;
  }

  return (
    <div className="event-planner">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="event-header mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tədbir Planlaması</h1>
        <p className="text-gray-600">Məktəb tədbirlərini planlaşdırın və idarə edin (UBR tərəfindən)</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid mb-6">
          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu ay tədbir</p>
                <p className="text-xl font-semibold">{stats.total_events_this_month}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gələcək tədbirlər</p>
                <p className="text-xl font-semibold">{stats.upcoming_events}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu gün tədbir</p>
                <p className="text-xl font-semibold">{stats.events_today}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Təsdiq gözləyir</p>
                <p className="text-xl font-semibold">{stats.pending_approvals}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tarix:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Növ:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Hamısı</option>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowEventForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Tədbir
          </Button>
        </div>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">Tədbir tapılmadı</p>
              <p className="text-gray-500">Seçilmiş tarix və filtr üçün tədbir mövcud deyil</p>
            </div>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="event-card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.type)}`}>
                        {getEventTypeDisplay(event.type)}
                      </span>
                      {getStatusBadge(event.status)}
                    </div>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEventEdit(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEventDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.start_date}
                    {event.end_date !== event.start_date && ` - ${event.end_date}`}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.start_time} - {event.end_time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {event.max_participants ? 
                      `${event.current_participants}/${event.max_participants}` : 
                      `${event.current_participants} iştirakçı`
                    }
                  </div>
                </div>

                {(event.resources_needed.length > 0 || event.budget) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {event.resources_needed.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Lazımi resurslar:</span>
                          <p className="text-gray-600">{event.resources_needed.join(', ')}</p>
                        </div>
                      )}
                      {event.budget && (
                        <div>
                          <span className="font-medium text-gray-700">Büdcə:</span>
                          <p className="text-gray-600">{event.budget} AZN</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Təşkilatçı: {event.organized_by}</span>
                  <span>
                    {event.approval_status === 'approved' && event.approved_by && 
                      `Təsdiq edən: ${event.approved_by}`
                    }
                    {event.approval_status === 'pending' && 'Təsdiq gözləyir'}
                    {event.approval_status === 'rejected' && 'Rədd edilib'}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingEvent ? 'Tədbiri Düzəlt' : 'Yeni Tədbir Yarat'}
              </h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
              >
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleEventSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tədbir adı</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tədbir növü</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Təsvir</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlama tarixi</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bitmə tarixi</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlama saatı</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bitmə saatı</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yer</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Məsələn: Məktəb aula"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hədəf auditoriya</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {targetAudienceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum iştirakçı</label>
                  <input
                    type="number"
                    value={formData.max_participants || ''}
                    onChange={(e) => setFormData({...formData, max_participants: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Məhdudiyyət olmadıqda boş saxlayın"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Büdcə (AZN)</label>
                <input
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData({...formData, budget: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Büdcə tələb olunmursa boş saxlayın"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Əlavə qeydlər</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="İstəyə görə əlavə məlumat və qeydlər"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                >
                  Ləğv et
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saxlanılır...' : (editingEvent ? 'Yenilə' : 'Yarat')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPlanner;