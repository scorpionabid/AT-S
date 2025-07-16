/**
 * Error Handler - Centralized error handling for all services
 */

export interface ServiceError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: ((error: ServiceError) => void)[] = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public onError(callback: (error: ServiceError) => void): void {
    this.errorCallbacks.push(callback);
  }

  public removeErrorCallback(callback: (error: ServiceError) => void): void {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  public handleError(error: any): ServiceError {
    const serviceError = this.parseError(error);
    
    // Log error for debugging
    console.error('Service Error:', serviceError);
    
    // Notify all registered error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(serviceError);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });

    return serviceError;
  }

  private parseError(error: any): ServiceError {
    // Handle fetch/network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        statusCode: 0
      };
    }

    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        message: 'Request timeout. Please try again.',
        code: 'TIMEOUT_ERROR',
        statusCode: 408
      };
    }

    // Handle HTTP errors
    if (error.message.includes('HTTP error! status:')) {
      const statusCode = parseInt(error.message.split(':')[1]);
      return this.getHttpErrorMessage(statusCode);
    }

    // Handle API response errors
    if (error.response) {
      const statusCode = error.response.status;
      const data = error.response.data;
      
      return {
        message: data?.message || this.getHttpErrorMessage(statusCode).message,
        code: data?.code || `HTTP_${statusCode}`,
        statusCode,
        details: data?.errors || data?.details
      };
    }

    // Handle validation errors
    if (error.errors && Array.isArray(error.errors)) {
      return {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        details: error.errors
      };
    }

    // Handle generic errors
    return {
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500,
      details: error.details
    };
  }

  private getHttpErrorMessage(statusCode: number): ServiceError {
    switch (statusCode) {
      case 400:
        return {
          message: 'Bad request. Please check your input.',
          code: 'BAD_REQUEST',
          statusCode: 400
        };
      case 401:
        return {
          message: 'Session expired. Please login again.',
          code: 'UNAUTHORIZED',
          statusCode: 401
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          statusCode: 403
        };
      case 404:
        return {
          message: 'Resource not found.',
          code: 'NOT_FOUND',
          statusCode: 404
        };
      case 409:
        return {
          message: 'Conflict. Resource already exists.',
          code: 'CONFLICT',
          statusCode: 409
        };
      case 422:
        return {
          message: 'Validation failed. Please check your input.',
          code: 'VALIDATION_ERROR',
          statusCode: 422
        };
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT',
          statusCode: 429
        };
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          code: 'SERVER_ERROR',
          statusCode: 500
        };
      case 502:
        return {
          message: 'Bad gateway. Server is temporarily unavailable.',
          code: 'BAD_GATEWAY',
          statusCode: 502
        };
      case 503:
        return {
          message: 'Service unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
          statusCode: 503
        };
      case 504:
        return {
          message: 'Gateway timeout. Please try again.',
          code: 'GATEWAY_TIMEOUT',
          statusCode: 504
        };
      default:
        return {
          message: `HTTP error occurred (${statusCode})`,
          code: `HTTP_${statusCode}`,
          statusCode
        };
    }
  }

  // Utility methods for common error types
  public isNetworkError(error: ServiceError): boolean {
    return error.code === 'NETWORK_ERROR';
  }

  public isAuthError(error: ServiceError): boolean {
    return error.statusCode === 401;
  }

  public isPermissionError(error: ServiceError): boolean {
    return error.statusCode === 403;
  }

  public isValidationError(error: ServiceError): boolean {
    return error.statusCode === 422 || error.code === 'VALIDATION_ERROR';
  }

  public isServerError(error: ServiceError): boolean {
    return error.statusCode ? error.statusCode >= 500 : false;
  }

  public getErrorMessage(error: ServiceError): string {
    if (this.isValidationError(error) && error.details) {
      // Format validation errors
      if (Array.isArray(error.details)) {
        return error.details.join(', ');
      }
      if (typeof error.details === 'object') {
        return Object.values(error.details).flat().join(', ');
      }
    }
    
    return error.message;
  }

  public getUserFriendlyMessage(error: ServiceError): string {
    if (this.isNetworkError(error)) {
      return 'Check your internet connection and try again.';
    }
    
    if (this.isAuthError(error)) {
      return 'Please login again to continue.';
    }
    
    if (this.isPermissionError(error)) {
      return 'You don\'t have permission for this action.';
    }
    
    if (this.isValidationError(error)) {
      return 'Please check your input and try again.';
    }
    
    if (this.isServerError(error)) {
      return 'Server is temporarily unavailable. Please try again later.';
    }
    
    return this.getErrorMessage(error);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();