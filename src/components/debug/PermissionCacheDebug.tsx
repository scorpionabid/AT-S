import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiTrash2, FiBarChart3, FiSettings, FiEye, FiEyeOff } from 'react-icons/fi';
import { usePermissionCacheContext } from '../../contexts/PermissionCacheContext';
import { getPermissionCacheStats } from '../../utils/auth/cachedPermissionUtils';

const PermissionCacheDebug: React.FC = () => {
  const { clearCache, cacheStats } = usePermissionCacheContext();
  const [isVisible, setIsVisible] = useState(false);
  const [detailedStats, setDetailedStats] = useState(cacheStats);

  useEffect(() => {
    const interval = setInterval(() => {
      setDetailedStats(getPermissionCacheStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the permission cache?')) {
      clearCache();
    }
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return '#28a745';
    if (hitRate >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getCacheSizeColor = (size: number) => {
    if (size <= 50) return '#28a745';
    if (size <= 80) return '#ffc107';
    return '#dc3545';
  };

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="permission-cache-debug">
      <button
        className="debug-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title="Toggle Permission Cache Debug"
      >
        {isVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        Cache
      </button>

      {isVisible && (
        <div className="debug-panel">
          <div className="debug-header">
            <h4>Permission Cache Debug</h4>
            <div className="debug-actions">
              <button
                className="debug-action"
                onClick={() => setDetailedStats(getPermissionCacheStats())}
                title="Refresh Stats"
              >
                <FiRefreshCw size={14} />
              </button>
              <button
                className="debug-action danger"
                onClick={handleClearCache}
                title="Clear Cache"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>

          <div className="debug-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Hit Rate</div>
                <div 
                  className="stat-value"
                  style={{ color: getHitRateColor(detailedStats.hitRate) }}
                >
                  {detailedStats.hitRate.toFixed(1)}%
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Cache Size</div>
                <div 
                  className="stat-value"
                  style={{ color: getCacheSizeColor(detailedStats.size) }}
                >
                  {detailedStats.size}
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Hits</div>
                <div className="stat-value">{detailedStats.hits}</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Misses</div>
                <div className="stat-value">{detailedStats.misses}</div>
              </div>
            </div>

            <div className="performance-indicator">
              <div className="performance-bar">
                <div 
                  className="performance-fill"
                  style={{ 
                    width: `${Math.min(detailedStats.hitRate, 100)}%`,
                    backgroundColor: getHitRateColor(detailedStats.hitRate)
                  }}
                />
              </div>
              <div className="performance-label">
                Cache Performance
              </div>
            </div>

            <div className="cache-recommendations">
              {detailedStats.hitRate < 60 && (
                <div className="recommendation warning">
                  <FiBarChart3 size={14} />
                  Low cache hit rate. Consider preloading more permissions.
                </div>
              )}
              
              {detailedStats.size > 80 && (
                <div className="recommendation info">
                  <FiSettings size={14} />
                  Cache size is high. Consider reducing TTL or max size.
                </div>
              )}
              
              {detailedStats.hitRate >= 80 && (
                <div className="recommendation success">
                  <FiBarChart3 size={14} />
                  Excellent cache performance!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .permission-cache-debug {
          position: fixed;
          top: 100px;
          right: 20px;
          z-index: 10000;
          font-family: monospace;
          font-size: 12px;
        }

        .debug-toggle {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .debug-toggle:hover {
          background: #0056b3;
        }

        .debug-panel {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 280px;
          margin-top: 8px;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .debug-header h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #495057;
        }

        .debug-actions {
          display: flex;
          gap: 4px;
        }

        .debug-action {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #6c757d;
          border-radius: 3px;
          transition: all 0.2s;
        }

        .debug-action:hover {
          background: #f8f9fa;
          color: #495057;
        }

        .debug-action.danger {
          color: #dc3545;
        }

        .debug-action.danger:hover {
          background: #f8d7da;
        }

        .debug-content {
          padding: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat-item {
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          text-align: center;
        }

        .stat-label {
          font-size: 10px;
          color: #6c757d;
          margin-bottom: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #212529;
        }

        .performance-indicator {
          margin-bottom: 12px;
        }

        .performance-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .performance-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .performance-label {
          font-size: 10px;
          color: #6c757d;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cache-recommendations {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .recommendation {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 4px;
          font-size: 10px;
          line-height: 1.2;
        }

        .recommendation.warning {
          background: #fff3cd;
          color: #856404;
        }

        .recommendation.info {
          background: #d1ecf1;
          color: #0c5460;
        }

        .recommendation.success {
          background: #d4edda;
          color: #155724;
        }

        @media (max-width: 768px) {
          .permission-cache-debug {
            top: 60px;
            right: 10px;
          }

          .debug-panel {
            width: 250px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PermissionCacheDebug;