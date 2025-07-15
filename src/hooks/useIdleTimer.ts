import { useState, useEffect, useRef, useCallback } from 'react';

export interface IdleTimerConfig {
  timeout: number; // Milliseconds of inactivity before considered idle
  onIdle?: () => void; // Callback when user becomes idle
  onActive?: () => void; // Callback when user becomes active again
  events?: string[]; // DOM events to track for activity
  throttle?: number; // Throttle activity detection (ms)
  startOnMount?: boolean; // Start tracking immediately
}

export interface IdleTimerState {
  isIdle: boolean;
  lastActive: Date;
  remaining: number; // Milliseconds remaining until idle
}

const DEFAULT_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'wheel'
];

const DEFAULT_CONFIG: Required<IdleTimerConfig> = {
  timeout: 15 * 60 * 1000, // 15 minutes
  onIdle: () => {},
  onActive: () => {},
  events: DEFAULT_EVENTS,
  throttle: 1000, // 1 second
  startOnMount: true
};

export const useIdleTimer = (config: Partial<IdleTimerConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<IdleTimerState>({
    isIdle: false,
    lastActive: new Date(),
    remaining: finalConfig.timeout
  });

  const timerRef = useRef<NodeJS.Timeout>();
  const lastActiveRef = useRef<number>(Date.now());
  const throttleRef = useRef<NodeJS.Timeout>();
  const isIdleRef = useRef<boolean>(false);

  // Reset the idle timer
  const reset = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If currently idle, trigger onActive callback
    if (isIdleRef.current && finalConfig.onActive) {
      finalConfig.onActive();
    }

    isIdleRef.current = false;
    
    setState(prev => ({
      ...prev,
      isIdle: false,
      lastActive: new Date(now),
      remaining: finalConfig.timeout
    }));

    // Set new timer
    timerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      setState(prev => ({
        ...prev,
        isIdle: true,
        remaining: 0
      }));
      
      if (finalConfig.onIdle) {
        finalConfig.onIdle();
      }
    }, finalConfig.timeout);
  }, [finalConfig]);

  // Throttled activity handler
  const handleActivity = useCallback(() => {
    if (throttleRef.current) return;

    throttleRef.current = setTimeout(() => {
      throttleRef.current = undefined;
    }, finalConfig.throttle);

    reset();
  }, [reset, finalConfig.throttle]);

  // Start/stop the timer
  const start = useCallback(() => {
    reset();
  }, [reset]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
  }, []);

  // Pause the timer (preserves current state)
  const pause = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  // Resume the timer from current state
  const resume = useCallback(() => {
    if (isIdleRef.current) return; // Already idle, no need to resume

    const elapsed = Date.now() - lastActiveRef.current;
    const remaining = Math.max(0, finalConfig.timeout - elapsed);

    setState(prev => ({ ...prev, remaining }));

    if (remaining > 0) {
      timerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        setState(prev => ({
          ...prev,
          isIdle: true,
          remaining: 0
        }));
        
        if (finalConfig.onIdle) {
          finalConfig.onIdle();
        }
      }, remaining);
    } else {
      // Should be idle immediately
      isIdleRef.current = true;
      setState(prev => ({
        ...prev,
        isIdle: true,
        remaining: 0
      }));
      
      if (finalConfig.onIdle) {
        finalConfig.onIdle();
      }
    }
  }, [finalConfig]);

  // Update remaining time periodically
  useEffect(() => {
    if (isIdleRef.current) return;

    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - lastActiveRef.current;
      const remaining = Math.max(0, finalConfig.timeout - elapsed);
      
      setState(prev => ({ ...prev, remaining }));
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [finalConfig.timeout]);

  // Setup event listeners
  useEffect(() => {
    if (!finalConfig.startOnMount) return;

    // Add event listeners
    finalConfig.events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the timer
    start();

    return () => {
      // Cleanup
      finalConfig.events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      stop();
    };
  }, [finalConfig.events, finalConfig.startOnMount, handleActivity, start, stop]);

  // Get formatted time remaining
  const getFormattedRemaining = useCallback((): string => {
    const minutes = Math.floor(state.remaining / (60 * 1000));
    const seconds = Math.floor((state.remaining % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [state.remaining]);

  // Get idle percentage (0-100)
  const getIdlePercentage = useCallback((): number => {
    return Math.max(0, Math.min(100, 
      ((finalConfig.timeout - state.remaining) / finalConfig.timeout) * 100
    ));
  }, [state.remaining, finalConfig.timeout]);

  return {
    ...state,
    start,
    stop,
    pause,
    resume,
    reset,
    getFormattedRemaining,
    getIdlePercentage,
    isActive: !state.isIdle,
    config: finalConfig
  };
};