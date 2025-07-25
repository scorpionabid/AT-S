import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiTarget, 
  FiUsers, 
 
  FiArrowRight,
  FiStar,
  FiPlay
} from 'react-icons/fi';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import type { TargetingPreset } from '../../../services/surveyTargetingService';

interface TargetingPresetsProps {
  presets: Record<string, TargetingPreset>;
  onApplyPreset: (presetKey: string) => void;
  loading?: boolean;
  className?: string;
}

const TargetingPresets: React.FC<TargetingPresetsProps> = ({
  presets,
  onApplyPreset,
  loading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  const getPresetIcon = (presetKey: string) => {
    switch (presetKey) {
      case 'all_teachers':
        return <FiUsers className="h-5 w-5 text-green-600" />;
      case 'all_admins':
        return <FiStar className="h-5 w-5 text-purple-600" />;
      case 'regional_schools':
        return <FiUsers className="h-5 w-5 text-blue-600" />;
      case 'sector_heads':
        return <FiTarget className="h-5 w-5 text-orange-600" />;
      case 'all_institutions':
        return <FiUsers className="h-5 w-5 text-gray-600" />;
      case 'ministry_level':
        return <FiStar className="h-5 w-5 text-red-600" />;
      default:
        return <FiTarget className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPresetBadgeColor = (presetKey: string): string => {
    switch (presetKey) {
      case 'all_teachers':
        return 'bg-green-100 text-green-800';
      case 'all_admins':
        return 'bg-purple-100 text-purple-800';
      case 'regional_schools':
        return 'bg-blue-100 text-blue-800';
      case 'sector_heads':
        return 'bg-orange-100 text-orange-800';
      case 'all_institutions':
        return 'bg-gray-100 text-gray-800';
      case 'ministry_level':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPresetDetails = (preset: TargetingPreset): string[] => {
    const details: string[] = [];
    
    if (preset.user_types && preset.user_types.length > 0) {
      details.push(`${preset.user_types.length} ${t('survey.targeting.userTypes')}`);
    }
    
    if (preset.institution_levels && preset.institution_levels.length > 0) {
      details.push(`${preset.institution_levels.length} ${t('survey.targeting.levels')}`);
    }
    
    if (preset.institutions === 'all') {
      details.push(t('survey.targeting.allInstitutions'));
    } else if (preset.institutions === 'accessible') {
      details.push(t('survey.targeting.accessibleInstitutions'));
    } else if (Array.isArray(preset.institutions)) {
      details.push(`${preset.institutions.length} ${t('survey.targeting.specificInstitutions')}`);
    }
    
    if (preset.departments && preset.departments.length > 0) {
      details.push(`${preset.departments.length} ${t('survey.targeting.departments')}`);
    }
    
    return details;
  };

  if (Object.keys(presets).length === 0) {
    return (
      <Card className={className}>
        <div className="p-8 text-center text-gray-500">
          <FiTarget className="h-8 w-8 mx-auto mb-3" />
          <p>{t('survey.targeting.noPresetsAvailable')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('survey.targeting.presetsTitle')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('survey.targeting.presetsDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(presets).map(([presetKey, preset]) => {
          const details = formatPresetDetails(preset);
          
          return (
            <Card
              key={presetKey}
              className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              hoverable
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getPresetIcon(presetKey)}
                    <h4 className="ml-3 text-sm font-medium text-gray-900">
                      {preset.name}
                    </h4>
                  </div>
                  
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${getPresetBadgeColor(presetKey)}
                  `}>
                    {t('survey.targeting.preset')}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {preset.description}
                </p>

                {/* Preset details */}
                {details.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {details.map((detail, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* User types preview */}
                {preset.user_types && preset.user_types.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                      {t('survey.targeting.targetedRoles')}:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {preset.user_types.slice(0, 3).map((userType, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {userType}
                        </span>
                      ))}
                      {preset.user_types.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{preset.user_types.length - 3} {t('common.more')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Institution levels preview */}
                {preset.institution_levels && preset.institution_levels.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                      {t('survey.targeting.targetedLevels')}:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {preset.institution_levels.map((level, index) => {
                        const levelNames = {
                          1: t('institutions.levels.1'),
                          2: t('institutions.levels.2'),
                          3: t('institutions.levels.3'),
                          4: t('institutions.levels.4'),
                          5: t('institutions.levels.5')
                        };
                        
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {levelNames[level as keyof typeof levelNames] || `Level ${level}`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Apply button */}
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => onApplyPreset(presetKey)}
                  isLoading={loading}
                  rightIcon={<FiPlay />}
                  className="mt-2"
                >
                  {t('survey.targeting.applyPreset')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Helper text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FiTarget className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              {t('survey.targeting.presetTip')}
            </h4>
            <p className="text-sm text-blue-700">
              {t('survey.targeting.presetTipDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetingPresets;