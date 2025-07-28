/**
 * ATİS Production-Safe Logger
 * Environment-aware logging with conditional output
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const enabledLevels: LogLevel[] = isDevelopment 
  ? ['ERROR', 'WARN', 'INFO', 'DEBUG']
  : ['ERROR', 'WARN']; // Production: only errors and warnings

const shouldLog = (level: LogLevel): boolean => {
  return enabledLevels.includes(level);
};

// Enhanced log format
const formatLog = (level: LogLevel, context: string, message: string, data?: any) => {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    context,
    message,
    ...(data && { data })
  };

  // Enhanced console output
  const logMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
  const prefix = `[${timestamp}] [${level}] [${context}]`;
  
  console[logMethod](`${prefix} ${message}`);
  if (data && isDevelopment) {
    console[logMethod]('Data:', data);
  }

  return logEntry;
};

// Enhanced logger with service helpers
export const logger = {
  error: (context: string, message: string, data?: any) => 
    formatLog('ERROR', context, message, data),
  
  warn: (context: string, message: string, data?: any) => 
    formatLog('WARN', context, message, data),
    
  info: (context: string, message: string, data?: any) => 
    formatLog('INFO', context, message, data),
    
  debug: (context: string, message: string, data?: any) => 
    formatLog('DEBUG', context, message, data),

  // Service-specific helpers
  service: {
    request: (serviceName: string, endpoint: string, params?: any) => {
      logger.debug(serviceName, `Request to ${endpoint}`, params);
    },
    response: (serviceName: string, endpoint: string, status: number, dataKeys?: string[]) => {
      logger.debug(serviceName, `Response from ${endpoint} (${status})`, dataKeys ? { dataKeys } : undefined);
    },
    error: (serviceName: string, operation: string, error: any) => {
      logger.error(serviceName, `${operation} failed`, error);
    }
  }
};
