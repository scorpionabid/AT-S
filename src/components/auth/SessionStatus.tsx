import React, { useState } from 'react';
import { FiClock, FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';
import { useSession } from '../../contexts/SessionProvider';
import { formatSessionTime } from '../../utils/auth/sessionUtils';

interface SessionStatusProps {
  showInHeader?: boolean;
  compact?: boolean;
}

const SessionStatus: React.FC<SessionStatusProps> = ({ 
  showInHeader = false, 
  compact = false 
}) => {
  const { sessionTimeoutWarning, remainingTime, extendSession } = useSession();
  const isActive = !sessionTimeoutWarning;
  const timeLeft = Math.ceil(remainingTime / (1000 * 60)); // Convert to minutes
  const [isExtending, setIsExtending] = useState(false);

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      await extendSession();
    } finally {
      setIsExtending(false);
    }
  };

  const getStatusColor = () => {
    if (!isActive) return '#dc3545'; // Red
    if (timeLeft <= 5) return '#ffc107'; // Yellow
    if (timeLeft <= 30) return '#fd7e14'; // Orange
    return '#28a745'; // Green
  };

  const getStatusIcon = () => {
    if (!isActive) return <FiWifiOff size={16} />;
    if (timeLeft <= 5) return <FiClock size={16} />;
    return <FiWifi size={16} />;
  };

  const getStatusText = () => {
    if (!isActive) return 'Offline';
    if (timeLeft <= 0) return 'Expired';
    return formatSessionTime(timeLeft);
  };

  if (compact) {
    return (
      <div className="session-status-compact">
        <div 
          className="session-status-indicator"
          style={{ color: getStatusColor() }}
          title={`Session: ${getStatusText()}`}
        >
          {getStatusIcon()}
        </div>
      </div>
    );
  }

  return (
    <div className={`session-status ${showInHeader ? 'header-style' : ''}`}>
      <div className="session-status-info">
        <div 
          className="session-status-indicator"
          style={{ color: getStatusColor() }}
        >
          {getStatusIcon()}
        </div>
        
        <div className="session-status-text">
          <span className="session-status-label">Session:</span>
          <span 
            className="session-status-time"
            style={{ color: getStatusColor() }}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      {isActive && timeLeft > 0 && (
        <button
          className="session-extend-btn"
          onClick={handleExtend}
          disabled={isExtending}
          title="Extend session"
        >
          <FiRefreshCw size={14} className={isExtending ? 'spinning' : ''} />
        </button>
      )}

      <style jsx>{`
        .session-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          font-size: 12px;
        }

        .session-status.header-style {
          background: transparent;
          border: none;
          padding: 4px 8px;
        }

        .session-status-compact {
          display: flex;
          align-items: center;
          padding: 4px;
        }

        .session-status-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .session-status-indicator {
          display: flex;
          align-items: center;
          animation: pulse 2s infinite;
        }

        .session-status-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .session-status-label {
          color: #6c757d;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .session-status-time {
          font-weight: 600;
          font-size: 12px;
        }

        .session-extend-btn {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .session-extend-btn:hover {
          background: #e9ecef;
          color: #495057;
        }

        .session-extend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SessionStatus;