import React from 'react';
import { FiMonitor, FiSmartphone, FiShield, FiActivity, FiClock } from 'react-icons/fi';
import { DeviceStats } from '../../hooks/useDeviceManagement';

interface DeviceStatsCardProps {
  stats: DeviceStats;
}

const DeviceStatsCard: React.FC<DeviceStatsCardProps> = ({ stats }) => {
  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const statsItems = [
    {
      icon: <FiMonitor size={20} />,
      label: 'Total Devices',
      value: stats.total_devices,
      color: '#007bff'
    },
    {
      icon: <FiActivity size={20} />,
      label: 'Active Devices',
      value: stats.active_devices,
      color: '#28a745'
    },
    {
      icon: <FiSmartphone size={20} />,
      label: 'Mobile Devices',
      value: stats.mobile_devices,
      color: '#6f42c1'
    },
    {
      icon: <FiMonitor size={20} />,
      label: 'Desktop Devices',
      value: stats.desktop_devices,
      color: '#fd7e14'
    },
    {
      icon: <FiShield size={20} />,
      label: 'Trusted Devices',
      value: stats.trusted_devices,
      color: '#20c997'
    }
  ];

  return (
    <div className="device-stats-card">
      <div className="stats-header">
        <h3>Device Statistics</h3>
        <div className="last-activity">
          <FiClock size={14} />
          Last activity: {formatLastActivity(stats.last_activity)}
        </div>
      </div>

      <div className="stats-grid">
        {statsItems.map((item, index) => (
          <div key={index} className="stat-item">
            <div className="stat-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-footer">
        <div className="activity-indicator">
          <div className="activity-dot"></div>
          <span>Real-time monitoring active</span>
        </div>
      </div>

      <style>{`
        .device-stats-card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .stats-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #212529;
        }

        .last-activity {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6c757d;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .stat-item:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        .stat-icon {
          padding: 10px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }

        .activity-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6c757d;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          background: #28a745;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .stats-header {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-item {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DeviceStatsCard;