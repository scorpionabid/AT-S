import React from 'react';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Axtar...',
  filters = [],
  actions,
  className = ''
}) => {
  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-bar-left">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              className="search-clear"
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>
        
        {filters.map((filter) => (
          <div key={filter.id} className="filter-dropdown">
            <label className="filter-label">{filter.label}:</label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="filter-select"
            >
              <option value="">Hamısı</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      
      {actions && (
        <div className="filter-bar-right">
          {actions}
        </div>
      )}
    </div>
  );
};

export default FilterBar;