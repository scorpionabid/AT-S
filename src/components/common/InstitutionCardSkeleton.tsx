import React from 'react';

const InstitutionCardSkeleton: React.FC = () => {
  return (
    <div className="institution-card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-badges">
          <div className="skeleton-badge"></div>
          <div className="skeleton-badge"></div>
          <div className="skeleton-badge"></div>
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
        <div className="skeleton-stats">
          <div className="skeleton-stat"></div>
          <div className="skeleton-stat"></div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionCardSkeleton;