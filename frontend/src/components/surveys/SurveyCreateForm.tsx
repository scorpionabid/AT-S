import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import SurveyTargetingForm from './targeting/SurveyTargetingForm';
import '../../styles/responsive-forms.css';



interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'rating';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface SurveyData {
  title: string;
  survey_type: 'form' | 'poll' | 'assessment' | 'feedback';
  is_anonymous: boolean;
  allow_multiple_responses: boolean;
  questions: Question[];
  target_institutions: number[];
  target_departments: number[];
  start_date: string;
  end_date: string;
}

interface SurveyCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
  isModal?: boolean;
}

const SurveyCreateForm: React.FC<SurveyCreateFormProps> = ({ onClose, onSuccess, isModal = true }) => {
  const [formData, setFormData] = useState<SurveyData>({
    title: '',
    survey_type: 'form',
    is_anonymous: false,
    allow_multiple_responses: false,
    questions: [{
      id: 'question-1',
      question: '',
      type: 'text',
      required: true,
      placeholder: ''
    }],
    target_institutions: [],
    target_departments: [],
    start_date: '',
    end_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      question: '',
      type: 'text',
      required: true,
      placeholder: ''
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionIndex: number) => {
    if (formData.questions.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const updateQuestion = (questionIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question
      )
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

    // Validate questions
    formData.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}`] = 'Sual mətni mütləqdir';
      }
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
    
    console.log('Survey form submitted', formData);
    
    if (!validateForm()) {
      console.log('Validation failed', errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Transform questions to backend expected format
      const backendData = {
        ...formData,
        structure: {
          sections: [{
            id: 'section-1',
            title: 'Əsas Bölmə',
            description: '',
            questions: formData.questions
          }]
        }
      };
      
      // Remove the questions field from root level
      delete (backendData as any).questions;
      
      console.log('Sending survey data:', backendData);
      const response = await api.post('/surveys', backendData);
      console.log('Survey created successfully:', response.data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Survey creation error:', error);
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

  return (
    <div className={isModal ? "modal-overlay" : "survey-create-container"}>
      <div className={isModal ? "modal-content survey-create-modal" : "survey-create-form"}>
        {isModal && (
          <div className="modal-header">
            <h2>Yeni Sorğu Yaradın</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>
        )}

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="survey-create-form">
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
                >
                  <option value="form">Form</option>
                  <option value="poll">Sorğu</option>
                  <option value="assessment">Qiymətləndirmə</option>
                  <option value="feedback">Geri bildirim</option>
                </select>
              </div>

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

          {/* Survey Questions */}
          <div className="form-section">
            <div className="section-header">
              <h3>Sorğu Sualları</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-secondary small"
              >
                ➕ Sual əlavə et
              </button>
            </div>

            {formData.questions.map((question, questionIndex) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <span>Sual {questionIndex + 1}</span>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
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
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      className={errors[`question_${questionIndex}`] ? 'error' : ''}
                      placeholder="Sualı daxil edin"
                    />
                    {errors[`question_${questionIndex}`] && (
                      <span className="field-error">{errors[`question_${questionIndex}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Sual növü</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Placeholder mətn</label>
                    <input
                      type="text"
                      value={question.placeholder || ''}
                      onChange={(e) => updateQuestion(questionIndex, 'placeholder', e.target.value)}
                      placeholder="Cavab üçün göstəriş mətni"
                    />
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(questionIndex, 'required', e.target.checked)}
                      />
                      <span className="checkbox-label">Mütləq sual</span>
                    </label>
                  </div>
                </div>

                {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                  <div className="form-group">
                    <label>Seçim variantları (hər sətirdə bir variant)</label>
                    <textarea
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => updateQuestion(questionIndex, 'options', e.target.value.split('\n').filter(opt => opt.trim()))}
                      rows={3}
                      placeholder="Seçim 1&#10;Seçim 2&#10;Seçim 3"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Advanced Survey Targeting */}
          <div className="form-section">
            <SurveyTargetingForm
              value={{ 
                target_institutions: formData.target_institutions, 
                target_departments: formData.target_departments 
              }}
              onChange={(criteria) => setFormData(prev => ({ 
                ...prev, 
                target_institutions: criteria.target_institutions || [],
                target_departments: criteria.target_departments || []
              }))}
            />
            {errors.target_institutions && (
              <span className="field-error">{errors.target_institutions}</span>
            )}
          </div>

          <div className={isModal ? "modal-footer" : "form-footer"}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Ləğv et
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Yaradılır...' : 'Sorğu yarat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyCreateForm;