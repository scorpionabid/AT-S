/**
 * Device Edit Modal - Migrated to BaseModal + BaseForm
 * Köhnə 400+ sətirlik komponent → 60 sətir
 */

import React, { useEffect } from 'react';
import { FiMonitor, FiSmartphone, FiTablet } from 'react-icons/fi';
import BaseModal from '../base/BaseModal';
import BaseForm from '../base/BaseForm';
import { StyleSystem, styles } from '../../utils/StyleSystem';
import { Device } from '../../hooks/useDeviceManagement';

interface DeviceEditModalProps {
  device?: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceData: any) => Promise<void>;
  loading: boolean;
}

interface DeviceFormData {
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  device_model: string;
  os_version: string;
  app_version: string;
}

const DeviceEditModal: React.FC<DeviceEditModalProps> = ({
  device,
  isOpen,
  onClose,
  onSave,
  loading
}) => {
  // Auto-detect device info for new devices
  const getAutoDetectedDeviceInfo = (): Partial<DeviceFormData> => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
    
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';
    
    return {
      device_name: `${platform} ${deviceType}`,
      device_type: deviceType,
      device_model: platform || '',
      os_version: platform || '',
      app_version: '1.0.0'
    };
  };

  // Form configuration
  const deviceFormConfig = {
    fields: [
      {
        name: 'device_name',
        label: 'Device Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter device name',
        validation: {
          minLength: 3,
          maxLength: 100
        },
        gridCols: 12,
        description: 'A descriptive name for this device'
      },
      {
        name: 'device_type',
        label: 'Device Type',
        type: 'select' as const,
        required: true,
        options: [
          { 
            value: 'desktop', 
            label: (
              <div style={styles.flex('row', 'center', '2')}>
                <FiMonitor size={16} />
                Desktop
              </div>
            ) as any
          },
          { 
            value: 'mobile', 
            label: (
              <div style={styles.flex('row', 'center', '2')}>
                <FiSmartphone size={16} />
                Mobile
              </div>
            ) as any
          },
          { 
            value: 'tablet', 
            label: (
              <div style={styles.flex('row', 'center', '2')}>
                <FiTablet size={16} />
                Tablet
              </div>
            ) as any
          }
        ],
        gridCols: 12
      },
      {
        name: 'device_model',
        label: 'Device Model',
        type: 'text' as const,
        placeholder: 'e.g., MacBook Pro, iPhone 12',
        gridCols: 6,
        description: 'Specific device model (optional)'
      },
      {
        name: 'os_version',
        label: 'Operating System',
        type: 'text' as const,
        placeholder: 'e.g., macOS 12.0, Windows 11',
        gridCols: 6,
        description: 'OS version (optional)'
      },
      {
        name: 'app_version',
        label: 'App Version',
        type: 'text' as const,
        placeholder: 'e.g., 1.0.0',
        gridCols: 12,
        description: 'Application version (optional)'
      }
    ],
    sections: [
      {
        title: 'Device Information',
        description: 'Basic device details and identification',
        fields: ['device_name', 'device_type']
      },
      {
        title: 'Technical Details',
        description: 'Optional technical specifications',
        fields: ['device_model', 'os_version', 'app_version']
      }
    ],
    initialData: device ? {
      device_name: device.device_name || '',
      device_type: device.device_type || 'desktop',
      device_model: device.device_model || '',
      os_version: device.os_version || '',
      app_version: device.app_version || ''
    } : getAutoDetectedDeviceInfo(),
    validationMode: 'onBlur' as const
  };

  // Custom header with device type icon
  const renderDeviceHeader = () => {
    const getDeviceTypeIcon = (type: string) => {
      switch (type) {
        case 'mobile':
          return <FiSmartphone size={20} />;
        case 'tablet':
          return <FiTablet size={20} />;
        case 'desktop':
        default:
          return <FiMonitor size={20} />;
      }
    };

    return (
      <div style={styles.flex('row', 'center', '3')}>
        <div style={{
          ...styles.p('2'),
          ...styles.rounded('md'),
          backgroundColor: StyleSystem.tokens.colors.primary[100],
          color: StyleSystem.tokens.colors.primary[600]
        }}>
          {device ? getDeviceTypeIcon(device.device_type) : <FiMonitor size={20} />}
        </div>
        <div>
          <h3 style={styles.text('lg', 'semibold')}>
            {device ? 'Edit Device' : 'Add New Device'}
          </h3>
          {device && (
            <p style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>
              {device.device_name}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      variant="default"
      showCloseButton
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      {/* Custom Header */}
      <div style={{
        ...styles.p('6'),
        borderBottom: `1px solid ${StyleSystem.tokens.colors.gray[200]}`
      }}>
        {renderDeviceHeader()}
      </div>

      {/* Form Content */}
      <div style={styles.p('6')}>
        <BaseForm<DeviceFormData>
          config={deviceFormConfig}
          variant="sectioned"
          layout="horizontal"
          size="md"
          showSubmitButton={false}
          disabled={loading}
          onSuccess={async (formData) => {
            await onSave(formData);
          }}
          onError={(error) => {
            console.error('Device save failed:', error);
          }}
        />
      </div>

      {/* Custom Footer with Actions */}
      <div style={{
        ...styles.flex('row', 'center', 'end', '3'),
        ...styles.p('6'),
        borderTop: `1px solid ${StyleSystem.tokens.colors.gray[200]}`,
        backgroundColor: StyleSystem.tokens.colors.gray[50]
      }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={StyleSystem.button('secondary')}
        >
          Cancel
        </button>
        
        <button
          onClick={() => {
            // Trigger form submission
            const form = document.querySelector('form');
            if (form) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
            }
          }}
          disabled={loading}
          style={StyleSystem.button('primary')}
        >
          {loading ? (
            <div style={styles.flex('row', 'center', '2')}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Saving...
            </div>
          ) : (
            <>
              <FiMonitor size={16} />
              Save Device
            </>
          )}
        </button>
      </div>

      {/* Spin animation styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </BaseModal>
  );
};

export default DeviceEditModal;