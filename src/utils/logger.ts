// Log səviyyələri
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Log formatı
const formatLog = (level: LogLevel, context: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    context,
    message,
    ...(data && { data })
  };

  // Konsola çıxar
  const logMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
  console[logMethod](`[${timestamp}] [${level}] [${context}] ${message}`, data || '');

  return logEntry;
};

// Eksport olunan log funksiyaları
export const logger = {
  error: (context: string, message: string, data?: any) => 
    formatLog('ERROR', context, message, data),
  
  warn: (context: string, message: string, data?: any) => 
    formatLog('WARN', context, message, data),
    
  info: (context: string, message: string, data?: any) => 
    formatLog('INFO', context, message, data),
    
  debug: (context: string, message: string, data?: any) => 
    formatLog('DEBUG', context, message, data)
};
