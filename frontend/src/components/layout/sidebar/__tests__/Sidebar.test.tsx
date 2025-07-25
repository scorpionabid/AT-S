import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock external dependencies
const mockNavigate = jest.fn();
const mockToggleCollapse = jest.fn();
const mockCloseMobile = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard' })
}));

jest.mock('../../../contexts/LayoutContext', () => ({
  useLayout: () => ({
    isCollapsed: false,
    toggleCollapse: mockToggleCollapse,
    isMobileOpen: false,
    closeMobile: mockCloseMobile,
    screenSize: 'desktop',
    theme: 'light',
    toggleTheme: jest.fn()
  })
}));

jest.mock('../../../contexts/NavigationContext', () => ({
  useNavigation: () => ({
    expandedItems: [],
    toggleExpanded: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn(),
    clearSearch: jest.fn()
  })
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'testuser', roles: ['superadmin'] },
    token: 'test-token',
    logout: jest.fn()
  })
}));

// Import components after mocking
import Sidebar from '../Sidebar';
import { SidebarErrorBoundary } from '../ErrorBoundaries';
import { SidebarSkeleton, LoadingSpinner, LoadingOverlay } from '../LoadingStates';
import { FallbackSidebarContent, ProgressiveEnhancement } from '../GracefulDegradation';
import PerformanceDashboard from '../PerformanceDashboard';

// Test data
const mockSidebarData = {
  navigationItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
    { id: 'users', label: 'Users', path: '/users', icon: 'users' }
  ],
  badges: {
    notifications: 5,
    messages: 2,
    tasks: 3,
    approvals: 1,
    surveys: 0,
    documents: 4
  },
  userProfile: {
    username: 'testuser',
    email: 'test@example.com',
    role: 'superadmin'
  }
};

describe('Enhanced Sidebar System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sidebar Component', () => {
    it('renders sidebar with all enhancement features enabled', () => {
      render(
        <Sidebar
          enableErrorBoundary={true}
          enableLoadingStates={true}
          enableGracefulDegradation={true}
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });

    it('renders minimal sidebar when all enhancements disabled', () => {
      render(
        <Sidebar
          enableErrorBoundary={false}
          enableLoadingStates={false}
          enableGracefulDegradation={false}
        />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('handles keyboard navigation correctly', () => {
      render(<Sidebar />);
      
      const sidebar = screen.getByRole('navigation');
      
      fireEvent.keyDown(sidebar, { key: 'Escape' });
      expect(mockCloseMobile).toHaveBeenCalled();
    });

    it('handles touch gestures on mobile', () => {
      // Mock mobile screen size
      jest.spyOn(require('../../../contexts/LayoutContext'), 'useLayout').mockReturnValue({
        isCollapsed: false,
        toggleCollapse: mockToggleCollapse,
        isMobileOpen: true,
        closeMobile: mockCloseMobile,
        screenSize: 'mobile',
        theme: 'light',
        toggleTheme: jest.fn()
      });

      render(<Sidebar />);
      
      const sidebar = screen.getByRole('navigation');
      
      // Simulate swipe left
      fireEvent.touchStart(sidebar, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(sidebar, { touches: [{ clientX: 50, clientY: 100 }] });
      fireEvent.touchEnd(sidebar, { changedTouches: [{ clientX: 30, clientY: 100 }] });
      
      expect(mockCloseMobile).toHaveBeenCalled();
    });
  });

  describe('Error Boundaries', () => {
    it('catches and displays errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <SidebarErrorBoundary>
          <ThrowError />
        </SidebarErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });

    it('provides retry functionality', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <SidebarErrorBoundary maxRetries={2}>
          <ThrowError />
        </SidebarErrorBoundary>
      );

      const retryButton = screen.getByText(/retry/i);
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      // Component should attempt to retry
    });

    it('shows error details when expanded', () => {
      const ThrowError = () => {
        throw new Error('Test error with stack');
      };

      render(
        <SidebarErrorBoundary>
          <ThrowError />
        </SidebarErrorBoundary>
      );

      const showDetailsButton = screen.getByText(/show details/i);
      fireEvent.click(showDetailsButton);
      
      expect(screen.getByText(/hide details/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('renders sidebar skeleton correctly', () => {
      render(<SidebarSkeleton isCollapsed={false} />);
      
      // Check for skeleton elements
      const skeletonElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('renders collapsed sidebar skeleton', () => {
      render(<SidebarSkeleton isCollapsed={true} />);
      
      expect(screen.getByText('', { selector: '.w-16' })).toBeInTheDocument();
    });

    it('shows loading spinner with correct size and color', () => {
      render(<LoadingSpinner size="lg" color="primary" />);
      
      const spinner = screen.getByRole('', { hidden: true });
      expect(spinner).toHaveClass('w-8', 'h-8', 'text-blue-600');
    });

    it('renders loading overlay correctly', () => {
      render(
        <LoadingOverlay isLoading={true} text="Loading test...">
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(screen.getByText('Loading test...')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('hides loading overlay when not loading', () => {
      render(
        <LoadingOverlay isLoading={false} text="Loading test...">
          <div>Content</div>
        </LoadingOverlay>
      );

      expect(screen.queryByText('Loading test...')).not.toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Graceful Degradation', () => {
    it('shows fallback content when offline', () => {
      render(
        <FallbackSidebarContent
          isCollapsed={false}
          showOfflineIndicator={true}
        />
      );

      expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
      expect(screen.getByText(/limited functionality/i)).toBeInTheDocument();
    });

    it('renders progressive enhancement correctly', () => {
      render(
        <ProgressiveEnhancement
          isOnline={true}
          hasData={true}
          isLoading={false}
          error={null}
        >
          <div>Enhanced content</div>
        </ProgressiveEnhancement>
      );

      expect(screen.getByText('Enhanced content')).toBeInTheDocument();
    });

    it('shows fallback when offline and no data', () => {
      render(
        <ProgressiveEnhancement
          isOnline={false}
          hasData={false}
          isLoading={false}
          error={null}
          fallback={<div>Fallback content</div>}
        >
          <div>Enhanced content</div>
        </ProgressiveEnhancement>
      );

      expect(screen.getByText('Fallback content')).toBeInTheDocument();
      expect(screen.queryByText('Enhanced content')).not.toBeInTheDocument();
    });

    it('shows error fallback when error exists and no data', () => {
      const testError = new Error('Network error');
      
      render(
        <ProgressiveEnhancement
          isOnline={true}
          hasData={false}
          isLoading={false}
          error={testError}
          fallback={<div>Error fallback</div>}
        >
          <div>Enhanced content</div>
        </ProgressiveEnhancement>
      );

      expect(screen.getByText('Error fallback')).toBeInTheDocument();
      expect(screen.queryByText('Enhanced content')).not.toBeInTheDocument();
    });
  });

  describe('Performance Dashboard', () => {
    it('renders performance dashboard with metrics', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/render time/i)).toBeInTheDocument();
      expect(screen.getByText(/memory usage/i)).toBeInTheDocument();
    });

    it('toggles auto refresh functionality', () => {
      render(<PerformanceDashboard />);

      const autoRefreshButton = screen.getByLabelText(/auto refresh/i);
      fireEvent.click(autoRefreshButton);
      
      // Should enable auto refresh (visual change in button)
      expect(autoRefreshButton).toHaveClass('bg-blue-100');
    });

    it('displays performance score correctly', () => {
      render(<PerformanceDashboard />);

      // Should show performance score gauge
      const scoreElements = screen.getAllByText(/\d+/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it('shows no issues when performance is good', () => {
      render(<PerformanceDashboard />);

      expect(screen.getByText(/no performance issues detected/i)).toBeInTheDocument();
    });

    it('allows clearing performance issues', () => {
      render(<PerformanceDashboard />);

      const clearButton = screen.getByText(/clear issues/i);
      fireEvent.click(clearButton);
      
      // Should clear any existing issues
      expect(screen.getByText(/no performance issues detected/i)).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('handles complete error recovery flow', async () => {
      let shouldThrow = true;
      
      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Integration test error');
        }
        return <div>Recovered content</div>;
      };

      render(
        <SidebarErrorBoundary>
          <TestComponent />
        </SidebarErrorBoundary>
      );

      // Should show error initially
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Simulate recovery
      shouldThrow = false;
      
      const retryButton = screen.getByText(/retry/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Recovered content')).toBeInTheDocument();
      });
    });

    it('handles progressive loading with error recovery', async () => {
      let loadingState = 'loading';
      let hasError = false;

      const TestComponent = () => {
        const getContent = () => {
          if (loadingState === 'loading') return null;
          if (hasError) throw new Error('Loading failed');
          return <div>Loaded content</div>;
        };

        return getContent();
      };

      const { rerender } = render(
        <LoadingOverlay isLoading={loadingState === 'loading'}>
          <TestComponent />
        </LoadingOverlay>
      );

      // Should show loading initially
      expect(screen.getByRole('', { hidden: true })).toHaveClass('animate-spin');

      // Simulate error
      loadingState = 'error';
      hasError = true;
      
      rerender(
        <SidebarErrorBoundary>
          <LoadingOverlay isLoading={loadingState === 'loading'}>
            <TestComponent />
          </LoadingOverlay>
        </SidebarErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Simulate recovery
      loadingState = 'loaded';
      hasError = false;
      
      const retryButton = screen.getByText(/retry/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Loaded content')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Sidebar />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('supports keyboard navigation', () => {
      render(<Sidebar />);

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('tabIndex', '-1');
    });

    it('provides proper focus management in error states', () => {
      const ThrowError = () => {
        throw new Error('Focus test error');
      };

      render(
        <SidebarErrorBoundary>
          <ThrowError />
        </SidebarErrorBoundary>
      );

      const retryButton = screen.getByText(/retry/i);
      expect(retryButton).toBeInTheDocument();
      
      // Focus should be manageable
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
    });
  });

  describe('Performance Tests', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();
      
      render(<Sidebar />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('handles multiple re-renders efficiently', () => {
      const { rerender } = render(<Sidebar isCollapsed={false} />);
      
      const startTime = performance.now();
      
      // Multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<Sidebar isCollapsed={i % 2 === 0} />);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle multiple re-renders efficiently
      expect(totalTime).toBeLessThan(200);
    });
  });
});

// Custom test utilities
export const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

export const createMockSidebarData = (overrides = {}) => ({
  ...mockSidebarData,
  ...overrides
});

export const simulateNetworkError = () => {
  return new Error('Network connection failed');
};

export const simulateOfflineMode = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false
  });
};

export const simulateOnlineMode = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
  });
};