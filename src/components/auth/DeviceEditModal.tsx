import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiMonitor, FiSmartphone, FiTablet } from 'react-icons/fi';
import { Device } from '../../hooks/useDeviceManagement';

interface DeviceEditModalProps {
  device?: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceData: any) => Promise<void>;
  loading: boolean;
}

const DeviceEditModal: React.FC<DeviceEditModalProps> = ({
  device,
  isOpen,
  onClose,
  onSave,
  loading
}) => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'desktop' as 'desktop' | 'mobile' | 'tablet',
    device_model: '',
    os_version: '',
    app_version: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name || '',
        device_type: device.device_type || 'desktop',
        device_model: device.device_model || '',
        os_version: device.os_version || '',
        app_version: device.app_version || ''
      });
    } else {
      // Auto-detect device info for new devices
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
      
      let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
      if (isTablet) deviceType = 'tablet';
      else if (isMobile) deviceType = 'mobile';
      
      setFormData({
        device_name: `${platform} ${deviceType}`,
        device_type: deviceType,
        device_model: platform || '',
        os_version: platform || '',
        app_version: '1.0.0'
      });
    }
  }, [device]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.device_name.trim()) {
      newErrors.device_name = 'Device name is required';
    } else if (formData.device_name.length < 3) {
      newErrors.device_name = 'Device name must be at least 3 characters';
    } else if (formData.device_name.length > 100) {
      newErrors.device_name = 'Device name must be less than 100 characters';
    }

    if (!formData.device_type) {
      newErrors.device_type = 'Device type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save device:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <FiSmartphone size={16} />;
      case 'tablet':
        return <FiTablet size={16} />;
      case 'desktop':
      default:
        return <FiMonitor size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{device ? 'Edit Device' : 'Add New Device'}</h3>
          <button 
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="device_name">Device Name *</label>
            <input
              type="text"
              id="device_name"
              name="device_name"
              value={formData.device_name}
              onChange={handleInputChange}
              className={errors.device_name ? 'error' : ''}
              placeholder="Enter device name"
              disabled={loading}
            />
            {errors.device_name && (
              <span className="error-message">{errors.device_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="device_type">Device Type *</label>
            <select
              id="device_type"
              name="device_type"
              value={formData.device_type}
              onChange={handleInputChange}
              className={errors.device_type ? 'error' : ''}
              disabled={loading}
            >
              <option value="desktop">
                Desktop
              </option>
              <option value="mobile">
                Mobile
              </option>
              <option value="tablet">
                Tablet
              </option>
            </select>
            {errors.device_type && (
              <span className="error-message">{errors.device_type}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="device_model">Device Model</label>
            <input
              type="text"
              id="device_model"
              name="device_model"
              value={formData.device_model}
              onChange={handleInputChange}
              placeholder="e.g., MacBook Pro, iPhone 12"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="os_version">Operating System</label>
            <input
              type="text"
              id="os_version"
              name="os_version"
              value={formData.os_version}
              onChange={handleInputChange}
              placeholder="e.g., macOS 12.0, Windows 11"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="app_version">App Version</label>
            <input
              type="text"
              id="app_version"
              name="app_version"
              value={formData.app_version}
              onChange={handleInputChange}
              placeholder="e.g., 1.0.0"
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FiSave size={16} />
              {loading ? 'Saving...' : 'Save Device'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #212529;
        }

        .modal-close {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #6c757d;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f8f9fa;
          color: #495057;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #495057;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #dc3545;
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background: #f8f9fa;
          cursor: not-allowed;
        }

        .error-message {
          display: block;
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 10px 20px;
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

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DeviceEditModal;