/**
 * ATİS Z-Index Management System
 * Organized z-index hierarchy və conflict prevention
 */

// Z-index hierarchy constants
export const Z_INDEX = {
  // Base layer (0-99)
  BASE: 0,
  BELOW: -1,
  
  // Content layers (100-199)
  DROPDOWN: 100,
  POPOVER: 110,
  TOOLTIP_TRIGGER: 120,
  
  // Navigation layers (200-299)
  STICKY_HEADER: 200,
  BREADCRUMB: 210,
  TAB_NAVIGATION: 220,
  
  // Layout layers (300-799)
  FIXED_ELEMENTS: 300,
  FLOATING_ACTIONS: 400,
  SIDEBAR: 500,
  HEADER: 600,
  MOBILE_MENU: 700,
  
  // Overlay layers (800-999)
  BACKDROP: 800,
  DRAWER: 850,
  MODAL_BACKDROP: 900,
  MODAL_CONTENT: 910,
  
  // System layers (1000+)
  TOOLTIP: 1000,
  NOTIFICATION: 1100,
  TOAST: 1200,
  LOADING_OVERLAY: 1300,
  DEBUG_PANEL: 9000,
  DEVELOPMENT_TOOLS: 9999
} as const;

// Type for z-index keys
export type ZIndexKey = keyof typeof Z_INDEX;

// Z-index utility functions
export class ZIndexManager {
  // Get z-index value
  static get(key: ZIndexKey): number {
    return Z_INDEX[key];
  }

  // Get z-index as CSS value
  static css(key: ZIndexKey): string {
    return Z_INDEX[key].toString();
  }

  // Get z-index as CSS variable
  static cssVar(key: ZIndexKey): string {
    const kebabKey = key.toLowerCase().replace(/_/g, '-');
    return `var(--z-${kebabKey})`;
  }

  // Check if one z-index is above another
  static isAbove(upper: ZIndexKey, lower: ZIndexKey): boolean {
    return Z_INDEX[upper] > Z_INDEX[lower];
  }

  // Get all z-index values for CSS variables
  static getCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};
    
    Object.entries(Z_INDEX).forEach(([key, value]) => {
      const kebabKey = key.toLowerCase().replace(/_/g, '-');
      variables[`--z-${kebabKey}`] = value.toString();
    });
    
    return variables;
  }

  // Generate CSS variables string
  static generateCSSVariables(): string {
    const variables = this.getCSSVariables();
    return Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
  }

  // Validate z-index hierarchy
  static validateHierarchy(): { isValid: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    const entries = Object.entries(Z_INDEX);
    
    // Check for duplicate values
    const valueMap = new Map<number, string[]>();
    entries.forEach(([key, value]) => {
      if (!valueMap.has(value)) {
        valueMap.set(value, []);
      }
      valueMap.get(value)!.push(key);
    });
    
    valueMap.forEach((keys, value) => {
      if (keys.length > 1) {
        conflicts.push(`Duplicate z-index ${value}: ${keys.join(', ')}`);
      }
    });
    
    // Check logical hierarchy
    const checks = [
      ['SIDEBAR', 'HEADER', 'Sidebar should be below header'],
      ['HEADER', 'MODAL_BACKDROP', 'Header should be below modal backdrop'],
      ['MODAL_BACKDROP', 'MODAL_CONTENT', 'Modal backdrop should be below modal content'],
      ['MODAL_CONTENT', 'TOOLTIP', 'Modal content should be below tooltip'],
      ['DROPDOWN', 'MODAL_BACKDROP', 'Dropdown should be below modal backdrop']
    ] as const;
    
    checks.forEach(([lower, upper, message]) => {
      if (Z_INDEX[lower] >= Z_INDEX[upper]) {
        conflicts.push(`${message}: ${lower}(${Z_INDEX[lower]}) >= ${upper}(${Z_INDEX[upper]})`);
      }
    });
    
    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  }

  // Get component-specific z-index recommendations
  static getComponentRecommendations(): Record<string, { zIndex: ZIndexKey; reason: string }> {
    return {
      'Header': {
        zIndex: 'HEADER',
        reason: 'Fixed header should be above content but below modals'
      },
      'Sidebar': {
        zIndex: 'SIDEBAR',
        reason: 'Sidebar should be below header for mobile overlay behavior'
      },
      'Dropdown': {
        zIndex: 'DROPDOWN',
        reason: 'Dropdowns should appear above content but below modals'
      },
      'Modal': {
        zIndex: 'MODAL_CONTENT',
        reason: 'Modals should be above all other content'
      },
      'ModalBackdrop': {
        zIndex: 'MODAL_BACKDROP',
        reason: 'Modal backdrop should be below modal content'
      },
      'Tooltip': {
        zIndex: 'TOOLTIP',
        reason: 'Tooltips should appear above everything except system notifications'
      },
      'Toast': {
        zIndex: 'TOAST',
        reason: 'Toast notifications should be above tooltips'
      },
      'LoadingOverlay': {
        zIndex: 'LOADING_OVERLAY',
        reason: 'Loading overlays should be above all content during loading states'
      }
    };
  }

  // Debug helper
  static debugCurrentState(): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('🏗️ Z-Index Hierarchy Debug');
      
      const validation = this.validateHierarchy();
      console.log('Hierarchy Valid:', validation.isValid);
      
      if (validation.conflicts.length > 0) {
        console.warn('Conflicts:', validation.conflicts);
      }
      
      console.table(Z_INDEX);
      console.groupEnd();
    }
  }
}

// CSS-in-JS helper for z-index
export const zIndex = {
  get: (key: ZIndexKey) => ZIndexManager.get(key),
  css: (key: ZIndexKey) => ZIndexManager.css(key),
  var: (key: ZIndexKey) => ZIndexManager.cssVar(key)
};

// React hook for z-index management
export const useZIndex = () => {
  return {
    get: ZIndexManager.get,
    css: ZIndexManager.css,
    cssVar: ZIndexManager.cssVar,
    isAbove: ZIndexManager.isAbove,
    validate: ZIndexManager.validateHierarchy,
    debug: ZIndexManager.debugCurrentState
  };
};

// HOC for z-index debugging
export function withZIndexDebug<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  expectedZIndex: ZIndexKey
) {
  return React.memo<P>((props) => {
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🏗️ ${componentName} z-index:`, {
          expected: expectedZIndex,
          value: ZIndexManager.get(expectedZIndex),
          cssVar: ZIndexManager.cssVar(expectedZIndex)
        });
      }
    }, []);

    return React.createElement(Component, props);
  });
}

export default {
  Z_INDEX,
  ZIndexManager,
  zIndex,
  useZIndex,
  withZIndexDebug
};