import React, { Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// ====================
// LOADING COMPONENTS
// ====================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`loading-spinner loading-spinner--${size} ${className}`}>
      <div className="loading-spinner__icon"></div>
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Yüklənir...',
  showSpinner = true,
  className = '',
}) => (
  <div className={`loading-overlay ${className}`}>
    <div className="loading-overlay__content">
      {showSpinner && <LoadingSpinner size="lg" />}
      {message && <p className="loading-overlay__message">{message}</p>}
    </div>
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'pulse',
  className = '',
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
      style={style}
      aria-label="Yüklənir"
    />
  );
};

// ====================
// SKELETON LAYOUTS
// ====================

export const CardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`card-skeleton ${className}`}>
    <Skeleton variant="rectangular" height={200} className="card-skeleton__image" />
    <div className="card-skeleton__content">
      <Skeleton variant="text" height={24} width="80%" className="card-skeleton__title" />
      <Skeleton variant="text" height={16} width="60%" className="card-skeleton__subtitle" />
      <div className="card-skeleton__actions">
        <Skeleton variant="rectangular" height={36} width={80} />
        <Skeleton variant="rectangular" height={36} width={80} />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string; 
}> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => (
  <div className={`table-skeleton ${className}`}>
    <div className="table-skeleton__header">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" height={20} />
      ))}
    </div>
    <div className="table-skeleton__body">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="table-skeleton__row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`form-skeleton ${className}`}>
    <Skeleton variant="text" height={24} width="40%" className="form-skeleton__title" />
    <div className="form-skeleton__field">
      <Skeleton variant="text" height={16} width="20%" />
      <Skeleton variant="rectangular" height={40} />
    </div>
    <div className="form-skeleton__field">
      <Skeleton variant="text" height={16} width="30%" />
      <Skeleton variant="rectangular" height={40} />
    </div>
    <div className="form-skeleton__field">
      <Skeleton variant="text" height={16} width="25%" />
      <Skeleton variant="rectangular" height={80} />
    </div>
    <div className="form-skeleton__actions">
      <Skeleton variant="rectangular" height={40} width={100} />
      <Skeleton variant="rectangular" height={40} width={80} />
    </div>
  </div>
);

// ====================
// ERROR FALLBACK COMPONENTS
// ====================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'Komponent yüklənərkən xəta baş verdi',
}) => (
  <div className="error-fallback">
    <div className="error-fallback__content">
      <div className="error-fallback__icon">⚠️</div>
      <h3 className="error-fallback__title">Xəta</h3>
      <p className="error-fallback__message">{message}</p>
      {import.meta.env.MODE === 'development' && (
        <details className="error-fallback__details">
          <summary>Texniki məlumat</summary>
          <pre className="error-fallback__error">{error.message}</pre>
        </details>
      )}
      <button
        type="button"
        className="btn btn--primary error-fallback__button"
        onClick={resetErrorBoundary}
      >
        Yenidən cəhd et
      </button>
    </div>
  </div>
);

interface NetworkErrorFallbackProps {
  onRetry: () => void;
  message?: string;
}

export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  onRetry,
  message = 'Şəbəkə bağlantısı problemi',
}) => (
  <div className="error-fallback error-fallback--network">
    <div className="error-fallback__content">
      <div className="error-fallback__icon">📡</div>
      <h3 className="error-fallback__title">Bağlantı problemi</h3>
      <p className="error-fallback__message">{message}</p>
      <p className="error-fallback__hint">
        İnternet bağlantınızı yoxlayın və yenidən cəhd edin.
      </p>
      <button
        type="button"
        className="btn btn--primary error-fallback__button"
        onClick={onRetry}
      >
        Yenidən cəhd et
      </button>
    </div>
  </div>
);

// ====================
// LAZY WRAPPER COMPONENT
// ====================

interface LazyWrapperProps {
  /** Loading component */
  fallback?: ReactNode;
  /** Error fallback component */
  errorFallback?: ComponentType<ErrorFallbackProps>;
  /** Custom error message */
  errorMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Children to render */
  children: ReactNode;
  /** Error boundary key for resetting */
  resetKeys?: Array<string | number>;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  fallback = <LoadingOverlay />,
  errorFallback: CustomErrorFallback = ErrorFallback,
  errorMessage,
  className = '',
  children,
  resetKeys = [],
}) => (
  <div className={`lazy-wrapper ${className}`}>
    <ErrorBoundary
      FallbackComponent={(props) => (
        <CustomErrorFallback {...props} message={errorMessage} />
      )}
      resetKeys={resetKeys}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  </div>
);

// ====================
// LAZY ROUTE COMPONENT
// ====================

interface LazyRouteProps {
  /** Lazy component */
  component: React.LazyExoticComponent<ComponentType<any>>;
  /** Loading fallback */
  fallback?: ReactNode;
  /** Error message */
  errorMessage?: string;
  /** Component props */
  [key: string]: any;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
  component: Component,
  fallback = <LoadingOverlay message="Səhifə yüklənir..." />,
  errorMessage = "Səhifə yüklənərkən xəta baş verdi",
  ...props
}) => (
  <LazyWrapper fallback={fallback} errorMessage={errorMessage}>
    <Component {...props} />
  </LazyWrapper>
);

// ====================
// INTERSECTION OBSERVER LAZY LOADER
// ====================

interface IntersectionLazyLoaderProps {
  /** Component to load when visible */
  children: ReactNode;
  /** Loading placeholder */
  placeholder?: ReactNode;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Additional CSS classes */
  className?: string;
  /** Disable lazy loading (always render) */
  disabled?: boolean;
}

export const IntersectionLazyLoader: React.FC<IntersectionLazyLoaderProps> = ({
  children,
  placeholder = <LoadingSpinner />,
  rootMargin = '100px',
  threshold = 0.1,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(disabled);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(disabled);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasBeenVisible(true);
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, disabled]);

  return (
    <div ref={elementRef} className={`intersection-lazy-loader ${className}`}>
      {hasBeenVisible ? children : placeholder}
    </div>
  );
};

// ====================
// IMAGE LAZY LOADER
// ====================

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source */
  src: string;
  /** Image alt text */
  alt: string;
  /** Placeholder image or component */
  placeholder?: string | ReactNode;
  /** Error image or component */
  errorFallback?: string | ReactNode;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Additional CSS classes */
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  errorFallback,
  rootMargin = '100px',
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState<string | undefined>();
  const [imageState, setImageState] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [isVisible, setIsVisible] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Intersection observer for lazy loading
  React.useEffect(() => {
    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(element);
          }
        });
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  // Load image when visible
  React.useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageState('loaded');
    };
    img.onerror = () => {
      setImageState('error');
    };
    img.src = src;
  }, [isVisible, src]);

  const renderContent = () => {
    if (imageState === 'loaded' && imageSrc) {
      return (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`lazy-image__img ${className}`}
          {...props}
        />
      );
    }

    if (imageState === 'error') {
      return (
        <div className={`lazy-image__error ${className}`}>
          {typeof errorFallback === 'string' ? (
            <img src={errorFallback} alt={alt} {...props} />
          ) : (
            errorFallback || (
              <div className="lazy-image__error-content">
                <span>🖼️</span>
                <span>Şəkil yüklənmədi</span>
              </div>
            )
          )}
        </div>
      );
    }

    return (
      <div ref={imgRef} className={`lazy-image__placeholder ${className}`}>
        {typeof placeholder === 'string' ? (
          <img src={placeholder} alt={alt} {...props} />
        ) : (
          placeholder || <Skeleton variant="rectangular" height="100%" />
        )}
      </div>
    );
  };

  return (
    <div className="lazy-image">
      {renderContent()}
    </div>
  );
};

// ====================
// PERFORMANCE MONITORING HOOKS
// ====================

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  });

  React.useEffect(() => {
    // Monitor load time
    const loadTime = performance.now();

    // Monitor memory usage (if available)
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    // Monitor render time
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    const interval = setInterval(updateMemoryUsage, 5000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return metrics;
};

// ====================
// EXPORT ALL COMPONENTS
// ====================

export default LazyWrapper;