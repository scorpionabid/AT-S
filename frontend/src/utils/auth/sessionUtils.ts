/**
 * Session utility functions for ATİS system
 */

/**
 * Format session time for display
 */
export const formatSessionTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} saniyə`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes} dəq ${remainingSeconds} san`
      : `${minutes} dəqiqə`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0
    ? `${hours} saat ${remainingMinutes} dəq`
    : `${hours} saat`;
};

/**
 * Get session expiry warning message
 */
export const getSessionExpiryMessage = (remainingSeconds: number): string => {
  if (remainingSeconds <= 60) {
    return 'Seansınız 1 dəqiqədən az müddətdə bitəcək!';
  }
  
  if (remainingSeconds <= 300) { // 5 minutes
    const minutes = Math.ceil(remainingSeconds / 60);
    return `Seansınız ${minutes} dəqiqədə bitəcək!`;
  }
  
  if (remainingSeconds <= 900) { // 15 minutes
    const minutes = Math.ceil(remainingSeconds / 60);
    return `Seansınız ${minutes} dəqiqədə bitəcək.`;
  }
  
  return '';
};

/**
 * Check if session is about to expire
 */
export const isSessionExpiring = (remainingSeconds: number): boolean => {
  return remainingSeconds <= 900; // 15 minutes
};

/**
 * Check if session is critically expiring
 */
export const isSessionCritical = (remainingSeconds: number): boolean => {
  return remainingSeconds <= 300; // 5 minutes
};

/**
 * Get session status color
 */
export const getSessionStatusColor = (remainingSeconds: number): string => {
  if (remainingSeconds <= 300) {
    return 'red';
  }
  
  if (remainingSeconds <= 900) {
    return 'orange';
  }
  
  return 'green';
};

/**
 * Calculate session remaining time from expiry timestamp
 */
export const calculateRemainingTime = (expiryTimestamp: number): number => {
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((expiryTimestamp - now) / 1000));
  return remaining;
};

/**
 * Format session expiry date
 */
export const formatExpiryDate = (expiryTimestamp: number): string => {
  const date = new Date(expiryTimestamp);
  return date.toLocaleString('az-AZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
