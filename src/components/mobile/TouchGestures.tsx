import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  delay?: number;
  className?: string;
  disabled?: boolean;
}

interface PinchZoomProps {
  children: React.ReactNode;
  onZoom?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
  className?: string;
  disabled?: boolean;
}

// Swipeable Card Component
export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = '',
  disabled = false,
}) => {
  const [startPos, setStartPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<TouchPosition>({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };
    setStartPos(pos);
    setCurrentPos(pos);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isSwiping) return;
    
    const touch = e.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };
    setCurrentPos(pos);
    
    const deltaX = pos.x - startPos.x;
    const deltaY = pos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    setSwipeDistance(distance);

    // Prevent default scrolling if horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && distance > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (disabled || !isSwiping) return;
    
    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance >= threshold) {
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      // Determine swipe direction
      if (angle >= -45 && angle <= 45) {
        // Right swipe
        onSwipeRight?.();
      } else if (angle >= 45 && angle <= 135) {
        // Down swipe
        onSwipeDown?.();
      } else if (angle >= -135 && angle <= -45) {
        // Up swipe
        onSwipeUp?.();
      } else {
        // Left swipe
        onSwipeLeft?.();
      }
    }
    
    setIsSwiping(false);
    setSwipeDistance(0);
  };

  const transform = isSwiping && swipeDistance > 10 
    ? `translateX(${(currentPos.x - startPos.x) * 0.1}px)`
    : 'translateX(0)';

  return (
    <div
      ref={elementRef}
      className={classNames(
        'swipeable-card',
        {
          'swipeable-card--swiping': isSwiping && swipeDistance > threshold * 0.5,
        },
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform,
        transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      {children}
    </div>
  );
};

// Long Press Component
export const LongPress: React.FC<LongPressProps> = ({
  children,
  onLongPress,
  delay = 500,
  className = '',
  disabled = false,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const startTimer = () => {
    if (disabled) return;
    
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, delay);
  };

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startTimer();
  };

  const handleMouseDown = () => {
    startTimer();
  };

  return (
    <div
      className={classNames(
        'long-press',
        {
          'long-press--active': isPressed,
        },
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelTimer}
      onTouchCancel={cancelTimer}
      onMouseDown={handleMouseDown}
      onMouseUp={cancelTimer}
      onMouseLeave={cancelTimer}
    >
      {children}
    </div>
  );
};

// Pinch Zoom Component
export const PinchZoom: React.FC<PinchZoomProps> = ({
  children,
  onZoom,
  minScale = 0.5,
  maxScale = 3,
  className = '',
  disabled = false,
}) => {
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const getDistance = (touches: TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 2) return;
    
    const distance = getDistance(e.touches);
    setInitialDistance(distance);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 2 || initialDistance === 0) return;
    
    e.preventDefault();
    const distance = getDistance(e.touches);
    const scaleChange = distance / initialDistance;
    const newScale = Math.min(Math.max(scale * scaleChange, minScale), maxScale);
    
    setScale(newScale);
    onZoom?.(newScale);
  };

  const handleTouchEnd = () => {
    setInitialDistance(0);
  };

  return (
    <div
      ref={elementRef}
      className={classNames('pinch-zoom', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: initialDistance === 0 ? 'transform 0.2s ease-out' : 'none',
      }}
    >
      {children}
    </div>
  );
};

// Touch Ripple Effect
interface TouchRippleProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  disabled?: boolean;
}

export const TouchRipple: React.FC<TouchRippleProps> = ({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
  disabled = false,
}) => {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>>([]);
  const elementRef = useRef<HTMLDivElement>(null);

  const createRipple = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || !elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
    const size = Math.max(rect.width, rect.height);
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      ref={elementRef}
      className={classNames('touch-ripple', className)}
      onTouchStart={createRipple}
      onMouseDown={createRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="touch-ripple__effect"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

// Hook for detecting touch device
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return isTouch;
};

// Hook for device orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
};

// Hook for safe area insets
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};

export default SwipeableCard;