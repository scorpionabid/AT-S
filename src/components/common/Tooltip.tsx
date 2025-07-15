import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
type TooltipVariant = 'light' | 'dark' | 'info' | 'success' | 'warning' | 'error';

interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
  className?: string;
  tooltipClassName?: string;
  children: React.ReactElement;
  maxWidth?: number | string;
  interactive?: boolean;
  openOnClick?: boolean;
}

const positionClasses = {
  top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
};

const variantClasses = {
  light: 'bg-white text-gray-800 border border-gray-200',
  dark: 'bg-gray-800 text-white',
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

const arrowClasses = {
  top: 'bottom-[-4px] left-1/2 transform -translate-x-1/2 border-t-8 border-t-current border-l-8 border-l-transparent border-r-8 border-r-transparent',
  right: 'left-[-4px] top-1/2 transform -translate-y-1/2 border-r-8 border-r-current border-t-8 border-t-transparent border-b-8 border-b-transparent',
  bottom: 'top-[-4px] left-1/2 transform -translate-x-1/2 border-b-8 border-b-current border-l-8 border-l-transparent border-r-8 border-r-transparent',
  left: 'right-[-4px] top-1/2 transform -translate-y-1/2 border-l-8 border-l-current border-t-8 border-t-transparent border-b-8 border-b-transparent',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  variant = 'dark',
  delay = 200,
  disabled = false,
  className = '',
  tooltipClassName = '',
  maxWidth = '16rem',
  interactive = false,
  openOnClick = false,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  let showTimeout: NodeJS.Timeout;
  let hideTimeout: NodeJS.Timeout;

  useEffect(() => {
    setIsMounted(true);
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      updatePosition();
    }
  }, [isVisible]);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2);
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2);
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
    }

    // Adjust for window edges
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (x + tooltipRect.width > windowWidth) {
      x = windowWidth - tooltipRect.width - 10;
    }
    if (x < 0) x = 10;

    if (y + tooltipRect.height > windowHeight) {
      y = windowHeight - tooltipRect.height - 10;
    }
    if (y < 0) y = 10;

    setCoords({ x, y });
  };

  const showTooltip = () => {
    if (disabled) return;
    clearTimeout(hideTimeout);
    showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(showTimeout);
    hideTimeout = setTimeout(() => {
      if (!interactive) {
        setIsVisible(false);
      }
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (openOnClick) {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible(!isVisible);
    } else if (isVisible) {
      setIsVisible(false);
    }
  };

  if (disabled) {
    return children;
  }

  const triggerProps = {
    ref: (node: HTMLElement | null) => {
      if (node) {
        triggerRef.current = node;
        
        // @ts-ignore - Handle ref forwarding
        if (typeof children.ref === 'function') {
          children.ref(node);
        } else if (children.ref) {
          // @ts-ignore
          children.ref.current = node;
        }
      }
    },
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onClick: handleClick,
    'aria-describedby': isVisible ? 'tooltip' : undefined,
  };

  const tooltipClasses = classNames(
    'absolute z-50 px-3 py-2 text-sm font-medium rounded-md shadow-lg transition-opacity duration-150',
    'whitespace-normal break-words',
    variantClasses[variant],
    positionClasses[position],
    tooltipClassName,
    {
      'opacity-100': isVisible,
      'opacity-0 pointer-events-none': !isVisible,
    }
  );

  const arrowClassesCombined = `absolute w-0 h-0 ${arrowClasses[position]}`;

  return (
    <>
      {React.cloneElement(children, triggerProps)}
      {isMounted &&
        createPortal(
          <div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            className={tooltipClasses}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
              pointerEvents: interactive ? 'auto' : 'none',
            }}
            onMouseEnter={interactive ? showTooltip : undefined}
            onMouseLeave={interactive ? hideTooltip : undefined}
          >
            <div className="relative">
              {content}
              <div className={arrowClassesCombined} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// Pre-configured tooltips
export const InfoTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="info" {...props} />
);

export const SuccessTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="success" {...props} />
);

export const WarningTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="warning" {...props} />
);

export const ErrorTooltip: React.FC<Omit<TooltipProps, 'variant'>> = (props) => (
  <Tooltip variant="error" {...props} />
);

export default Tooltip;
