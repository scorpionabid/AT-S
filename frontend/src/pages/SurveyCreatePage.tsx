import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyCreateForm from '../components/surveys/SurveyCreateForm';
import { Icon } from '../components/common/IconSystem';

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
    <div className="p-6">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-left">
            <h1 className="page-header-title flex items-center gap-3">
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1"
                title="Geri"
              >
                <Icon type="ARROW_LEFT" />
              </button>
              <Icon type="SURVEY" />
              Yeni Sorğu Yarat
            </h1>
            <p className="page-header-subtitle">
              Yeni sorğu yaradın və cavabçılara göndərin
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
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