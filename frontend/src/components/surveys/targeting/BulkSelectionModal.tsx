import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiFilter, 
  FiMap, 
  FiLayers,
  FiCheck,
  FiUsers
} from 'react-icons/fi';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/ModalUnified';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { 
  surveyTargetingService,
  type BulkSelectionOption
} from '../../../services/surveyTargetingService';

interface BulkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (institutionIds: number[]) => void;
}

const BulkSelectionModal: React.FC<BulkSelectionModalProps> = ({
  isOpen,
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
      case 'by_type': return <FiLayers className="h-4 w-4" />;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('survey.targeting.bulkSelection')}
      size="lg"
      className="bulk-selection-modal"
    >
      <ModalBody className="p-0">
        {/* Tab navigation */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <nav className="flex space-x-8">
            {[
              { key: 'by_level', label: t('survey.targeting.byLevel') },
              { key: 'by_type', label: t('survey.targeting.byType') },
              { key: 'by_region', label: t('survey.targeting.byRegion') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  btn-base btn-ghost btn-sm flex items-center gap-2
                  ${activeTab === tab.key ? 'btn-primary' : ''}
                `}
              >
                {getTabIcon(tab.key)}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-3">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selection summary */}
              {selectedOptions.size > 0 && (
                <div className="alert-base alert-info">
                  <FiUsers className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {selectedOptions.size} {t('survey.targeting.groupsSelected')} • 
                    {getTotalSelected()} {t('survey.targeting.institutionsWillBeSelected')}
                  </span>
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
                          card-base card-sm cursor-pointer transition-all
                          ${isSelected ? 'card-success' : 'hover:shadow-md'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent div onClick
                                className="input-base w-4 h-4"
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
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiLayers className="h-8 w-8 mx-auto mb-2" />
                    <p>{t('survey.targeting.noOptionsAvailable')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-600">
            {selectedOptions.size > 0 && (
              <span>
                {getTotalSelected()} {t('survey.targeting.institutionsSelected')}
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              className="btn-base btn-secondary"
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            
            <button
              className="btn-base btn-primary"
              onClick={handleApplySelection}
              disabled={selectedOptions.size === 0}
            >
              <FiCheck className="w-4 h-4 mr-2" />
              {t('survey.targeting.applySelection')}
            </button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default BulkSelectionModal;