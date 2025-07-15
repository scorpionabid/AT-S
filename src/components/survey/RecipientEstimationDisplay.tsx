import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiUsers, 
  FiBuilding, 
  FiBarChart3,
  FiPieChart,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw
} from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { RecipientEstimation } from '../../services/surveyTargetingService';

interface RecipientEstimationDisplayProps {
  estimation: RecipientEstimation;
  loading?: boolean;
  className?: string;
}

const RecipientEstimationDisplay: React.FC<RecipientEstimationDisplayProps> = ({
  estimation,
  loading = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<'institutions' | 'roles' | null>('institutions');

  const toggleSection = (section: 'institutions' | 'roles') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-purple-100 text-purple-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelName = (level: number): string => {
    const levelNames = {
      1: t('institutions.levels.1'),
      2: t('institutions.levels.2'),
      3: t('institutions.levels.3'),
      4: t('institutions.levels.4'),
      5: t('institutions.levels.5')
    };
    return levelNames[level as keyof typeof levelNames] || `Level ${level}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FiBarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            {t('survey.targeting.estimationTitle')}
          </div>
          
          {loading && (
            <FiRefreshCw className="h-4 w-4 animate-spin text-gray-400" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {estimation.total_users.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">
              {t('survey.targeting.totalRecipients')}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FiBuilding className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {estimation.breakdown.summary.institutions}
            </div>
            <div className="text-sm text-green-700">
              {t('survey.targeting.institutions')}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FiPieChart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {estimation.breakdown.summary.user_types}
            </div>
            <div className="text-sm text-purple-700">
              {t('survey.targeting.userTypes')}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <FiBuilding className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {estimation.breakdown.summary.departments}
            </div>
            <div className="text-sm text-orange-700">
              {t('survey.targeting.departments')}
            </div>
          </div>
        </div>

        {/* Breakdown by Institution */}
        {estimation.breakdown.by_institution.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('institutions')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <FiBuilding className="h-5 w-5 mr-2 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {t('survey.targeting.breakdownByInstitution')}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({estimation.breakdown.by_institution.length} {t('survey.targeting.institutions')})
                </span>
              </div>
              
              {expandedSection === 'institutions' ? (
                <FiChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <FiChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSection === 'institutions' && (
              <div className="mt-3 space-y-2">
                {estimation.breakdown.by_institution
                  .sort((a, b) => b.estimated_users - a.estimated_users)
                  .map((institution, index) => (
                    <div
                      key={institution.institution_id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="mr-3">
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${getLevelColor(institution.institution_level)}
                          `}>
                            {getLevelName(institution.institution_level)}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {institution.institution_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {institution.institution_type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center ml-4">
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {institution.estimated_users.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t('survey.targeting.users')}
                          </div>
                        </div>
                        
                        <div className="ml-3 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (institution.estimated_users / Math.max(...estimation.breakdown.by_institution.map(i => i.estimated_users))) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Breakdown by Role */}
        {estimation.breakdown.by_role.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => toggleSection('roles')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <FiUsers className="h-5 w-5 mr-2 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {t('survey.targeting.breakdownByRole')}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({estimation.breakdown.by_role.length} {t('survey.targeting.roles')})
                </span>
              </div>
              
              {expandedSection === 'roles' ? (
                <FiChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <FiChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSection === 'roles' && (
              <div className="mt-3 space-y-2">
                {estimation.breakdown.by_role
                  .sort((a, b) => b.estimated_users - a.estimated_users)
                  .map((role, index) => {
                    const roleColors = [
                      'bg-blue-100 text-blue-800',
                      'bg-green-100 text-green-800',
                      'bg-purple-100 text-purple-800',
                      'bg-orange-100 text-orange-800',
                      'bg-pink-100 text-pink-800',
                      'bg-indigo-100 text-indigo-800'
                    ];
                    const colorClass = roleColors[index % roleColors.length];
                    
                    return (
                      <div
                        key={role.role_key}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3
                            ${colorClass}
                          `}>
                            {role.role_name}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div className="text-right mr-3">
                            <div className="font-medium text-gray-900">
                              {role.estimated_users.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {t('survey.targeting.users')}
                            </div>
                          </div>
                          
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (role.estimated_users / Math.max(...estimation.breakdown.by_role.map(r => r.estimated_users))) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Targeting Criteria Summary */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">
            {t('survey.targeting.criteriaSummary')}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('survey.targeting.institutions')}:</span>
              <span className="ml-1 font-medium">{estimation.criteria.institutions}</span>
            </div>
            
            <div>
              <span className="text-gray-600">{t('survey.targeting.departments')}:</span>
              <span className="ml-1 font-medium">{estimation.criteria.departments}</span>
            </div>
            
            <div>
              <span className="text-gray-600">{t('survey.targeting.userTypes')}:</span>
              <span className="ml-1 font-medium">{estimation.criteria.user_types}</span>
            </div>
            
            <div>
              <span className="text-gray-600">{t('survey.targeting.levels')}:</span>
              <span className="ml-1 font-medium">
                {estimation.criteria.institution_levels.length > 0 
                  ? estimation.criteria.institution_levels.join(', ')
                  : t('common.all')
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipientEstimationDisplay;