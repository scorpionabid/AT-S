import React from 'react';

interface SummaryCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
  }>;
  icon?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  items,
  icon,
  actionButton,
  className = ''
}) => {
  return (
    <div className={`summary-card ${className}`}>
      <div className="summary-header">
        {icon && <span className="summary-icon">{icon}</span>}
        <h3 className="summary-title">{title}</h3>
      </div>
      
      <div className="summary-content">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`summary-item ${item.highlight ? 'highlighted' : ''}`}
          >
            <span className="summary-label">{item.label}:</span>
            <span className="summary-value">{item.value}</span>
          </div>
        ))}
      </div>
      
      {actionButton && (
        <div className="summary-footer">
          <button 
            className="summary-action-btn"
            onClick={actionButton.onClick}
          >
            {actionButton.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;