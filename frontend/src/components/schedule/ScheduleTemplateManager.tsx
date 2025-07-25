import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Copy, Trash2, Eye, Edit3, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ScheduleTemplate, ScheduleSlot, GenerationSettings } from './types/scheduleTypes';
import { toast } from 'react-toastify';

interface ScheduleTemplateManagerProps {
  onTemplateLoad: (template: ScheduleTemplate) => void;
  currentSchedule: {
    slots: ScheduleSlot[];
    settings: GenerationSettings;
  };
}

const ScheduleTemplateManager: React.FC<ScheduleTemplateManagerProps> = ({
  onTemplateLoad,
  currentSchedule,
}) => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    
    // Always load demo templates
    setTimeout(() => {
      setTemplates([
        {
          id: 1,
          name: 'Standart həftəlik cədvəl',
          description: 'Adi iş günləri üçün standart dərs cədvəli',
          slots: [],
          settings: {
            week_start_date: new Date().toISOString().split('T')[0],
            schedule_type: 'weekly',
            working_days: [1, 2, 3, 4, 5],
            periods_per_day: 8,
            break_periods: [3, 6],
            lunch_period: 6,
            respect_teacher_preferences: true,
            avoid_conflicts: true,
            allow_room_sharing: false,
            max_consecutive_periods: 4,
            min_break_between_subjects: 0,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'İmtahan cədvəli',
          description: 'İmtahan dövrü üçün xüsusi cədvəl',
          slots: [],
          settings: {
            week_start_date: new Date().toISOString().split('T')[0],
            schedule_type: 'exam',
            working_days: [1, 2, 3, 4, 5, 6],
            periods_per_day: 4,
            break_periods: [2],
            respect_teacher_preferences: true,
            avoid_conflicts: true,
            allow_room_sharing: false,
            max_consecutive_periods: 2,
            min_break_between_subjects: 1,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const saveCurrentAsTemplate = async (name: string, description?: string) => {
    // Always simulate save in demo mode
    const newTemplate: ScheduleTemplate = {
      id: templates.length + 1,
      name,
      description,
      slots: currentSchedule.slots,
      settings: currentSchedule.settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    toast.success('Şablon demo olaraq saxlanıldı!');
    setIsCreateModalOpen(false);
  };

  const updateTemplate = async (templateId: number, updates: Partial<ScheduleTemplate>) => {
    // Always simulate update in demo mode
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, ...updates, updated_at: new Date().toISOString() }
        : template
    ));
    toast.success('Şablon demo olaraq yeniləndi!');
    setIsEditModalOpen(false);
    setSelectedTemplate(null);
  };

  const deleteTemplate = async (templateId: number) => {
    if (!confirm('Bu şablonu silmək istədiyinizə əminsiniz?')) {
      return;
    }

    // Always simulate delete in demo mode
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    toast.success('Şablon demo olaraq silindi!');
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  const duplicateTemplate = async (template: ScheduleTemplate) => {
    const name = `${template.name} (Kopya)`;
    await saveCurrentAsTemplate(name, template.description);
  };

  const exportTemplate = (template: ScheduleTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule-template-${template.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTemplate = async (file: File) => {
    try {
      const text = await file.text();
      const template: ScheduleTemplate = JSON.parse(text);
      
      // Validate template structure
      if (!template.name || !template.slots || !template.settings) {
        throw new Error('Invalid template format');
      }

      await saveCurrentAsTemplate(
        `${template.name} (İmport edilmiş)`,
        template.description
      );
    } catch (error) {
      toast.error('Şablon import edilərkən xəta baş verdi.');
      console.error('Template import error:', error);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderCreateModal = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim()) {
        saveCurrentAsTemplate(name.trim(), description.trim() || undefined);
        setName('');
        setDescription('');
      }
    };

    if (!isCreateModalOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Yeni Şablon Yarat</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              ×
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Şablon adı *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Şablon adını daxil edin..."
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Təsvir</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Şablon haqqında qısa məlumat..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
                Ləğv et
              </Button>
              <Button variant="primary" type="submit">
                <Save size={16} />
                Saxla
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    const [name, setName] = useState(selectedTemplate?.name || '');
    const [description, setDescription] = useState(selectedTemplate?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedTemplate && name.trim()) {
        updateTemplate(selectedTemplate.id!, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
        setName('');
        setDescription('');
      }
    };

    if (!isEditModalOpen || !selectedTemplate) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Şablonu Düzəlt</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
              ×
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Şablon adı *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Təsvir</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                Ləğv et
              </Button>
              <Button variant="primary" type="submit">
                <Save size={16} />
                Yenilə
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTemplateCard = (template: ScheduleTemplate) => {
    const slotCount = template.slots?.length || 0;
    const workingDays = template.settings?.working_days?.length || 0;
    const periodsPerDay = template.settings?.periods_per_day || 0;

    return (
      <Card key={template.id} className="template-card">
        <div className="template-header">
          <h4>{template.name}</h4>
          <div className="template-actions">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onTemplateLoad(template)}
              title="Şablonu yüklə"
            >
              <Upload size={14} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setSelectedTemplate(template);
                setIsEditModalOpen(true);
              }}
              title="Düzəlt"
            >
              <Edit3 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => duplicateTemplate(template)}
              title="Kopya yarat"
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => exportTemplate(template)}
              title="Export et"
            >
              <Download size={14} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => deleteTemplate(template.id!)}
              title="Sil"
              className="danger"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {template.description && (
          <p className="template-description">{template.description}</p>
        )}

        <div className="template-stats">
          <div className="stat">
            <span className="label">Slotlar:</span>
            <span className="value">{slotCount}</span>
          </div>
          <div className="stat">
            <span className="label">İş günləri:</span>
            <span className="value">{workingDays}</span>
          </div>
          <div className="stat">
            <span className="label">Günlük dərs:</span>
            <span className="value">{periodsPerDay}</span>
          </div>
        </div>

        <div className="template-dates">
          <small>
            Yaradılıb: {template.created_at ? new Date(template.created_at).toLocaleDateString('az') : 'N/A'}
          </small>
          {template.updated_at && template.updated_at !== template.created_at && (
            <small>
              Yenilənib: {new Date(template.updated_at).toLocaleDateString('az')}
            </small>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="schedule-template-manager">
      <div className="template-header">
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={currentSchedule.slots.length === 0}
          >
            <Plus size={16} />
            Cari Cədvəli Şablon Kimi Saxla
          </Button>

          <label className="import-button">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  importTemplate(file);
                  e.target.value = '';
                }
              }}
              style={{ display: 'none' }}
            />
            <Button variant="outline" as="span">
              <Upload size={16} />
              İmport Et
            </Button>
          </label>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Şablonlarda axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="templates-grid">
        {loading ? (
          <div className="loading-message">Şablonlar yüklənir...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="empty-message">
            {searchTerm ? 'Axtarış nəticəsi tapılmadı.' : 'Hələ heç bir şablon yoxdur.'}
          </div>
        ) : (
          filteredTemplates.map(template => renderTemplateCard(template))
        )}
      </div>

      {renderCreateModal()}
      {renderEditModal()}
    </div>
  );
};

export default ScheduleTemplateManager;