import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to help debug
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error details:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Simplified error display without theme hooks
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full shadow-lg rounded-lg p-6 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Səhifə yüklənərkən xəta baş verdi
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Xəta baş verdi. Zəhmət olmasa yenidən yoxlayın və ya dəstək komandamızla əlaqə saxlayın.
                  </p>
                </div>
              </div>
            </div>
            {this.state.error && (
              <div className="mt-4 p-4 rounded-md overflow-auto max-h-60 bg-gray-100 dark:bg-gray-700">
                <p className="text-xs font-mono text-red-400 mb-2">{this.state.error.toString()}</p>
                <pre className="text-xs overflow-auto text-gray-700 dark:text-gray-300">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
              >
                Səhifəni Yenilə
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;