import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiUsers, 
  FiBuilding, 
  FiTarget, 
  FiFilter,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { 
  surveyTargetingService,
  type EstimationCriteria,
  type RecipientEstimation,
  type TargetingOptions,
  type TargetingValidation,
  Institution
} from '../../services/surveyTargetingService';
import InstitutionTreeSelector from './InstitutionTreeSelector';
import BulkSelectionModal from './BulkSelectionModal';
import TargetingPresets from './TargetingPresets';
import RecipientEstimationDisplay from './RecipientEstimationDisplay';

interface SurveyTargetingFormProps {
  value: EstimationCriteria;
  onChange: (criteria: EstimationCriteria) => void;
  onValidation?: (validation: TargetingValidation) => void;
  className?: string;
}

const SurveyTargetingForm: React.FC<SurveyTargetingFormProps> = ({
  value,
  onChange,
  onValidation,
  className = ''
}) => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // State management
  const [targetingOptions, setTargetingOptions] = useState<TargetingOptions | null>(null);
  const [estimation, setEstimation] = useState<RecipientEstimation | null>(null);
  const [validation, setValidation] = useState<TargetingValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'institutions' | 'departments' | 'user_types' | 'presets'>('institutions');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [expandedInstitutions, setExpandedInstitutions] = useState<Set<number>>(new Set());

  // Load targeting options on mount
  useEffect(() => {
    loadTargetingOptions();
  }, []);

  // Auto-estimate when criteria changes
  useEffect(() => {
    if (Object.keys(value).length > 0) {
      debounceEstimation();
    }
  }, [value]);

  const loadTargetingOptions = async () => {
    try {
      setLoading(true);
      const options = await surveyTargetingService.getTargetingOptions();
      setTargetingOptions(options);
    } catch (error) {
      console.error('Error loading targeting options:', error);
      addToast(t('survey.targeting.loadError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Debounced estimation to avoid too many API calls
  const debounceEstimation = useCallback(
    debounce(async () => {
      await estimateRecipients();
    }, 500),
    [value]
  );

  const estimateRecipients = async () => {
    if (!value || Object.keys(value).length === 0) {
      setEstimation(null);
      setValidation(null);
      return;
    }

    try {
      setEstimating(true);
      
      // Get both estimation and validation
      const [estimationResult, validationResult] = await Promise.all([
        surveyTargetingService.estimateRecipients(value),
        surveyTargetingService.validateTargeting(value)
      ]);

      setEstimation(estimationResult);
      setValidation(validationResult);
      onValidation?.(validationResult);

    } catch (error) {
      console.error('Error estimating recipients:', error);
      addToast(t('survey.targeting.estimationError'), { variant: 'error' });
    } finally {
      setEstimating(false);
    }
  };

  const handleInstitutionSelectionChange = (selectedIds: number[]) => {
    onChange({
      ...value,
      target_institutions: selectedIds
    });
  };

  const handleDepartmentSelectionChange = (selectedIds: number[]) => {
    onChange({
      ...value,
      target_departments: selectedIds
    });
  };

  const handleUserTypeSelectionChange = (selectedTypes: string[]) => {
    onChange({
      ...value,
      target_user_types: selectedTypes
    });
  };

  const handleLevelSelectionChange = (selectedLevels: number[]) => {
    onChange({
      ...value,
      institution_levels: selectedLevels
    });
  };

  const handlePresetApply = async (presetKey: string) => {
    try {
      setLoading(true);
      const presetCriteria = await surveyTargetingService.applyPreset(presetKey);
      onChange(presetCriteria);
      addToast(t('survey.targeting.presetApplied'), { variant: 'success' });
    } catch (error) {
      console.error('Error applying preset:', error);
      addToast(t('survey.targeting.presetError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSelection = (institutionIds: number[]) => {
    const currentIds = value.target_institutions || [];
    const newIds = [...new Set([...currentIds, ...institutionIds])];
    
    onChange({
      ...value,
      target_institutions: newIds
    });
    
    setShowBulkModal(false);
  };

  const clearSelection = () => {
    onChange({});
    setEstimation(null);
    setValidation(null);
  };

  if (loading && !targetingOptions) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <FiRefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>{t('common.loading')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with validation status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FiTarget className="h-5 w-5 mr-2 text-blue-600" />
              {t('survey.targeting.title')}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {validation && (
                <div className="flex items-center space-x-2">
                  {validation.is_valid ? (
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{t('survey.targeting.valid')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <FiAlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{t('survey.targeting.invalid')}</span>
                    </div>
                  )}
                </div>
              )}
              
              {estimation && (
                <div className="flex items-center text-blue-600">
                  <FiUsers className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {estimation.total_users} {t('survey.targeting.recipients')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Validation messages */}
          {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="mt-4 space-y-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center text-red-600 text-sm">
                  <FiAlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              ))}
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-center text-yellow-600 text-sm">
                  <FiInfo className="h-4 w-4 mr-2 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {/* Action buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkModal(true)}
                leftIcon={<FiFilter />}
              >
                {t('survey.targeting.bulkSelect')}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={estimateRecipients}
                isLoading={estimating}
                leftIcon={<FiRefreshCw />}
              >
                {t('survey.targeting.refresh')}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={Object.keys(value).length === 0}
            >
              {t('survey.targeting.clearAll')}
            </Button>
          </div>

          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'institutions', label: t('survey.targeting.institutions'), icon: FiBuilding },
                { key: 'departments', label: t('survey.targeting.departments'), icon: FiBuilding },
                { key: 'user_types', label: t('survey.targeting.userTypes'), icon: FiUsers },
                { key: 'presets', label: t('survey.targeting.presets'), icon: FiTarget }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="min-h-[400px]">
            {activeTab === 'institutions' && targetingOptions && (
              <InstitutionTreeSelector
                institutions={targetingOptions.institutions}
                selectedIds={value.target_institutions || []}
                onSelectionChange={handleInstitutionSelectionChange}
                selectedLevels={value.institution_levels || []}
                onLevelSelectionChange={handleLevelSelectionChange}
                expandedInstitutions={expandedInstitutions}
                onExpandedChange={setExpandedInstitutions}
              />
            )}

            {activeTab === 'departments' && targetingOptions && (
              <DepartmentSelector
                departments={targetingOptions.departments}
                selectedIds={value.target_departments || []}
                onSelectionChange={handleDepartmentSelectionChange}
                selectedInstitutions={value.target_institutions || []}
              />
            )}

            {activeTab === 'user_types' && targetingOptions && (
              <UserTypeSelector
                userTypes={targetingOptions.user_types}
                selectedTypes={value.target_user_types || []}
                onSelectionChange={handleUserTypeSelectionChange}
              />
            )}

            {activeTab === 'presets' && targetingOptions && (
              <TargetingPresets
                presets={targetingOptions.targeting_presets}
                onApplyPreset={handlePresetApply}
                loading={loading}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recipient estimation display */}
      {estimation && (
        <RecipientEstimationDisplay
          estimation={estimation}
          loading={estimating}
        />
      )}

      {/* Bulk selection modal */}
      {showBulkModal && (
        <BulkSelectionModal
          onClose={() => setShowBulkModal(false)}
          onSelect={handleBulkSelection}
        />
      )}
    </div>
  );
};

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

// Placeholder components (will be implemented separately)
const DepartmentSelector: React.FC<{
  departments: any[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  selectedInstitutions: number[];
}> = ({ departments, selectedIds, onSelectionChange, selectedInstitutions }) => {
  // Filter departments based on selected institutions
  const filteredDepartments = selectedInstitutions.length > 0
    ? departments.filter(dept => selectedInstitutions.includes(dept.institution_id))
    : departments;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {filteredDepartments.length} departments available
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => (
          <label key={dept.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedIds.includes(dept.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectionChange([...selectedIds, dept.id]);
                } else {
                  onSelectionChange(selectedIds.filter(id => id !== dept.id));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{dept.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const UserTypeSelector: React.FC<{
  userTypes: Record<string, string>;
  selectedTypes: string[];
  onSelectionChange: (types: string[]) => void;
}> = ({ userTypes, selectedTypes, onSelectionChange }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Select user types to target
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(userTypes).map(([key, name]) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTypes.includes(key)}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectionChange([...selectedTypes, key]);
                } else {
                  onSelectionChange(selectedTypes.filter(type => type !== key));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SurveyTargetingForm;