import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    const { onReset } = this.props;
    this.setState({ hasError: false, error: null });
    if (onReset) {
      onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, FallbackComponent } = this.props;

    if (hasError && error) {
      return <FallbackComponent error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return children;
  }
}

export default ErrorBoundary;
