import React, { useState } from 'react';
import { FiPlus, FiRefreshCw, FiMonitor, FiSmartphone, FiTablet, FiShield, FiActivity } from 'react-icons/fi';
import { useDeviceManagement, Device } from '../../hooks/useDeviceManagement';
import DeviceCard from './DeviceCard';
import DeviceEditModal from './DeviceEditModal';
import DeviceStatsCard from './DeviceStatsCard';

const DeviceManagement: React.FC = () => {
  const {
    devices,
    stats,
    loading,
    error,
    fetchDevices,
    registerDevice,
    updateDevice,
    removeDevice,
    trustDevice,
    getCurrentDevice,
    getDeviceIcon,
    getDeviceTypeLabel,
    formatLastUsed
  } = useDeviceManagement();

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'trusted' | 'mobile' | 'desktop'>('all');

  const handleRefresh = async () => {
    await fetchDevices();
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
  };

  const handleRemove = async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
    } catch (error) {
      console.error('Failed to remove device:', error);
    }
  };

  const handleTrust = async (deviceId: string, trusted: boolean) => {
    try {
      await trustDevice(deviceId, trusted);
    } catch (error) {
      console.error('Failed to update device trust:', error);
    }
  };

  const handleAddDevice = () => {
    setShowAddModal(true);
  };

  const handleSaveDevice = async (deviceData: any) => {
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, deviceData);
      } else {
        await registerDevice(deviceData);
      }
      setEditingDevice(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save device:', error);
    }
  };

  const filteredDevices = devices.filter(device => {
    switch (filter) {
      case 'trusted':
        return device.is_trusted;
      case 'mobile':
        return device.device_type === 'mobile';
      case 'desktop':
        return device.device_type === 'desktop';
      default:
        return true;
    }
  });

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case 'trusted':
        return <FiShield size={16} />;
      case 'mobile':
        return <FiSmartphone size={16} />;
      case 'desktop':
        return <FiMonitor size={16} />;
      default:
        return <FiActivity size={16} />;
    }
  };

  return (
    <div className="device-management">
      <div className="device-management-header">
        <div className="header-left">
          <h2>Device Management</h2>
          <p>Manage your connected devices and security settings</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleAddDevice}
          >
            <FiPlus size={16} />
            Add Device
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Device Statistics */}
      {stats && (
        <DeviceStatsCard stats={stats} />
      )}

      {/* Device Filters */}
      <div className="device-filters">
        <div className="filter-buttons">
          {[
            { key: 'all', label: 'All Devices' },
            { key: 'trusted', label: 'Trusted' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'desktop', label: 'Desktop' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
              onClick={() => setFilter(filterOption.key as any)}
            >
              {getFilterIcon(filterOption.key)}
              {filterOption.label}
            </button>
          ))}
        </div>
        
        <div className="filter-results">
          {filteredDevices.length} of {devices.length} devices
        </div>
      </div>

      {/* Device List */}
      <div className="device-list">
        {filteredDevices.length === 0 ? (
          <div className="empty-state">
            <FiMonitor size={48} />
            <h3>No devices found</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any registered devices yet."
                : `No ${filter} devices found.`
              }
            </p>
            {filter === 'all' && (
              <button className="btn btn-primary" onClick={handleAddDevice}>
                <FiPlus size={16} />
                Add Your First Device
              </button>
            )}
          </div>
        ) : (
          <div className="device-grid">
            {filteredDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onEdit={handleEdit}
                onRemove={handleRemove}
                onTrust={handleTrust}
                formatLastUsed={formatLastUsed}
                isLoading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Device Modal */}
      {(editingDevice || showAddModal) && (
        <DeviceEditModal
          device={editingDevice}
          isOpen={true}
          onClose={() => {
            setEditingDevice(null);
            setShowAddModal(false);
          }}
          onSave={handleSaveDevice}
          loading={loading}
        />
      )}

      <style>{`
        .device-management {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .device-management-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-left h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #212529;
        }

        .header-left p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          color: #721c24;
        }

        .device-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #495057;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-btn:hover {
          background: #e9ecef;
        }

        .filter-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .filter-results {
          font-size: 14px;
          color: #6c757d;
        }

        .device-list {
          min-height: 300px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-state h3 {
          margin: 16px 0 8px 0;
          color: #495057;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .device-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .device-management {
            padding: 16px;
          }

          .device-management-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-actions {
            align-self: stretch;
          }

          .btn {
            flex: 1;
          }

          .device-filters {
            flex-direction: column;
            gap: 12px;
          }

          .filter-buttons {
            flex-wrap: wrap;
          }

          .device-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DeviceManagement;