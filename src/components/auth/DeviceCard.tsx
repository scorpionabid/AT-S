import React, { useState } from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiShield, FiMonitor, FiSmartphone, FiTablet, FiMapPin } from 'react-icons/fi';
import { Device } from '../../hooks/useDeviceManagement';

interface DeviceCardProps {
  device: Device;
  onEdit: (device: Device) => void;
  onRemove: (deviceId: string) => void;
  onTrust: (deviceId: string, trusted: boolean) => void;
  formatLastUsed: (lastUsed: string) => string;
  isLoading?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onEdit,
  onRemove,
  onTrust,
  formatLastUsed,
  isLoading = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getDeviceIcon = () => {
    switch (device.device_type) {
      case 'mobile':
        return <FiSmartphone size={20} />;
      case 'tablet':
        return <FiTablet size={20} />;
      case 'desktop':
      default:
        return <FiMonitor size={20} />;
    }
  };

  const getDeviceTypeColor = () => {
    switch (device.device_type) {
      case 'mobile':
        return '#007bff';
      case 'tablet':
        return '#6f42c1';
      case 'desktop':
      default:
        return '#28a745';
    }
  };

  const handleEdit = () => {
    onEdit(device);
    setShowDropdown(false);
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      onRemove(device.id);
    }
    setShowDropdown(false);
  };

  const handleTrust = () => {
    onTrust(device.id, !device.is_trusted);
    setShowDropdown(false);
  };

  return (
    <div className={`device-card ${device.is_current ? 'current-device' : ''} ${isLoading ? 'loading' : ''}`}>
      <div className="device-header">
        <div className="device-icon" style={{ color: getDeviceTypeColor() }}>
          {getDeviceIcon()}
        </div>
        
        <div className="device-info">
          <h4 className="device-name">{device.device_name}</h4>
          <div className="device-details">
            <span className="device-type">
              {device.device_type.charAt(0).toUpperCase() + device.device_type.slice(1)}
            </span>
            {device.device_model && (
              <span className="device-model">• {device.device_model}</span>
            )}
          </div>
        </div>

        <div className="device-actions">
          {device.is_current && (
            <span className="current-badge">Current</span>
          )}
          
          {device.is_trusted && (
            <span className="trusted-badge" title="Trusted Device">
              <FiShield size={14} />
            </span>
          )}

          <div className="dropdown-container">
            <button
              className="dropdown-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isLoading}
            >
              <FiMoreVertical size={16} />
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleEdit}>
                  <FiEdit2 size={14} />
                  Edit
                </button>
                
                <button className="dropdown-item" onClick={handleTrust}>
                  <FiShield size={14} />
                  {device.is_trusted ? 'Untrust' : 'Trust'}
                </button>
                
                {!device.is_current && (
                  <button 
                    className="dropdown-item danger"
                    onClick={handleRemove}
                  >
                    <FiTrash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="device-metadata">
        <div className="metadata-item">
          <strong>Last Used:</strong> {formatLastUsed(device.last_used_at)}
        </div>
        
        {device.os_version && (
          <div className="metadata-item">
            <strong>OS:</strong> {device.os_version}
          </div>
        )}
        
        {device.browser && (
          <div className="metadata-item">
            <strong>Browser:</strong> {device.browser}
          </div>
        )}
        
        {device.location && (
          <div className="metadata-item">
            <FiMapPin size={12} />
            {device.location.city}, {device.location.country}
          </div>
        )}
      </div>

      <style jsx>{`
        .device-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s;
          position: relative;
        }

        .device-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .device-card.current-device {
          border-color: #007bff;
          background: #f8f9ff;
        }

        .device-card.loading {
          opacity: 0.6;
          pointer-events: none;
        }

        .device-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .device-icon {
          padding: 8px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .device-info {
          flex: 1;
        }

        .device-name {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #212529;
        }

        .device-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6c757d;
        }

        .device-type {
          font-weight: 500;
          color: #495057;
        }

        .device-model {
          color: #6c757d;
        }

        .device-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .current-badge {
          background: #007bff;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .trusted-badge {
          color: #28a745;
          padding: 4px;
          border-radius: 4px;
          background: #d4edda;
          display: flex;
          align-items: center;
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-trigger {
          background: none;
          border: none;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.2s;
        }

        .dropdown-trigger:hover {
          background: #f8f9fa;
          color: #495057;
        }

        .dropdown-trigger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          min-width: 120px;
          z-index: 1000;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #495057;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item.danger {
          color: #dc3545;
        }

        .dropdown-item.danger:hover {
          background: #f8d7da;
        }

        .device-metadata {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6c757d;
        }

        .metadata-item strong {
          color: #495057;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .device-header {
            flex-direction: column;
            gap: 8px;
          }

          .device-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default DeviceCard;