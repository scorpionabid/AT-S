import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
}

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
  target_departments: string[];
  start_date: string;
  end_date: string;
  completion_threshold: number;
}

interface Survey extends SurveyData {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SurveyEditFormProps {
  surveyId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const SurveyEditForm: React.FC<SurveyEditFormProps> = ({ surveyId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<SurveyData>({
    title: '',
    description: '',
    survey_type: 'form',
    is_anonymous: false,
    allow_multiple_responses: false,
    structure: {
      sections: []
    },
    target_institutions: [],
    target_departments: [],
    start_date: '',
    end_date: '',
    completion_threshold: 80
  });

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const departmentOptions = [
    'maliyyə', 'təsərrüfat', 'təhsil', 'statistika', 
    'qiymətləndirmə', 'idarəetmə', 'insan resursları'
  ];

  const questionTypes = [
    { value: 'text', label: 'Qısa mətn' },
    { value: 'textarea', label: 'Uzun mətn' },
    { value: 'select', label: 'Açılan siyahı' },
    { value: 'radio', label: 'Tək seçim' },
    { value: 'checkbox', label: 'Çox seçim' },
    { value: 'number', label: 'Rəqəm' },
    { value: 'date', label: 'Tarix' },
    { value: 'rating', label: 'Qiymətləndirmə (1-5)' }
  ];

  useEffect(() => {
    fetchSurvey();
    fetchInstitutions();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/surveys/${surveyId}`);
      const surveyData = response.data.survey;
      setSurvey(surveyData);
      
      // Convert dates to datetime-local format
      const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().slice(0, 16);
      };

      setFormData({
        title: surveyData.title || '',
        description: surveyData.description || '',
        survey_type: surveyData.survey_type || 'form',
        is_anonymous: surveyData.is_anonymous || false,
        allow_multiple_responses: surveyData.allow_multiple_responses || false,
        structure: surveyData.structure || { sections: [] },
        target_institutions: surveyData.target_institutions || [],
        target_departments: surveyData.target_departments || [],
        start_date: formatDateTime(surveyData.start_date),
        end_date: formatDateTime(surveyData.end_date),
        completion_threshold: surveyData.completion_threshold || 80
      });
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || 'Sorğu məlumatları yüklənərkən xəta baş verdi'
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions?per_page=100');
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Institutions fetch error:', error);
    }
  };

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

  const handleInstitutionChange = (institutionId: number) => {
    setFormData(prev => ({
      ...prev,
      target_institutions: prev.target_institutions.includes(institutionId)
        ? prev.target_institutions.filter(id => id !== institutionId)
        : [...prev.target_institutions, institutionId]
    }));
  };

  const handleDepartmentChange = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      target_departments: prev.target_departments.includes(dept)
        ? prev.target_departments.filter(d => d !== dept)
        : [...prev.target_departments, dept]
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Sorğu başlığı mütləqdir';
    }

    if (formData.target_institutions.length === 0) {
      newErrors.target_institutions = 'Ən azı bir təşkilat seçilməlidir';
    }

    // Validate sections and questions
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

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'Bitmə tarixi başlama tarixindən sonra olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.put(`/surveys/${surveyId}`, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Sorğu yenilənərkən xəta baş verdi'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Sorğu məlumatları yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content survey-edit-modal">
        <div className="modal-header">
          <h2>Sorğunu Redaktə Et</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="survey-edit-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Əsas Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Sorğu Başlığı *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={errors.title ? 'error' : ''}
                  placeholder="Sorğu başlığını daxil edin"
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="survey_type">Sorğu Növü *</label>
                <select
                  id="survey_type"
                  name="survey_type"
                  value={formData.survey_type}
                  onChange={handleInputChange}
                  disabled={survey?.status === 'published'}
                >
                  <option value="form">Form</option>
                  <option value="poll">Sorğu</option>
                  <option value="assessment">Qiymətləndirmə</option>
                  <option value="feedback">Geri bildirim</option>
                </select>
                {survey?.status === 'published' && (
                  <small className="form-note">Dərc edilmiş sorğunun növü dəyişdirilə bilməz</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="completion_threshold">Tamamlanma məqsədi (%)</label>
                <input
                  type="number"
                  id="completion_threshold"
                  name="completion_threshold"
                  value={formData.completion_threshold}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Təsvir</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Sorğu haqqında əlavə məlumat"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="start_date">Başlama tarixi</label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_date">Bitmə tarixi</label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={errors.end_date ? 'error' : ''}
                />
                {errors.end_date && <span className="field-error">{errors.end_date}</span>}
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleInputChange}
                  disabled={survey?.status === 'published'}
                />
                <span className="checkbox-label">Anonim sorğu</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="allow_multiple_responses"
                  checked={formData.allow_multiple_responses}
                  onChange={handleInputChange}
                />
                <span className="checkbox-label">Çoxlu cavab verməyə icazə</span>
              </label>
            </div>
          </div>

          {/* Target Institutions */}
          <div className="form-section">
            <h3>Hədəf Təşkilatlar *</h3>
            <div className="checkbox-grid">
              {institutions.map(institution => (
                <label key={institution.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.target_institutions.includes(institution.id)}
                    onChange={() => handleInstitutionChange(institution.id)}
                  />
                  <span className="checkbox-label">
                    {institution.name} ({institution.type})
                  </span>
                </label>
              ))}
            </div>
            {errors.target_institutions && (
              <span className="field-error">{errors.target_institutions}</span>
            )}
          </div>

          {/* Target Departments */}
          <div className="form-section">
            <h3>Hədəf Departmentlər</h3>
            <div className="checkbox-grid">
              {departmentOptions.map(dept => (
                <label key={dept} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.target_departments.includes(dept)}
                    onChange={() => handleDepartmentChange(dept)}
                  />
                  <span className="checkbox-label">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Survey Structure */}
          <div className="form-section">
            <div className="section-header">
              <h3>Sorğu Strukturu</h3>
              <button
                type="button"
                onClick={addSection}
                className="btn-secondary small"
                disabled={survey?.status === 'published'}
              >
                ➕ Bölmə əlavə et
              </button>
            </div>

            {formData.structure.sections.map((section, sectionIndex) => (
              <div key={section.id} className="survey-section">
                <div className="section-header">
                  <h4>Bölmə {sectionIndex + 1}</h4>
                  {formData.structure.sections.length > 1 && survey?.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="btn-danger small"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Bölmə başlığı *</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                    className={errors[`section_${sectionIndex}_title`] ? 'error' : ''}
                    placeholder="Bölmə başlığı"
                    disabled={survey?.status === 'published'}
                  />
                  {errors[`section_${sectionIndex}_title`] && (
                    <span className="field-error">{errors[`section_${sectionIndex}_title`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Bölmə təsviri</label>
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                    rows={2}
                    placeholder="Bölmə haqqında qısa təsvir"
                    disabled={survey?.status === 'published'}
                  />
                </div>

                {/* Questions */}
                <div className="questions-container">
                  <div className="questions-header">
                    <h5>Suallar</h5>
                    <button
                      type="button"
                      onClick={() => addQuestion(sectionIndex)}
                      className="btn-secondary small"
                      disabled={survey?.status === 'published'}
                    >
                      ➕ Sual əlavə et
                    </button>
                  </div>

                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <span>Sual {questionIndex + 1}</span>
                        {section.questions.length > 1 && survey?.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            className="btn-danger small"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>Sual mətni *</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'question', e.target.value)}
                            className={errors[`question_${sectionIndex}_${questionIndex}`] ? 'error' : ''}
                            placeholder="Sualı daxil edin"
                            disabled={survey?.status === 'published'}
                          />
                          {errors[`question_${sectionIndex}_${questionIndex}`] && (
                            <span className="field-error">{errors[`question_${sectionIndex}_${questionIndex}`]}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Sual növü</label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                            disabled={survey?.status === 'published'}
                          >
                            {questionTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Placeholder mətn</label>
                        <input
                          type="text"
                          value={question.placeholder || ''}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'placeholder', e.target.value)}
                          placeholder="Cavab üçün göstəriş mətni"
                          disabled={survey?.status === 'published'}
                        />
                      </div>

                      <div className="checkbox-group">
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                            disabled={survey?.status === 'published'}
                          />
                          <span className="checkbox-label">Mütləq sual</span>
                        </label>
                      </div>

                      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                        <div className="form-group">
                          <label>Seçim variantları (hər sətirdə bir variant)</label>
                          <textarea
                            value={question.options?.join('\n') || ''}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'options', e.target.value.split('\n').filter(opt => opt.trim()))}
                            rows={3}
                            placeholder="Seçim 1&#10;Seçim 2&#10;Seçim 3"
                            disabled={survey?.status === 'published'}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Ləğv et
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Yenilənir...' : 'Dəyişiklikləri saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyEditForm;