import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiX, 
  FiFilter, 
  FiBuilding, 
  FiMap, 
  FiLayers,
  FiCheck,
  FiUsers
} from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { 
  surveyTargetingService,
  type BulkSelectionOption
} from '../../services/surveyTargetingService';

interface BulkSelectionModalProps {
  onClose: () => void;
  onSelect: (institutionIds: number[]) => void;
}

const BulkSelectionModal: React.FC<BulkSelectionModalProps> = ({
  onClose,
  onSelect
}) => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'by_level' | 'by_type' | 'by_region'>('by_level');
  const [options, setOptions] = useState<BulkSelectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOptions();
  }, [activeTab]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const optionData = await surveyTargetingService.getBulkSelectionOptions(activeTab);
      setOptions(optionData);
      setSelectedOptions(new Set());
    } catch (error) {
      console.error('Error loading bulk options:', error);
      addToast(t('survey.targeting.bulkLoadError'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (optionKey: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionKey)) {
      newSelected.delete(optionKey);
    } else {
      newSelected.add(optionKey);
    }
    setSelectedOptions(newSelected);
  };

  const handleApplySelection = () => {
    const selectedInstitutions: number[] = [];
    
    selectedOptions.forEach(optionKey => {
      const option = options.find((opt, index) => getOptionKey(opt, index) === optionKey);
      if (option) {
        selectedInstitutions.push(...option.institutions);
      }
    });

    if (selectedInstitutions.length === 0) {
      addToast(t('survey.targeting.noSelectionError'), { variant: 'warning' });
      return;
    }

    onSelect(selectedInstitutions);
  };

  const getOptionKey = (option: BulkSelectionOption, index: number): string => {
    if (activeTab === 'by_level') {
      return `level_${option.level}`;
    } else if (activeTab === 'by_type') {
      return `type_${option.type}`;
    } else {
      return `region_${option.region_id}`;
    }
  };

  const getOptionLabel = (option: BulkSelectionOption): string => {
    if (activeTab === 'by_level') {
      const levelNames = {
        1: t('institutions.levels.1'),
        2: t('institutions.levels.2'),
        3: t('institutions.levels.3'),
        4: t('institutions.levels.4'),
        5: t('institutions.levels.5')
      };
      return levelNames[option.level as keyof typeof levelNames] || `Level ${option.level}`;
    } else if (activeTab === 'by_type') {
      const typeNames = {
        ministry: t('institutions.types.ministry'),
        region: t('institutions.types.region'),
        sektor: t('institutions.types.sektor'),
        school: t('institutions.types.school'),
        vocational: t('institutions.types.vocational'),
        university: t('institutions.types.university')
      };
      return typeNames[option.type as keyof typeof typeNames] || option.type || '';
    } else {
      return option.region_name || '';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'by_level': return <FiLayers className="h-4 w-4" />;
      case 'by_type': return <FiBuilding className="h-4 w-4" />;
      case 'by_region': return <FiMap className="h-4 w-4" />;
      default: return <FiFilter className="h-4 w-4" />;
    }
  };

  const getTotalSelected = (): number => {
    let total = 0;
    selectedOptions.forEach(optionKey => {
      const option = options.find((opt, index) => getOptionKey(opt, index) === optionKey);
      if (option) {
        total += option.count;
      }
    });
    return total;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-screen-lg sm:w-full">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FiFilter className="h-5 w-5 mr-2 text-blue-600" />
                  {t('survey.targeting.bulkSelection')}
                </CardTitle>
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Tab navigation */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: 'by_level', label: t('survey.targeting.byLevel') },
                    { key: 'by_type', label: t('survey.targeting.byType') },
                    { key: 'by_region', label: t('survey.targeting.byRegion') }
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
                      {getTabIcon(tab.key)}
                      <span className="ml-2">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3">{t('common.loading')}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selection summary */}
                  {selectedOptions.size > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <FiUsers className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">
                          {selectedOptions.size} {t('survey.targeting.groupsSelected')} • 
                          {getTotalSelected()} {t('survey.targeting.institutionsWillBeSelected')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Options list */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {options.length > 0 ? (
                      options.map((option, index) => {
                        const optionKey = getOptionKey(option, index);
                        const isSelected = selectedOptions.has(optionKey);
                        
                        return (
                          <div
                            key={optionKey}
                            onClick={() => toggleOption(optionKey)}
                            className={`
                              flex items-center justify-between p-4 border rounded-lg cursor-pointer
                              transition-colors hover:bg-gray-50
                              ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                            `}
                          >
                            <div className="flex items-center">
                              <div className="mr-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // Handled by parent div onClick
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <div className="font-medium text-gray-900">
                                  {getOptionLabel(option)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {option.count} {t('survey.targeting.institutions')}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-400">
                              {getTabIcon(activeTab)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FiBuilding className="h-8 w-8 mx-auto mb-2" />
                        <p>{t('survey.targeting.noOptionsAvailable')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            {/* Modal footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedOptions.size > 0 && (
                  <span>
                    {getTotalSelected()} {t('survey.targeting.institutionsSelected')}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  {t('common.cancel')}
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleApplySelection}
                  disabled={selectedOptions.size === 0}
                  leftIcon={<FiCheck />}
                >
                  {t('survey.targeting.applySelection')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkSelectionModal;