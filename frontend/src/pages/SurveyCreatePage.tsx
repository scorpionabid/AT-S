import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyCreateForm from '../components/surveys/SurveyCreateForm';
import { Icon } from '../components/common/IconSystem';
import '../styles/surveys.css';

const SurveyCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    navigate('/surveys');
  };

  const handleSuccess = () => {
    setIsCreating(false);
    navigate('/surveys');
  };

  return (
    <div className="survey-create-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <button 
              onClick={handleClose}
              className="back-button"
              title="Geri"
            >
              <Icon type="ARROW_LEFT" />
            </button>
            <h1 className="page-title">
              <Icon type="SURVEY" />
              Yeni Sorğu Yarat
            </h1>
          </div>
          <p className="page-description">
            Yeni sorğu yaradın və cavabçılara göndərin
          </p>
        </div>
      </div>

      <div className="survey-create-container">
        <SurveyCreateForm 
          onClose={handleClose}
          onSuccess={handleSuccess}
          isModal={false}
        />
      </div>
    </div>
  );
};

export default SurveyCreatePage;