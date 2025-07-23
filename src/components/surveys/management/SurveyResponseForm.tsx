import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';

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

interface Survey {
  id: number;
  title: string;
  description: string;
  survey_type: string;
  is_anonymous: boolean;
  allow_multiple_responses: boolean;
  status: string;
  structure: {
    sections: Section[];
  };
  start_date?: string;
  end_date?: string;
  is_open_for_responses: boolean;
  has_expired: boolean;
}

interface SurveyResponse {
  [key: string]: any;
}

const SurveyResponseForm: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [surveyResponse, setSurveyResponse] = useState<any>(null);
  const [responses, setResponses] = useState<SurveyResponse>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  useEffect(() => {
    if (survey) {
      calculateProgress();
    }
  }, [responses, survey]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      
      // First load the survey
      const surveyResponse = await api.get(`/surveys/${surveyId}`);
      setSurvey(surveyResponse.data.survey);
      
      // Then start or get existing response
      const responseData = await api.post(`/surveys/${surveyId}/responses/start`);
      setSurveyResponse(responseData.data.response);
      
      // Load existing responses if any
      if (responseData.data.response.responses) {
        setResponses(responseData.data.response.responses);
      }
      
      logger.info('SurveyResponseForm', 'Survey and response loaded successfully', {
        surveyId: surveyResponse.data.survey.id,
        title: surveyResponse.data.survey.title,
        responseId: responseData.data.response.id,
        sectionsCount: surveyResponse.data.survey.structure.sections.length
      });
    } catch (error: any) {
      logger.error('SurveyResponseForm', 'Failed to load survey or start response', {
        surveyId,
        error: error.message
      });
      
      if (error.response?.status === 404) {
        navigate('/surveys');
      } else {
        setErrors({
          general: error.response?.data?.message || 'Failed to load survey'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!survey) return;
    
    const totalQuestions = survey.structure.sections.reduce(
      (total, section) => total + section.questions.length,
      0
    );
    
    const answeredQuestions = Object.keys(responses).length;
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    
    setProgress(Math.round(progressPercentage));
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
    
    // Auto-save after a delay
    if (surveyResponse) {
      debounceAutoSave();
    }
  };

  // Auto-save functionality
  const autoSaveRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const debounceAutoSave = () => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    
    autoSaveRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  const autoSave = async () => {
    if (!surveyResponse || submitting) return;
    
    try {
      await api.put(`/survey-responses/${surveyResponse.id}`, {
        responses,
        auto_submit: false
      });
      
      logger.info('SurveyResponseForm', 'Auto-saved survey response', {
        responseId: surveyResponse.id,
        responseCount: Object.keys(responses).length
      });
    } catch (error: any) {
      logger.warn('SurveyResponseForm', 'Auto-save failed', {
        error: error.message,
        responseId: surveyResponse.id
      });
    }
  };

  const validateCurrentSection = (): boolean => {
    if (!survey) return false;
    
    const section = survey.structure.sections[currentSection];
    const newErrors: { [key: string]: string } = {};
    
    section.questions.forEach(question => {
      if (question.required && !responses[question.id]) {
        newErrors[question.id] = 'Bu sahə məcburidir';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextSection = () => {
    if (validateCurrentSection()) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const prevSection = () => {
    setCurrentSection(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey || !surveyResponse) return;
    
    // Validate all sections
    const allErrors: { [key: string]: string } = {};
    
    survey.structure.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required && !responses[question.id]) {
          allErrors[question.id] = 'Bu sahə məcburidir';
        }
      });
    });
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Go to first section with errors
      for (let i = 0; i < survey.structure.sections.length; i++) {
        const section = survey.structure.sections[i];
        if (section.questions.some(q => allErrors[q.id])) {
          setCurrentSection(i);
          break;
        }
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      // First save the responses
      await api.put(`/survey-responses/${surveyResponse.id}`, {
        responses,
        auto_submit: false
      });
      
      // Then submit the response
      await api.post(`/survey-responses/${surveyResponse.id}/submit`);
      
      logger.info('SurveyResponseForm', 'Survey response submitted successfully', {
        surveyId: survey.id,
        responseId: surveyResponse.id,
        responseCount: Object.keys(responses).length
      });
      
      // Redirect to success page or surveys list
      navigate('/surveys', { 
        state: { 
          message: 'Survey response submitted successfully!',
          type: 'success' 
        } 
      });
      
    } catch (error: any) {
      logger.error('SurveyResponseForm', 'Failed to submit survey response', {
        error: error.message,
        surveyId: survey.id,
        responseId: surveyResponse?.id
      });
      
      setErrors({
        general: error.response?.data?.message || 'Response submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';
    const hasError = !!errors[question.id];
    
    const commonProps = {
      id: question.id,
      className: `question-input ${hasError ? 'error' : ''}`,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleResponseChange(question.id, e.target.value);
      },
      value,
      placeholder: question.placeholder
    };
    
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            {...commonProps}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
          />
        );
        
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Choose an option</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="radio-group">
            {question.options?.map((option, index) => (
              <label key={index} className="radio-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="checkbox-group">
            {question.options?.map((option, index) => (
              <label key={index} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, option]);
                    } else {
                      handleResponseChange(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        );
        
      case 'rating':
        return (
          <div className="rating-group">
            {[1, 2, 3, 4, 5].map(rating => (
              <label key={rating} className="rating-option">
                <input
                  type="radio"
                  name={question.id}
                  value={rating}
                  checked={value === rating.toString()}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                <span className="rating-star">★</span>
              </label>
            ))}
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            {...commonProps}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="survey-response-loading">
        <div className="loading-spinner"></div>
        <p>Loading survey...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="survey-response-error">
        <h2>Survey not found</h2>
        <p>The survey you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/surveys')}>
          Back to Surveys
        </button>
      </div>
    );
  }

  if (!survey.is_open_for_responses) {
    return (
      <div className="survey-response-closed">
        <h2>Survey Closed</h2>
        <p>This survey is not currently accepting responses.</p>
        <button onClick={() => navigate('/surveys')}>
          Back to Surveys
        </button>
      </div>
    );
  }

  if (survey.has_expired) {
    return (
      <div className="survey-response-expired">
        <h2>Survey Expired</h2>
        <p>This survey has expired and is no longer accepting responses.</p>
        <button onClick={() => navigate('/surveys')}>
          Back to Surveys
        </button>
      </div>
    );
  }

  const currentSectionData = survey.structure.sections[currentSection];
  const totalSections = survey.structure.sections.length;
  const isLastSection = currentSection === totalSections - 1;

  return (
    <div className="survey-response-form">
      <div className="survey-response-header">
        <h1>{survey.title}</h1>
        {survey.description && (
          <p className="survey-description">{survey.description}</p>
        )}
        
        <div className="survey-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
        
        <div className="section-indicator">
          Section {currentSection + 1} of {totalSections}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="survey-response-content">
        <div className="current-section">
          <h2 className="section-title">{currentSectionData.title}</h2>
          {currentSectionData.description && (
            <p className="section-description">{currentSectionData.description}</p>
          )}
          
          <div className="questions-container">
            {currentSectionData.questions.map((question, index) => (
              <div key={question.id} className="question-wrapper">
                <label className="question-label">
                  {question.question}
                  {question.required && <span className="required">*</span>}
                </label>
                
                {renderQuestion(question)}
                
                {errors[question.id] && (
                  <span className="error-message">{errors[question.id]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {errors.general && (
          <div className="general-error">
            {errors.general}
          </div>
        )}

        <div className="survey-navigation">
          <div className="nav-buttons">
            {currentSection > 0 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={prevSection}
              >
                Previous
              </button>
            )}
            
            {!isLastSection ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={nextSection}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            )}
          </div>
        </div>
      </form>

      <style jsx>{`
        .survey-response-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .survey-response-header {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .survey-response-header h1 {
          color: #2c3e50;
          margin: 0 0 15px 0;
          font-size: 2rem;
        }

        .survey-description {
          color: #6c757d;
          margin-bottom: 20px;
        }

        .survey-progress {
          margin-bottom: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }

        .section-indicator {
          color: #6c757d;
          font-size: 0.9rem;
          margin-top: 10px;
        }

        .current-section {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .section-title {
          color: #2c3e50;
          margin: 0 0 15px 0;
          font-size: 1.5rem;
        }

        .section-description {
          color: #6c757d;
          margin-bottom: 25px;
        }

        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .question-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .question-label {
          font-weight: 500;
          color: #2c3e50;
        }

        .required {
          color: #dc3545;
          margin-left: 4px;
        }

        .question-input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .question-input.error {
          border-color: #dc3545;
        }

        .question-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .radio-group, .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-option, .checkbox-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .rating-group {
          display: flex;
          gap: 5px;
        }

        .rating-option {
          cursor: pointer;
        }

        .rating-option input {
          display: none;
        }

        .rating-star {
          font-size: 1.5rem;
          color: #ddd;
          transition: color 0.2s;
        }

        .rating-option input:checked ~ .rating-star,
        .rating-option:hover .rating-star {
          color: #ffc107;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.9rem;
        }

        .general-error {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .survey-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
        }

        .nav-buttons {
          display: flex;
          gap: 15px;
          margin-left: auto;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #1e7e34;
        }

        .survey-response-loading,
        .survey-response-error,
        .survey-response-closed,
        .survey-response-expired {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SurveyResponseForm;