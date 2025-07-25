// Animation utilities for sidebar components
export const animationConfig = {
  // Timing functions
  easing: {
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
  
  // Duration presets
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500,
  },
  
  // Stagger delays
  stagger: {
    menuItems: 50,
    submenu: 30,
    icons: 20,
  },
  
  // Animation states
  states: {
    initial: {
      opacity: 0,
      transform: 'translateX(-20px)',
    },
    animate: {
      opacity: 1,
      transform: 'translateX(0)',
    },
    exit: {
      opacity: 0,
      transform: 'translateX(-20px)',
    },
    hover: {
      transform: 'translateX(4px)',
    },
    active: {
      transform: 'translateX(8px) scale(1.02)',
    },
  },
};

// CSS-in-JS animation classes
export const createAnimationClasses = (variant: 'default' | 'smooth' | 'bounce' | 'spring') => {
  const baseTransition = `transition-all duration-200 ease-out`;
  
  switch (variant) {
    case 'smooth':
      return `${baseTransition} cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    case 'bounce':
      return `transition-all duration-300 cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    case 'spring':
      return `transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
    default:
      return baseTransition;
  }
};

// Keyframe animations
export const keyframes = {
  slideIn: `
    @keyframes slideIn {
      0% { opacity: 0; transform: translateX(-20px); }
      100% { opacity: 1; transform: translateX(0); }
    }
  `,
  
  slideOut: `
    @keyframes slideOut {
      0% { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(-20px); }
    }
  `,
  
  fadeIn: `
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `,
  
  wiggle: `
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(1deg); }
      75% { transform: rotate(-1deg); }
    }
  `,
  
  shimmer: `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,
  
  glow: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 8px rgba(8, 114, 232, 0.3); }
      50% { box-shadow: 0 0 16px rgba(8, 114, 232, 0.6); }
    }
  `,
  
  ripple: `
    @keyframes ripple {
      0% { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(1); opacity: 0; }
    }
  `,
};

// Animation hooks
export const useStaggerAnimation = (index: number, delay: number = 50) => {
  return {
    style: {
      animationDelay: `${index * delay}ms`,
    },
    className: 'animate-in slide-in-from-left-4 fade-in duration-300 fill-mode-both',
  };
};

export const useHoverAnimation = (isHovered: boolean) => {
  return {
    className: `transition-all duration-200 ${
      isHovered ? 'transform translate-x-1 scale-105' : 'transform translate-x-0 scale-100'
    }`,
  };
};

// Micro-interaction effects
export const microInteractions = {
  // Ripple effect for clicks
  ripple: (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'absolute inset-0 rounded-full bg-current opacity-25 animate-ping';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  },
  
  // Shake effect for errors
  shake: (element: HTMLElement) => {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'wiggle 0.5s ease-in-out';
    
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  },
  
  // Bounce effect for success
  bounce: (element: HTMLElement) => {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = 'bounce 0.6s ease-in-out';
    
    setTimeout(() => {
      element.style.animation = '';
    }, 600);
  },
  
  // Glow effect for focus
  glow: (element: HTMLElement, duration: number = 1000) => {
    element.style.animation = `glow ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  },
};

// Performance optimized animations
export const performanceOptimized = {
  // Use transform instead of changing layout properties
  translate: (x: number, y: number = 0) => ({
    transform: `translate3d(${x}px, ${y}px, 0)`,
  }),
  
  // Use opacity for fade effects
  fade: (opacity: number) => ({
    opacity,
    transition: 'opacity 200ms ease-out',
  }),
  
  // Use scale for size changes
  scale: (scale: number) => ({
    transform: `scale3d(${scale}, ${scale}, 1)`,
  }),
  
  // Combined transform for complex animations
  combined: (x: number, y: number, scale: number, rotate: number) => ({
    transform: `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1) rotate(${rotate}deg)`,
  }),
};

// Accessibility considerations
export const accessibleAnimations = {
  // Respect user's motion preferences
  respectMotionPreference: () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion ? 'transition-none' : 'transition-all duration-200';
  },
  
  // Provide alternative feedback for animations
  alternativeFeedback: (element: HTMLElement, message: string) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Provide screen reader feedback instead of visual animation
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      element.appendChild(announcement);
      
      setTimeout(() => {
        announcement.remove();
      }, 1000);
    }
  },
};

export default {
  animationConfig,
  createAnimationClasses,
  keyframes,
  useStaggerAnimation,
  useHoverAnimation,
  microInteractions,
  performanceOptimized,
  accessibleAnimations,
};