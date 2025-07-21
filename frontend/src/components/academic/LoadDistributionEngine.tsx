import React, { useState, useEffect } from 'react';
import { BarChart3, Settings, Play, RefreshCw, AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { TeacherInfo, TeachingLoad, DistributionSettings, LoadDistributionRule } from './types/teachingLoadTypes';

interface LoadDistributionEngineProps {
  teachers: TeacherInfo[];
  teachingLoads: TeachingLoad[];
  academicYear: number;
  onDistribute: (distributionData: any) => void;
  isDistributing: boolean;
}

const LoadDistributionEngine: React.FC<LoadDistributionEngineProps> = ({
  teachers,
  teachingLoads,
  academicYear,
  onDistribute,
  isDistributing,
}) => {
  const [settings, setSettings] = useState<DistributionSettings>({
    prioritize_specialization: true,
    balance_workload: true,
    respect_preferences: true,
    avoid_conflicts: true,
    max_classes_per_teacher: 6,
    max_subjects_per_teacher: 3,
    preferred_utilization_min: 75,
    preferred_utilization_max: 95,
    rules: [],
  });
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [distributionPreview, setDistributionPreview] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [distributionStrategy, setDistributionStrategy] = useState<'automatic' | 'manual' | 'hybrid'>('automatic');

  useEffect(() => {
    loadDistributionData();
  }, [academicYear]);

  const loadDistributionData = () => {
    console.log('LoadDistributionEngine: Loading demo distribution data - NO API CALLS');
    
    // Load mock data directly
    setAvailableClasses(getMockAvailableClasses());
    setAvailableSubjects(getMockAvailableSubjects());
    setSettings(prev => ({ ...prev, rules: getMockDistributionRules() }));
  };

  const getMockAvailableClasses = () => {
    console.log('getMockAvailableClasses: Returning static classes data');
    return [
      { id: 1, name: '9A', grade_level: 9, section: 'A', current_enrollment: 28, max_capacity: 30 },
      { id: 2, name: '9B', grade_level: 9, section: 'B', current_enrollment: 26, max_capacity: 30 },
      { id: 3, name: '10A', grade_level: 10, section: 'A', current_enrollment: 25, max_capacity: 30 },
      { id: 4, name: '10B', grade_level: 10, section: 'B', current_enrollment: 24, max_capacity: 30 },
      { id: 5, name: '11A', grade_level: 11, section: 'A', current_enrollment: 23, max_capacity: 25 },
      { id: 6, name: '11B', grade_level: 11, section: 'B', current_enrollment: 22, max_capacity: 25 }
    ];
  };

  const getMockAvailableSubjects = () => {
    console.log('getMockAvailableSubjects: Returning static subjects data');
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

  const getMockDistributionRules = (): LoadDistributionRule[] => {
    console.log('getMockDistributionRules: Returning static distribution rules');
    return [
      {
        id: 1,
        name: 'Fənn ixtisaslaşması prioriteti',
        description: 'Müəllimə ixtisaslaşdığı fənnləri təyin et',
        rule_type: 'subject_specialization',
        weight: 0.4,
        enabled: true,
        parameters: { min_qualification_score: 80 }
      },
      {
        id: 2,
        name: 'İş yükü balansı',
        description: 'Bütün müəllimlər arasında iş yükünü bərabər böl',
        rule_type: 'workload_balance',
        weight: 0.3,
        enabled: true,
        parameters: { target_utilization: 85, tolerance: 10 }
      },
      {
        id: 3,
        name: 'Müəllim tercihləri',
        description: 'Müəllimlərin tercih etdiyi fənn və sinifləri nəzərə al',
        rule_type: 'preference_priority',
        weight: 0.2,
        enabled: true,
        parameters: { preference_weight: 0.7 }
      },
      {
        id: 4,
        name: 'Konflikt qabağı alma',
        description: 'Cədvəl konfliktlərini qabağını al',
        rule_type: 'conflict_avoidance',
        weight: 0.1,
        enabled: true,
        parameters: { strict_mode: true }
      }
    ];
  };

  const generatePreview = () => {
    setIsPreviewLoading(true);
    console.log('generatePreview: Generating demo distribution preview - NO API CALLS');
    
    // Simulate preview generation with timeout
    setTimeout(() => {
      const mockPreview = {
        total_loads: selectedClasses.length * 3, // Average 3 subjects per class
        affected_teachers: teachers.length,
        balance_score: 85.5,
        conflicts: 0,
        optimization_score: 92.3,
        assignments: selectedClasses.map(classId => {
          const classInfo = availableClasses.find(c => c.id === classId);
          return {
            class_id: classId,
            class_name: classInfo?.name || `Sinif ${classId}`,
            subject_assignments: [
              {
                subject_id: 1,
                subject_name: 'Riyaziyyat',
                teacher_id: 1,
                teacher_name: 'Aygün Məmmədova',
                weekly_hours: 4,
                confidence_score: 95
              },
              {
                subject_id: 2,
                subject_name: 'Fizika',
                teacher_id: 2,
                teacher_name: 'Elnur Əliyev',
                weekly_hours: 3,
                confidence_score: 88
              },
              {
                subject_id: 3,
                subject_name: 'Kimya',
                teacher_id: 3,
                teacher_name: 'Səbinə Həsənova',
                weekly_hours: 3,
                confidence_score: 91
              }
            ]
          };
        }),
        recommendations: [
          'Müəllim ixtisaslaşması qayədalarına üstünlük verilib',
          'İş yükü balansı optimallaşdırıldı',
          'Heç bir cədvəl konflikti aşkar edilmədi'
        ]
      };
      
      setDistributionPreview(mockPreview);
      setIsPreviewLoading(false);
    }, 1500); // Simulate 1.5 second processing time
  };

  const handleDistribute = () => {
    onDistribute({
      settings,
      selected_classes: selectedClasses,
      strategy: distributionStrategy,
      preview_data: distributionPreview,
    });
  };

  const handleSettingChange = (key: keyof DistributionSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRuleToggle = (ruleId: number) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    }));
  };

  const handleRuleWeightChange = (ruleId: number, weight: number) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === ruleId ? { ...rule, weight } : rule
      ),
    }));
  };

  const renderDistributionSettings = () => {
    return (
      <Card className="distribution-settings">
        <div className="settings-header">
          <h3>
            <Settings size={20} />
            Bölüşdürmə Tənzimləmələri
          </h3>
        </div>

        <div className="settings-grid">
          <div className="setting-group">
            <h4>Əsas Tənzimləmələr</h4>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.prioritize_specialization}
                onChange={(e) => handleSettingChange('prioritize_specialization', e.target.checked)}
              />
              <span>İxtisaslaşmanı prioritet et</span>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.balance_workload}
                onChange={(e) => handleSettingChange('balance_workload', e.target.checked)}
              />
              <span>İş yükünü balansla</span>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.respect_preferences}
                onChange={(e) => handleSettingChange('respect_preferences', e.target.checked)}
              />
              <span>Müəllim seçimlərinə uyğun ol</span>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.avoid_conflicts}
                onChange={(e) => handleSettingChange('avoid_conflicts', e.target.checked)}
              />
              <span>Konfliktlərdən çəkin</span>
            </label>
          </div>

          <div className="setting-group">
            <h4>Məhdudiyyətlər</h4>
            
            <div className="number-setting">
              <label>Maksimum sinif sayı (müəllim başına):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.max_classes_per_teacher}
                onChange={(e) => handleSettingChange('max_classes_per_teacher', parseInt(e.target.value))}
              />
            </div>

            <div className="number-setting">
              <label>Maksimum fənn sayı (müəllim başına):</label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.max_subjects_per_teacher}
                onChange={(e) => handleSettingChange('max_subjects_per_teacher', parseInt(e.target.value))}
              />
            </div>

            <div className="number-setting">
              <label>Minimum istifadə faizi (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.preferred_utilization_min}
                onChange={(e) => handleSettingChange('preferred_utilization_min', parseInt(e.target.value))}
              />
            </div>

            <div className="number-setting">
              <label>Maksimum istifadə faizi (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.preferred_utilization_max}
                onChange={(e) => handleSettingChange('preferred_utilization_max', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="setting-group">
            <h4>Strategiya</h4>
            
            <div className="strategy-selector">
              <label>
                <input
                  type="radio"
                  value="automatic"
                  checked={distributionStrategy === 'automatic'}
                  onChange={(e) => setDistributionStrategy(e.target.value as any)}
                />
                <span>Avtomatik</span>
                <small>Sistem avtomatik olaraq ən yaxşı bölüşdürməni tapacaq</small>
              </label>

              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={distributionStrategy === 'manual'}
                  onChange={(e) => setDistributionStrategy(e.target.value as any)}
                />
                <span>Manual</span>
                <small>Siz özünüz təyinatları seçəcəksiniz</small>
              </label>

              <label>
                <input
                  type="radio"
                  value="hybrid"
                  checked={distributionStrategy === 'hybrid'}
                  onChange={(e) => setDistributionStrategy(e.target.value as any)}
                />
                <span>Hibrid</span>
                <small>Sistem təklif edəcək, siz düzəliş edəcəksiniz</small>
              </label>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderDistributionRules = () => {
    return (
      <Card className="distribution-rules">
        <div className="rules-header">
          <h3>
            <Sliders size={20} />
            Bölüşdürmə Qaydaları
          </h3>
        </div>

        <div className="rules-list">
          {settings.rules.map(rule => (
            <div key={rule.id} className="rule-item">
              <div className="rule-info">
                <label className="rule-toggle">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleRuleToggle(rule.id)}
                  />
                  <span className="rule-name">{rule.name}</span>
                </label>
                <p className="rule-description">{rule.description}</p>
              </div>

              <div className="rule-controls">
                <label>Çəki:</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rule.weight}
                  onChange={(e) => handleRuleWeightChange(rule.id, parseFloat(e.target.value))}
                  disabled={!rule.enabled}
                />
                <span className="weight-value">{rule.weight.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderClassSelection = () => {
    return (
      <Card className="class-selection">
        <div className="selection-header">
          <h3>Sinif Seçimi</h3>
          <div className="selection-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedClasses(availableClasses.map(c => c.id))}
            >
              Hamısını Seç
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedClasses([])}
            >
              Heç birini Seçmə
            </Button>
          </div>
        </div>

        <div className="classes-grid">
          {availableClasses.map(classInfo => (
            <div key={classInfo.id} className="class-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(classInfo.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClasses(prev => [...prev, classInfo.id]);
                    } else {
                      setSelectedClasses(prev => prev.filter(id => id !== classInfo.id));
                    }
                  }}
                />
                <span className="class-name">{classInfo.name}</span>
                <span className="class-info">
                  {classInfo.current_enrollment} şagird, 
                  {classInfo.grade_level}. sinif
                </span>
              </label>
            </div>
          ))}
        </div>

        {selectedClasses.length > 0 && (
          <div className="selection-summary">
            <p>{selectedClasses.length} sinif seçildi</p>
          </div>
        )}
      </Card>
    );
  };

  const renderDistributionPreview = () => {
    if (!distributionPreview) {
      return (
        <Card className="distribution-preview empty">
          <div className="empty-state">
            <BarChart3 size={48} />
            <h3>Önizləmə mövcud deyil</h3>
            <p>Bölüşdürmə önizləməsi görmək üçün "Önizləmə Yarat" düyməsini basın</p>
          </div>
        </Card>
      );
    }

    return (
      <Card className="distribution-preview">
        <div className="preview-header">
          <h3>Bölüşdürmə Önizləməsi</h3>
          <div className="preview-stats">
            <div className="stat">
              <span className="label">Təyinatlar:</span>
              <span className="value">{distributionPreview.total_assignments}</span>
            </div>
            <div className="stat">
              <span className="label">Balans skoru:</span>
              <span className="value">{distributionPreview.balance_score?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="preview-content">
          {distributionPreview.assignments?.map((assignment: any, index: number) => (
            <div key={index} className="assignment-item">
              <div className="assignment-info">
                <span className="teacher-name">{assignment.teacher_name}</span>
                <span className="class-subject">{assignment.class_name} - {assignment.subject_name}</span>
                <span className="hours">{assignment.weekly_hours} saat</span>
              </div>
              <div className="assignment-score">
                Uyğunluq: {(assignment.match_score * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        {distributionPreview.warnings && distributionPreview.warnings.length > 0 && (
          <div className="preview-warnings">
            <h4>
              <AlertTriangle size={16} />
              Xəbərdarlıqlar
            </h4>
            {distributionPreview.warnings.map((warning: string, index: number) => (
              <div key={index} className="warning-item">
                {warning}
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="load-distribution-engine">
      <div className="distribution-header">
        <div className="header-actions">
          <Button
            variant="outline"
            onClick={generatePreview}
            disabled={isPreviewLoading || selectedClasses.length === 0}
          >
            {isPreviewLoading ? (
              <RefreshCw size={16} className="spin" />
            ) : (
              <BarChart3 size={16} />
            )}
            Önizləmə Yarat
          </Button>

          <Button
            variant="primary"
            onClick={handleDistribute}
            disabled={isDistributing || !distributionPreview || selectedClasses.length === 0}
          >
            {isDistributing ? (
              <>
                <RefreshCw size={16} className="spin" />
                Bölüşdürülür...
              </>
            ) : (
              <>
                <Play size={16} />
                Bölüşdür
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="distribution-content">
        <div className="settings-panel">
          {renderDistributionSettings()}
          {renderDistributionRules()}
        </div>

        <div className="selection-panel">
          {renderClassSelection()}
          {renderDistributionPreview()}
        </div>
      </div>
    </div>
  );
};

export default LoadDistributionEngine;