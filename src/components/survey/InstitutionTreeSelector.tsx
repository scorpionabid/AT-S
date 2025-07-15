import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiChevronRight, 
  FiChevronDown, 
  FiBuilding, 
  FiHome,
  FiCheck,
  FiMinus,
  FiFilter
} from 'react-icons/fi';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Institution } from '../../services/surveyTargetingService';

interface InstitutionTreeSelectorProps {
  institutions: Institution[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  selectedLevels: number[];
  onLevelSelectionChange: (selectedLevels: number[]) => void;
  expandedInstitutions: Set<number>;
  onExpandedChange: (expanded: Set<number>) => void;
  className?: string;
}

const InstitutionTreeSelector: React.FC<InstitutionTreeSelectorProps> = ({
  institutions,
  selectedIds,
  onSelectionChange,
  selectedLevels,
  onLevelSelectionChange,
  expandedInstitutions,
  onExpandedChange,
  className = ''
}) => {
  const { t } = useTranslation();
  
  // Build tree structure
  const institutionTree = useMemo(() => {
    const institutionMap = new Map<number, Institution & { children: Institution[] }>();
    
    // Initialize all institutions in the map
    institutions.forEach(inst => {
      institutionMap.set(inst.id, { ...inst, children: [] });
    });
    
    // Build parent-child relationships
    const rootInstitutions: (Institution & { children: Institution[] })[] = [];
    
    institutions.forEach(inst => {
      const institutionWithChildren = institutionMap.get(inst.id)!;
      
      if (inst.parent_id && institutionMap.has(inst.parent_id)) {
        institutionMap.get(inst.parent_id)!.children.push(institutionWithChildren);
      } else {
        rootInstitutions.push(institutionWithChildren);
      }
    });
    
    return rootInstitutions;
  }, [institutions]);

  // Get level statistics
  const levelStats = useMemo(() => {
    const stats = new Map<number, { count: number; selected: number; institutions: number[] }>();
    
    institutions.forEach(inst => {
      if (!stats.has(inst.level)) {
        stats.set(inst.level, { count: 0, selected: 0, institutions: [] });
      }
      
      const levelData = stats.get(inst.level)!;
      levelData.count++;
      levelData.institutions.push(inst.id);
      
      if (selectedIds.includes(inst.id)) {
        levelData.selected++;
      }
    });
    
    return Array.from(stats.entries())
      .map(([level, data]) => ({
        level,
        ...data,
        isFullySelected: data.selected === data.count,
        isPartiallySelected: data.selected > 0 && data.selected < data.count
      }))
      .sort((a, b) => a.level - b.level);
  }, [institutions, selectedIds]);

  const levelNames = {
    1: t('institutions.levels.1'),
    2: t('institutions.levels.2'),
    3: t('institutions.levels.3'),
    4: t('institutions.levels.4'),
    5: t('institutions.levels.5')
  };

  const getInstitutionIcon = (institution: Institution) => {
    switch (institution.level) {
      case 1: return <FiHome className="h-4 w-4 text-purple-600" />;
      case 2: return <FiBuilding className="h-4 w-4 text-blue-600" />;
      case 3: return <FiBuilding className="h-4 w-4 text-green-600" />;
      case 4: return <FiBuilding className="h-4 w-4 text-orange-600" />;
      default: return <FiBuilding className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleExpanded = (institutionId: number) => {
    const newExpanded = new Set(expandedInstitutions);
    if (newExpanded.has(institutionId)) {
      newExpanded.delete(institutionId);
    } else {
      newExpanded.add(institutionId);
    }
    onExpandedChange(newExpanded);
  };

  const toggleInstitutionSelection = (institutionId: number) => {
    if (selectedIds.includes(institutionId)) {
      onSelectionChange(selectedIds.filter(id => id !== institutionId));
    } else {
      onSelectionChange([...selectedIds, institutionId]);
    }
  };

  const selectAllInLevel = (level: number) => {
    const levelInstitutions = institutions
      .filter(inst => inst.level === level)
      .map(inst => inst.id);
    
    const newSelected = [...new Set([...selectedIds, ...levelInstitutions])];
    onSelectionChange(newSelected);
  };

  const deselectAllInLevel = (level: number) => {
    const levelInstitutions = institutions
      .filter(inst => inst.level === level)
      .map(inst => inst.id);
    
    const newSelected = selectedIds.filter(id => !levelInstitutions.includes(id));
    onSelectionChange(newSelected);
  };

  const selectAllChildren = (institution: Institution & { children: Institution[] }) => {
    const getAllChildIds = (inst: Institution & { children: Institution[] }): number[] => {
      const childIds = [inst.id];
      inst.children.forEach(child => {
        childIds.push(...getAllChildIds(child));
      });
      return childIds;
    };

    const childIds = getAllChildIds(institution);
    const newSelected = [...new Set([...selectedIds, ...childIds])];
    onSelectionChange(newSelected);
  };

  const expandAll = () => {
    const allIds = new Set(institutions.map(inst => inst.id));
    onExpandedChange(allIds);
  };

  const collapseAll = () => {
    onExpandedChange(new Set());
  };

  const renderInstitution = (
    institution: Institution & { children: Institution[] },
    depth: number = 0
  ) => {
    const isSelected = selectedIds.includes(institution.id);
    const isExpanded = expandedInstitutions.has(institution.id);
    const hasChildren = institution.children.length > 0;
    
    // Check if all children are selected
    const allChildrenSelected = hasChildren && institution.children.every(child => 
      selectedIds.includes(child.id)
    );
    
    // Check if some children are selected
    const someChildrenSelected = hasChildren && institution.children.some(child => 
      selectedIds.includes(child.id)
    );

    return (
      <div key={institution.id} className="space-y-1">
        <div 
          className={`
            flex items-center py-2 px-3 rounded-md cursor-pointer
            hover:bg-gray-50 transition-colors
            ${isSelected ? 'bg-blue-50 border border-blue-200' : ''}
            ${depth > 0 ? 'ml-' + (depth * 4) : ''}
          `}
          style={{ marginLeft: depth * 20 }}
        >
          {/* Expand/collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(institution.id)}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <FiChevronDown className="h-4 w-4" />
              ) : (
                <FiChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-6" />}

          {/* Selection checkbox */}
          <div className="mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = !isSelected && someChildrenSelected;
                }
              }}
              onChange={() => toggleInstitutionSelection(institution.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Institution icon and name */}
          <div className="flex items-center flex-1 min-w-0">
            {getInstitutionIcon(institution)}
            <div className="ml-2 flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {institution.name}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({institution.code})
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {levelNames[institution.level as keyof typeof levelNames]} • {institution.type}
              </div>
            </div>
          </div>

          {/* Quick select children button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (allChildrenSelected) {
                  // Deselect all children
                  const getAllChildIds = (inst: Institution & { children: Institution[] }): number[] => {
                    const childIds = [inst.id];
                    inst.children.forEach(child => {
                      childIds.push(...getAllChildIds(child));
                    });
                    return childIds;
                  };
                  const childIds = getAllChildIds(institution);
                  const newSelected = selectedIds.filter(id => !childIds.includes(id));
                  onSelectionChange(newSelected);
                } else {
                  selectAllChildren(institution);
                }
              }}
              className="ml-2"
              title={allChildrenSelected ? "Deselect all children" : "Select all children"}
            >
              {allChildrenSelected ? (
                <FiMinus className="h-3 w-3" />
              ) : (
                <FiCheck className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {institution.children.map(child => 
              renderInstitution(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level-based selection */}
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t('survey.targeting.selectByLevel')}
          </h3>
          
          <div className="space-y-2">
            {levelStats.map(({ level, count, selected, isFullySelected, isPartiallySelected, institutions: levelInstitutions }) => (
              <div key={level} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    {levelNames[level as keyof typeof levelNames]}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({selected}/{count} {t('common.selected')})
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectAllInLevel(level)}
                    disabled={isFullySelected}
                  >
                    {t('common.selectAll')}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deselectAllInLevel(level)}
                    disabled={selected === 0}
                  >
                    {t('common.clear')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tree view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {selectedIds.length} / {institutions.length} {t('common.selected')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            {t('survey.targeting.expandAll')}
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            {t('survey.targeting.collapseAll')}
          </Button>
        </div>
      </div>

      {/* Institution tree */}
      <Card>
        <div className="p-4">
          <div className="max-h-96 overflow-y-auto">
            {institutionTree.length > 0 ? (
              <div className="space-y-1">
                {institutionTree.map(institution => 
                  renderInstitution(institution)
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiBuilding className="h-8 w-8 mx-auto mb-2" />
                <p>{t('survey.targeting.noInstitutions')}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InstitutionTreeSelector;