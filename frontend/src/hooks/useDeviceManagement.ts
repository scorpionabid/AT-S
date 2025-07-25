import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Device {
  id: string;
  device_id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  device_model?: string;
  os_version?: string;
  browser?: string;
  app_version?: string;
  is_current: boolean;
  last_used_at: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  is_trusted: boolean;
  location?: {
    country: string;
    city: string;
  };
}

export interface DeviceStats {
  total_devices: number;
  active_devices: number;
  mobile_devices: number;
  desktop_devices: number;
  trusted_devices: number;
  last_activity: string;
}

export const useDeviceManagement = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const data = await response.json();
      setDevices(data.devices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/devices/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch device stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch device stats:', err);
    }
  }, [user]);

  const registerDevice = useCallback(async (deviceData: {
    device_name: string;
    device_id: string;
    device_type?: string;
    device_model?: string;
    os_version?: string;
    app_version?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deviceData)
      });

      if (!response.ok) {
        throw new Error('Failed to register device');
      }

      const data = await response.json();
      
      // Refresh device list
      await fetchDevices();
      
      return data.device;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register device';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const updateDevice = useCallback(async (deviceId: string, updateData: {
    device_name?: string;
    device_type?: string;
    device_model?: string;
    os_version?: string;
    app_version?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update device');
      }

      // Refresh device list
      await fetchDevices();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update device';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const removeDevice = useCallback(async (deviceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove device');
      }

      // Refresh device list
      await fetchDevices();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove device';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const trustDevice = useCallback(async (deviceId: string, trusted: boolean) => {
    return await updateDevice(deviceId, { 
      device_name: devices.find(d => d.id === deviceId)?.device_name || 'Unknown Device'
    });
  }, [updateDevice, devices]);

  const getCurrentDevice = useCallback((): Device | null => {
    return devices.find(device => device.is_current) || null;
  }, [devices]);

  const getDeviceIcon = useCallback((deviceType: string): string => {
    switch (deviceType) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📊';
      case 'desktop':
      default:
        return '💻';
    }
  }, []);

  const getDeviceTypeLabel = useCallback((deviceType: string): string => {
    switch (deviceType) {
      case 'mobile':
        return 'Mobile';
      case 'tablet':
        return 'Tablet';
      case 'desktop':
      default:
        return 'Desktop';
    }
  }, []);

  const formatLastUsed = useCallback((lastUsed: string): string => {
    const date = new Date(lastUsed);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchStats();
    }
  }, [user, fetchDevices, fetchStats]);

  return {
    devices,
    stats,
    loading,
    error,
    fetchDevices,
    fetchStats,
    registerDevice,
    updateDevice,
    removeDevice,
    trustDevice,
    getCurrentDevice,
    getDeviceIcon,
    getDeviceTypeLabel,
    formatLastUsed
  };
};