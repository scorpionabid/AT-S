import React, { useState, useEffect } from 'react';
import { FiClock, FiX, FiRefreshCw, FiLogOut, FiAlertTriangle } from 'react-icons/fi';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';

interface SessionTimeoutWarningProps {
  onExtend?: () => void;
  onLogout?: () => void;
  onDismiss?: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  onExtend,
  onLogout,
  onDismiss
}) => {
  const {
    showWarning,
    timeRemaining,
    isExtending,
    extendSession
  } = useSessionTimeout();

  const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Update countdown based on time remaining
  useEffect(() => {
    if (showWarning && timeRemaining > 0) {
      setCountdown(timeRemaining * 60); // Convert minutes to seconds
      setIsDismissed(false);
    }
  }, [showWarning, timeRemaining]);

  // Countdown timer
  useEffect(() => {
    if (!showWarning || isDismissed || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, isDismissed, countdown]);

  const handleExtend = async () => {
    try {
      await extendSession();
      setIsDismissed(true);
      if (onExtend) {
        onExtend();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgencyColor = (seconds: number): string => {
    if (seconds <= 60) return '#dc3545'; // Red - very urgent
    if (seconds <= 180) return '#fd7e14'; // Orange - urgent
    return '#ffc107'; // Yellow - warning
  };

  if (!showWarning || isDismissed) return null;

  return (
    <div className="session-timeout-overlay">
      <div className="session-timeout-modal">
        <div className="session-timeout-header">
          <div className="session-timeout-icon" style={{ color: getUrgencyColor(countdown) }}>
            {countdown <= 60 ? <FiAlertTriangle size={24} /> : <FiClock size={24} />}
          </div>
          <h3>Sessiya Bitmək Üzrədir</h3>
          <button 
            className="session-timeout-close"
            onClick={handleDismiss}
            aria-label="Close warning"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="session-timeout-content">
          <p>
            Sizin sessiyanız <strong>{formatTime(countdown)}</strong> ərzində bitəcək.
          </p>
          
          <div className="session-timeout-countdown">
            <div 
              className="countdown-circle"
              style={{ borderColor: getUrgencyColor(countdown) }}
            >
              <div 
                className="countdown-number"
                style={{ color: getUrgencyColor(countdown) }}
              >
                {formatTime(countdown)}
              </div>
              <div 
                className="countdown-label"
                style={{ color: getUrgencyColor(countdown) }}
              >
                qalıb
              </div>
            </div>
            <p>Avtomatik çıxışa qədər</p>
          </div>

          <div className="session-timeout-actions">
            <button 
              className="btn btn-primary"
              onClick={handleExtend}
              disabled={isExtending}
            >
              <FiRefreshCw size={16} className={isExtending ? 'spinning' : ''} />
              {isExtending ? 'Uzadılır...' : 'Sessiyamı Uzat'}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => onLogout?.()}
            >
              <FiLogOut size={16} />
              İndi Çıx
            </button>
          </div>
        </div>

        <div className="session-timeout-footer">
          <p>
            Fəaliyyətsizlik səbəbindən təhlükəsizlik məqsədilə avtomatik çıxış ediləcək.
          </p>
        </div>
      </div>

      <style jsx>{`
        .session-timeout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .session-timeout-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          max-width: 420px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-30px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .session-timeout-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid #eee;
          position: relative;
        }

        .session-timeout-icon {
          background: rgba(255, 193, 7, 0.1);
          padding: 10px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .session-timeout-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
          flex: 1;
        }

        .session-timeout-close {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .session-timeout-close:hover {
          background: #f5f5f5;
          color: #333;
        }

        .session-timeout-content {
          padding: 24px;
          text-align: center;
        }

        .session-timeout-content p {
          margin: 0 0 24px 0;
          color: #666;
          line-height: 1.6;
          font-size: 15px;
        }

        .session-timeout-countdown {
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .countdown-circle {
          width: 100px;
          height: 100px;
          border: 4px solid;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
          background: rgba(255, 255, 255, 0.8);
        }

        @keyframes pulse {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
          }
          100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
          }
        }

        .countdown-number {
          font-size: 18px;
          font-weight: bold;
          line-height: 1;
          font-family: 'Courier New', monospace;
        }

        .countdown-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .session-timeout-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 140px;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .session-timeout-footer {
          padding: 16px 20px;
          background: #f8f9fa;
          border-top: 1px solid #eee;
          border-radius: 0 0 12px 12px;
        }

        .session-timeout-footer p {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
          text-align: center;
          line-height: 1.4;
        }

        @media (max-width: 480px) {
          .session-timeout-modal {
            width: 95%;
            margin: 10px;
          }
          
          .session-timeout-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }

          .session-timeout-content {
            padding: 20px;
          }

          .countdown-circle {
            width: 80px;
            height: 80px;
          }

          .countdown-number {
            font-size: 16px;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .session-timeout-modal {
            background: #2d3748;
            color: #e2e8f0;
          }

          .session-timeout-header {
            border-bottom-color: #4a5568;
          }

          .session-timeout-header h3 {
            color: #e2e8f0;
          }

          .session-timeout-content p {
            color: #cbd5e0;
          }

          .session-timeout-footer {
            background: #1a202c;
            border-top-color: #4a5568;
          }

          .session-timeout-footer p {
            color: #a0aec0;
          }

          .session-timeout-close:hover {
            background: #4a5568;
            color: #e2e8f0;
          }
        }
      `}</style>
    </div>
  );
};

export default SessionTimeoutWarning;