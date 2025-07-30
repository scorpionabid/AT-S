import React from 'react';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  loading = false,
  error
}) => {
  return (
    <div className={`chart-card ${className}`}>
      {(title || subtitle || actions) && (
        <div className="chart-header">
          <div>
            {title && <h3 className="chart-title">{title}</h3>}
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      
      {error ? (
        <div className="dashboard-error">
          <div className="error-content">
            <div className="error-title">⚠️ Xəta baş verdi</div>
            <div className="error-message">{error}</div>
          </div>
        </div>
      ) : loading ? (
        <div className="dashboard-loading">
          <div>Yüklənir...</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ContentCard;