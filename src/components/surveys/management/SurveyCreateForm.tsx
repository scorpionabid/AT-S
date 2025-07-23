import React, { useState } from 'react';
import { api } from '../../../services/api';
import SurveyTargetingForm from '../targeting/SurveyTargetingForm';
import '../../../styles/survey-wizard.css';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'rating';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface SurveyData {
  title: string;
  description: string;
  survey_type: 'form' | 'poll' | 'assessment' | 'feedback';
  is_anonymous: boolean;
  allow_multiple_responses: boolean;
  structure: {
    sections: Section[];
  };
  target_institutions: number[];
  target_departments: number[];
  start_date: string;
  end_date: string;
  completion_threshold: number;
}

interface SurveyCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SurveyCreateForm: React.FC<SurveyCreateFormProps> = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SurveyData>({
    title: '',
    description: '',
    survey_type: 'form',
    is_anonymous: false,
    allow_multiple_responses: false,
    structure: {
      sections: [{
        id: 'section-1',
        title: 'Əsas Bölmə',
        description: '',
        questions: [{
          id: 'question-1',
          question: '',
          type: 'text',
          required: true,
          placeholder: ''
        }]
      }]
    },
    target_institutions: [],
    target_departments: [],
    start_date: '',
    end_date: '',
    completion_threshold: 80
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const steps = [
    { id: 1, title: 'Əsas Məlumatlar', icon: '📝', description: 'Sorğu haqqında ümumi məlumatlar' },
    { id: 2, title: 'Sorğu Növü', icon: '🎯', description: 'Sorğu növü və parametrləri' },
    { id: 3, title: 'Hədəf Qrup', icon: '👥', description: 'Kimlərin iştirak edəcəyi' },
    { id: 4, title: 'Sual Strukturu', icon: '❓', description: 'Sualların yaradılması' },
    { id: 5, title: 'Yoxlama', icon: '✅', description: 'Son nəzərdən keçirmə' }
  ];

  const surveyTypes = [
    {
      value: 'form',
      title: 'Form',
      description: 'Məlumat toplama formaları',
      icon: '📋',
      details: 'Rəsmi məlumat toplama və qeydiyyat üçün',
      examples: ['Şagird qeydiyyat', 'Müəllim məlumatları', 'Sənəd formaları']
    },
    {
      value: 'poll',
      title: 'Sorğu',
      description: 'Tez rəy sorğusu və səsvermə',
      icon: '📊',
      details: 'Qısa suallar və sürətli rəy öyrənmə üçün',
      examples: ['Hansı fənn daha çətin?', 'Yemək menyusu necədir?', 'Tədris vaxtı']
    },
    {
      value: 'assessment',
      title: 'Qiymətləndirmə',
      description: 'Performans dəyərləndirməsi',
      icon: '⭐',
      details: 'Müəllim və xidmət keyfiyyəti qiymətləndirməsi üçün',
      examples: ['Müəllim performansı', 'Xidmət keyfiyyəti', 'Məktəb dəyərləndirməsi']
    },
    {
      value: 'feedback',
      title: 'Geri bildirim',
      description: 'Məmnuniyyət və təkliflər',
      icon: '💬',
      details: 'İstifadəçi məmnuniyyəti və təkmilləşdirmə təklifləri üçün',
      examples: ['Kafeterya xidməti', 'İdarəçilik', 'Təkmilləşdirmə təklifləri']
    }
  ];

  const questionTypes = [
    { value: 'text', label: 'Qısa mətn', icon: '📝', description: 'Qısa cavab üçün' },
    { value: 'textarea', label: 'Uzun mətn', icon: '📄', description: 'Ətraflı cavab üçün' },
    { value: 'select', label: 'Açılan siyahı', icon: '📋', description: 'Siyahıdan seçim' },
    { value: 'radio', label: 'Tək seçim', icon: '⚪', description: 'Bir variant seçimi' },
    { value: 'checkbox', label: 'Çox seçim', icon: '☑️', description: 'Birdən çox variant' },
    { value: 'number', label: 'Rəqəm', icon: '🔢', description: 'Rəqəmsal cavab' },
    { value: 'date', label: 'Tarix', icon: '📅', description: 'Tarix seçimi' },
    { value: 'rating', label: 'Qiymətləndirmə', icon: '⭐', description: '1-dən 5-ə qədər' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'completion_threshold') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const selectSurveyType = (type: 'form' | 'poll' | 'assessment' | 'feedback') => {
    setFormData(prev => ({
      ...prev,
      survey_type: type
    }));
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'Yeni Bölmə',
      description: '',
      questions: [{
        id: `question-${Date.now()}`,
        question: '',
        type: 'text',
        required: true,
        placeholder: ''
      }]
    };

    setFormData(prev => ({
      ...prev,
      structure: {
        sections: [...prev.structure.sections, newSection]
      }
    }));
  };

  const removeSection = (sectionIndex: number) => {
    if (formData.structure.sections.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      structure: {
        sections: prev.structure.sections.filter((_, index) => index !== sectionIndex)
      }
    }));
  };

  const updateSection = (sectionIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      structure: {
        sections: prev.structure.sections.map((section, index) => 
          index === sectionIndex ? { ...section, [field]: value } : section
        )
      }
    }));
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      question: '',
      type: 'text',
      required: true,
      placeholder: ''
    };

    setFormData(prev => ({
      ...prev,
      structure: {
        sections: prev.structure.sections.map((section, index) => 
          index === sectionIndex 
            ? { ...section, questions: [...section.questions, newQuestion] }
            : section
        )
      }
    }));
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const section = formData.structure.sections[sectionIndex];
    if (section.questions.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      structure: {
        sections: prev.structure.sections.map((section, index) => 
          index === sectionIndex 
            ? { 
                ...section, 
                questions: section.questions.filter((_, qIndex) => qIndex !== questionIndex) 
              }
            : section
        )
      }
    }));
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      structure: {
        sections: prev.structure.sections.map((section, sIndex) => 
          sIndex === sectionIndex 
            ? {
                ...section,
                questions: section.questions.map((question, qIndex) =>
                  qIndex === questionIndex ? { ...question, [field]: value } : question
                )
              }
            : section
        )
      }
    }));
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Sorğu başlığı mütləqdir';
        }
        break;
      
      case 3:
        if (formData.target_institutions.length === 0) {
          newErrors.target_institutions = 'Ən azı bir təşkilat seçilməlidir';
        }
        break;
      
      case 4:
        formData.structure.sections.forEach((section, sIndex) => {
          if (!section.title.trim()) {
            newErrors[`section_${sIndex}_title`] = 'Bölmə başlığı mütləqdir';
          }
          section.questions.forEach((question, qIndex) => {
            if (!question.question.trim()) {
              newErrors[`question_${sIndex}_${qIndex}`] = 'Sual mətni mütləqdir';
            }
          });
        });
        break;
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'Bitmə tarixi başlama tarixindən sonra olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setErrors({});

    try {
      await api.post('/surveys', formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Sorğu yaradılarkən xəta baş verdi'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentStep < steps.length) {
        nextStep();
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>📝 Əsas Məlumatlar</h3>
              <p>Sorğunuz haqqında ümumi məlumatları daxil edin</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="title">
                <span className="label-required">Sorğu Başlığı *</span>
                <small>Aydın və başa düşülən başlıq yazın</small>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`modern-input ${errors.title ? 'error' : ''}`}
                placeholder="Məsələn: 2024 İllik Müəllim Qiymətləndirməsi"
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <span>Təsvir</span>
                <small>Sorğunun məqsədini qısaca izah edin</small>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="modern-textarea"
                rows={4}
                placeholder="Bu sorğu müəllimlərin fəaliyyətini qiymətləndirmək və onlara dəstək vermək məqsədilə aparılır..."
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="start_date">
                  <span>📅 Başlama tarixi</span>
                  <small>Sorğu nə vaxt başlayacaq</small>
                </label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">
                  <span>📅 Bitmə tarixi</span>
                  <small>Sorğu nə vaxt bitəcək</small>
                </label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`modern-input ${errors.end_date ? 'error' : ''}`}
                />
                {errors.end_date && <span className="field-error">{errors.end_date}</span>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>🎯 Sorğu Növü</h3>
              <p>Məqsədinizə uyğun sorğu növünü seçin</p>
            </div>

            <div className="survey-types-grid">
              {surveyTypes.map((type) => (
                <div
                  key={type.value}
                  className={`survey-type-card ${formData.survey_type === type.value ? 'selected' : ''}`}
                  onClick={() => selectSurveyType(type.value as any)}
                >
                  <div className="card-icon">{type.icon}</div>
                  <h4>{type.title}</h4>
                  <p className="card-description">{type.description}</p>
                  <div className="card-details">{type.details}</div>
                  <div className="card-examples">
                    <strong>Nümunələr:</strong>
                    <ul>
                      {type.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="survey-settings">
              <h4>⚙️ Əlavə Parametrlər</h4>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="is_anonymous"
                      checked={formData.is_anonymous}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                    <div className="setting-info">
                      <strong>Anonim sorğu</strong>
                      <small>Cavab verənlərin kimliyini gizlə</small>
                    </div>
                  </label>
                </div>

                <div className="setting-item">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="allow_multiple_responses"
                      checked={formData.allow_multiple_responses}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                    <div className="setting-info">
                      <strong>Çoxlu cavab</strong>
                      <small>Bir nəfər birdən çox cavab verə bilsin</small>
                    </div>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="completion_threshold">
                    <span>🎯 Tamamlanma məqsədi (%)</span>
                    <small>Neçə faiz iştirak gözlənilir</small>
                  </label>
                  <input
                    type="range"
                    id="completion_threshold"
                    name="completion_threshold"
                    value={formData.completion_threshold}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="modern-range"
                  />
                  <div className="range-value">{formData.completion_threshold}%</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>👥 Hədəf Qrup</h3>
              <p>Sorğuda kimlərin iştirak edəcəyini seçin</p>
            </div>

            <div className="target-selection-wrapper">
              <div className="selection-guide">
                <div className="guide-item">
                  <span className="guide-icon">🎯</span>
                  <div className="guide-content">
                    <strong>Fərdi Seçim</strong>
                    <small>Konkret təşkilatları axtarıb seçin</small>
                  </div>
                </div>
                <div className="guide-item">
                  <span className="guide-icon">🌳</span>
                  <div className="guide-content">
                    <strong>İerarxik Seçim</strong>
                    <small>Təşkilat strukturu əsasında seçim edin</small>
                  </div>
                </div>
                <div className="guide-item">
                  <span className="guide-icon">📦</span>
                  <div className="guide-content">
                    <strong>Toplu Seçim</strong>
                    <small>Tip və səviyyə əsasında kütləvi seçim</small>
                  </div>
                </div>
              </div>

              <SurveyTargetingForm
                value={{
                  target_institutions: formData.target_institutions,
                  target_departments: formData.target_departments,
                  target_user_types: [],
                  institution_levels: []
                }}
                onChange={(criteria: any) => setFormData(prev => ({ 
                  ...prev, 
                  target_institutions: criteria.target_institutions || [],
                  target_departments: criteria.target_departments || []
                }))}
                onValidation={(validation: any) => {
                  // Handle validation if needed
                  if (validation && !validation.is_valid) {
                    setErrors(prev => ({ ...prev, target_institutions: validation.errors[0] || 'Seçim xətası' }));
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.target_institutions;
                      return newErrors;
                    });
                  }
                }}
              />
              
              {errors.target_institutions && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{errors.target_institutions}</span>
                </div>
              )}

              {/* Selection Summary */}
              {(formData.target_institutions.length > 0 || formData.target_departments.length > 0) && (
                <div className="selection-summary">
                  <h4>📊 Seçim Xülasəsi</h4>
                  <div className="summary-stats">
                    <div className="summary-item">
                      <span className="summary-icon">🏢</span>
                      <div className="summary-details">
                        <strong>{formData.target_institutions.length}</strong>
                        <small>Təşkilat seçildi</small>
                      </div>
                    </div>
                    <div className="summary-item">
                      <span className="summary-icon">🏛️</span>
                      <div className="summary-details">
                        <strong>{formData.target_departments.length}</strong>
                        <small>Şöbə seçildi</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>❓ Sual Strukturu</h3>
              <p>Sorğunuzun suallarını yaradın</p>
            </div>

            <div className="structure-actions">
              <button
                type="button"
                onClick={addSection}
                className="add-section-btn"
              >
                ➕ Yeni Bölmə Əlavə Et
              </button>
            </div>

            {formData.structure.sections.map((section, sectionIndex) => (
              <div key={section.id} className="section-builder">
                <div className="section-header">
                  <div className="section-info">
                    <h4>📋 Bölmə {sectionIndex + 1}</h4>
                    {formData.structure.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="remove-section-btn"
                      >
                        🗑️ Bölməni Sil
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-required">Bölmə başlığı *</span>
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                    className={`modern-input ${errors[`section_${sectionIndex}_title`] ? 'error' : ''}`}
                    placeholder="Məsələn: Şəxsi Məlumatlar"
                  />
                  {errors[`section_${sectionIndex}_title`] && (
                    <span className="field-error">{errors[`section_${sectionIndex}_title`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <span>Bölmə təsviri</span>
                  </label>
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                    className="modern-textarea"
                    rows={2}
                    placeholder="Bu bölmədə nə barədə suallar olacaq..."
                  />
                </div>

                <div className="questions-section">
                  <div className="questions-header">
                    <h5>Suallar</h5>
                    <button
                      type="button"
                      onClick={() => addQuestion(sectionIndex)}
                      className="add-question-btn"
                    >
                      ➕ Sual Əlavə Et
                    </button>
                  </div>

                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="question-builder">
                      <div className="question-header">
                        <span className="question-number">Sual {questionIndex + 1}</span>
                        {section.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            className="remove-question-btn"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          <span className="label-required">Sual mətni *</span>
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'question', e.target.value)}
                          className={`modern-input ${errors[`question_${sectionIndex}_${questionIndex}`] ? 'error' : ''}`}
                          placeholder="Sualınızı daxil edin..."
                        />
                        {errors[`question_${sectionIndex}_${questionIndex}`] && (
                          <span className="field-error">{errors[`question_${sectionIndex}_${questionIndex}`]}</span>
                        )}
                      </div>

                      <div className="question-settings">
                        <div className="form-group">
                          <label>
                            <span>Sual növü</span>
                          </label>
                          <div className="question-types-grid">
                            {questionTypes.map(type => (
                              <div
                                key={type.value}
                                className={`question-type-option ${question.type === type.value ? 'selected' : ''}`}
                                onClick={() => updateQuestion(sectionIndex, questionIndex, 'type', type.value)}
                              >
                                <span className="type-icon">{type.icon}</span>
                                <span className="type-label">{type.label}</span>
                                <small>{type.description}</small>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label>
                            <span>Placeholder mətn</span>
                          </label>
                          <input
                            type="text"
                            value={question.placeholder || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'placeholder', e.target.value)}
                            className="modern-input"
                            placeholder="Cavab üçün göstəriş mətni..."
                          />
                        </div>

                        <div className="question-options">
                          <label className="toggle-label">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                            <span>Mütləq sual</span>
                          </label>
                        </div>

                        {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                          <div className="form-group">
                            <label>
                              <span>Seçim variantları</span>
                              <small>Hər sətirdə bir variant yazın</small>
                            </label>
                            <textarea
                              value={question.options?.join('\n') || ''}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'options', e.target.value.split('\n').filter(opt => opt.trim()))}
                              className="modern-textarea"
                              rows={4}
                              placeholder="Çox yaxşı&#10;Yaxşı&#10;Orta&#10;Pis&#10;Çox pis"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>✅ Yoxlama və Təsdiq</h3>
              <p>Sorğunuzu yaratmadan əvvəl son dəfə yoxlayın</p>
            </div>

            <div className="review-section">
              <div className="review-card">
                <h4>📝 Əsas Məlumatlar</h4>
                <div className="review-item">
                  <strong>Başlıq:</strong> {formData.title}
                </div>
                {formData.description && (
                  <div className="review-item">
                    <strong>Təsvir:</strong> {formData.description}
                  </div>
                )}
                <div className="review-item">
                  <strong>Növ:</strong> {surveyTypes.find(t => t.value === formData.survey_type)?.title}
                </div>
                <div className="review-item">
                  <strong>Tarixlər:</strong> 
                  {formData.start_date && ` ${new Date(formData.start_date).toLocaleDateString('az-AZ')}`}
                  {formData.end_date && ` - ${new Date(formData.end_date).toLocaleDateString('az-AZ')}`}
                </div>
              </div>

              <div className="review-card">
                <h4>👥 Hədəf Qrup</h4>
                <div className="review-item">
                  <strong>Təşkilatlar:</strong> {formData.target_institutions.length} seçildi
                </div>
                <div className="review-item">
                  <strong>Şöbələr:</strong> {formData.target_departments.length} seçildi
                </div>
              </div>

              <div className="review-card">
                <h4>❓ Struktur</h4>
                <div className="review-item">
                  <strong>Bölmələr:</strong> {formData.structure.sections.length}
                </div>
                <div className="review-item">
                  <strong>Ümumi suallar:</strong> {formData.structure.sections.reduce((total, section) => total + section.questions.length, 0)}
                </div>
              </div>

              <div className="review-card">
                <h4>⚙️ Parametrlər</h4>
                <div className="review-item">
                  <strong>Anonim:</strong> {formData.is_anonymous ? 'Bəli' : 'Xeyr'}
                </div>
                <div className="review-item">
                  <strong>Çoxlu cavab:</strong> {formData.allow_multiple_responses ? 'İcazə verilir' : 'İcazə verilmir'}
                </div>
                <div className="review-item">
                  <strong>Tamamlanma məqsədi:</strong> {formData.completion_threshold}%
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{errors.general}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay survey-wizard-overlay">
      <div className="modal-content survey-wizard-modal" onKeyDown={handleKeyDown} tabIndex={-1}>
        <div className="modal-header">
          <h2>🎯 Yeni Sorğu Yaradın</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {/* Progress Steps */}
        <div className="wizard-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`wizard-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''} ${step.id < currentStep ? 'clickable' : ''}`}
              onClick={() => step.id < currentStep ? setCurrentStep(step.id) : null}
            >
              <div className="step-icon">
                {currentStep > step.id ? '✅' : step.icon}
              </div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="wizard-content">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          <button
            type="button"
            onClick={prevStep}
            className="nav-btn secondary"
            disabled={currentStep === 1}
          >
            ← Geri
          </button>

          <div className="nav-info">
            Addım {currentStep} / {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="nav-btn primary"
            >
              İrəli →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="nav-btn success"
              disabled={loading}
            >
              {loading ? '⏳ Yaradılır...' : '🎯 Sorğunu Yarat'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyCreateForm;