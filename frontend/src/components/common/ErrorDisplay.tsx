import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'network' | 'permission';
  title?: string;
  showIcon?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  onDismiss,
  type = 'error',
  title,
  showIcon = true
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: '🌐',
          title: title || 'Şəbəkə Xətası',
          className: 'error-network',
          description: 'Internet bağlantısını yoxlayın və yenidən cəhd edin'
        };
      case 'permission':
        return {
          icon: '🔒',
          title: title || 'İcazə Xətası',
          className: 'error-permission',
          description: 'Bu əməliyyat üçün kifayət qədər icazəniz yoxdur'
        };
      case 'warning':
        return {
          icon: '⚠️',
          title: title || 'Diqqət',
          className: 'error-warning',
          description: ''
        };
      default:
        return {
          icon: '❌',
          title: title || 'Xəta Baş Verdi',
          className: 'error-default',
          description: 'Əməliyyat tamamlana bilmədi'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className={`error-display ${config.className}`}>
      <div className="error-content">
        {showIcon && (
          <div className="error-icon">
            {config.icon}
          </div>
        )}
        
        <div className="error-text">
          <h3 className="error-title">{config.title}</h3>
          <p className="error-message">{message}</p>
          {config.description && (
            <p className="error-description">{config.description}</p>
          )}
        </div>
      </div>

      <div className="error-actions">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="error-button retry"
          >
            🔄 Yenidən Cəhd Et
          </button>
        )}
        
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="error-button dismiss"
          >
            ✕ Bağla
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;