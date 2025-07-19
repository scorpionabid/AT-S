import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'sidebar' | 'actions' | 'system';
  enabled?: boolean;
}

interface UseGlobalKeyboardShortcutsOptions {
  enableShortcuts?: boolean;
  enableHelpModal?: boolean;
  customShortcuts?: KeyboardShortcut[];
}

export const useGlobalKeyboardShortcuts = (options: UseGlobalKeyboardShortcutsOptions = {}) => {
  const {
    enableShortcuts = true,
    enableHelpModal = true,
    customShortcuts = []
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    isCollapsed, 
    toggleCollapse, 
    isMobileOpen, 
    toggleMobile, 
    closeMobile,
    theme,
    toggleTheme 
  } = useLayout();
  
  const { 
    expandedItems, 
    toggleExpanded, 
    searchTerm, 
    setSearchTerm,
    clearSearch 
  } = useNavigation();

  const shortcutsRef = useRef<KeyboardShortcut[]>([]);
  const activeElementRef = useRef<Element | null>(null);
  const helpModalRef = useRef<boolean>(false);

  // Check if user has permission for navigation
  const canNavigate = useCallback((path: string) => {
    if (!user) return false;
    // Add role-based navigation checks here
    const userRoles = user.roles || [];
    
    // Basic role checks for common paths
    const roleChecks: { [key: string]: string[] } = {
      '/dashboard': ['superadmin', 'regionadmin', 'schooladmin', 'muellim'],
      '/users': ['superadmin', 'regionadmin'],
      '/institutions': ['superadmin', 'regionadmin'],
      '/surveys': ['superadmin', 'regionadmin', 'schooladmin', 'muellim'],
      '/roles': ['superadmin'],
      '/settings': ['superadmin', 'regionadmin', 'schooladmin'],
      '/reports': ['superadmin', 'regionadmin', 'schooladmin'],
      '/tasks': ['superadmin', 'regionadmin', 'schooladmin', 'muellim'],
      '/documents': ['superadmin', 'regionadmin', 'schooladmin', 'muellim'],
      '/approvals': ['superadmin', 'regionadmin', 'schooladmin', 'mudir']
    };

    const requiredRoles = roleChecks[path];
    if (!requiredRoles) return true; // No specific requirements
    
    return userRoles.some(role => requiredRoles.includes(role));
  }, [user]);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      altKey: true,
      description: 'Navigate to Dashboard',
      action: () => canNavigate('/dashboard') && navigate('/dashboard'),
      category: 'navigation',
      enabled: canNavigate('/dashboard')
    },
    {
      key: 'u',
      altKey: true,
      description: 'Navigate to Users',
      action: () => canNavigate('/users') && navigate('/users'),
      category: 'navigation',
      enabled: canNavigate('/users')
    },
    {
      key: 'i',
      altKey: true,
      description: 'Navigate to Institutions',
      action: () => canNavigate('/institutions') && navigate('/institutions'),
      category: 'navigation',
      enabled: canNavigate('/institutions')
    },
    {
      key: 's',
      altKey: true,
      description: 'Navigate to Surveys',
      action: () => canNavigate('/surveys') && navigate('/surveys'),
      category: 'navigation',
      enabled: canNavigate('/surveys')
    },
    {
      key: 'r',
      altKey: true,
      description: 'Navigate to Reports',
      action: () => canNavigate('/reports') && navigate('/reports'),
      category: 'navigation',
      enabled: canNavigate('/reports')
    },
    {
      key: 't',
      altKey: true,
      description: 'Navigate to Tasks',
      action: () => canNavigate('/tasks') && navigate('/tasks'),
      category: 'navigation',
      enabled: canNavigate('/tasks')
    },
    {
      key: 'd',
      altKey: true,
      description: 'Navigate to Documents',
      action: () => canNavigate('/documents') && navigate('/documents'),
      category: 'navigation',
      enabled: canNavigate('/documents')
    },
    {
      key: 'a',
      altKey: true,
      description: 'Navigate to Approvals',
      action: () => canNavigate('/approvals') && navigate('/approvals'),
      category: 'navigation',
      enabled: canNavigate('/approvals')
    },

    // Sidebar shortcuts
    {
      key: 'b',
      ctrlKey: true,
      description: 'Toggle Sidebar',
      action: () => toggleCollapse(),
      category: 'sidebar'
    },
    {
      key: 'm',
      ctrlKey: true,
      description: 'Toggle Mobile Menu',
      action: () => toggleMobile(),
      category: 'sidebar'
    },
    {
      key: 'Escape',
      description: 'Close Mobile Sidebar',
      action: () => isMobileOpen && closeMobile(),
      category: 'sidebar',
      enabled: isMobileOpen
    },

    // Search shortcuts
    {
      key: 'k',
      ctrlKey: true,
      description: 'Focus Search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="axtarın"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      category: 'actions'
    },
    {
      key: '/',
      description: 'Quick Search',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="axtarın"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      category: 'actions'
    },
    {
      key: 'Escape',
      description: 'Clear Search',
      action: () => {
        if (searchTerm) {
          clearSearch();
        }
      },
      category: 'actions',
      enabled: !!searchTerm
    },

    // Quick actions
    {
      key: 'n',
      ctrlKey: true,
      description: 'New Item (context-dependent)',
      action: () => {
        const currentPath = location.pathname;
        if (currentPath.includes('/surveys')) {
          navigate('/surveys/create');
        } else if (currentPath.includes('/users') && canNavigate('/users')) {
          // Trigger user creation modal or navigate to user creation
          const createButton = document.querySelector('[data-action="create-user"], button:has-text("Yeni İstifadəçi"), button:contains("New User")') as HTMLButtonElement;
          createButton?.click();
        } else if (currentPath.includes('/institutions') && canNavigate('/institutions')) {
          const createButton = document.querySelector('[data-action="create-institution"]') as HTMLButtonElement;
          createButton?.click();
        }
      },
      category: 'actions'
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh Current Page',
      action: () => {
        window.location.reload();
      },
      category: 'actions'
    },

    // System shortcuts
    {
      key: ',',
      ctrlKey: true,
      description: 'Open Settings',
      action: () => canNavigate('/settings') && navigate('/settings'),
      category: 'system',
      enabled: canNavigate('/settings')
    },
    {
      key: 'l',
      ctrlKey: true,
      shiftKey: true,
      description: 'Toggle Theme',
      action: () => toggleTheme(),
      category: 'system'
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show Keyboard Shortcuts Help',
      action: () => {
        helpModalRef.current = !helpModalRef.current;
        // Trigger help modal
        const event = new CustomEvent('toggle-shortcuts-help', { 
          detail: { show: helpModalRef.current } 
        });
        window.dispatchEvent(event);
      },
      category: 'system',
      enabled: enableHelpModal
    },

    // Navigation within page
    {
      key: 'g',
      description: 'Go to top of page',
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      category: 'navigation'
    },
    {
      key: 'G',
      shiftKey: true,
      description: 'Go to bottom of page',
      action: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
      category: 'navigation'
    },

    // Accessibility shortcuts
    {
      key: 'Tab',
      shiftKey: true,
      description: 'Previous focusable element',
      action: () => {
        // Handled by browser default behavior
      },
      category: 'navigation'
    },
    {
      key: 'Tab',
      description: 'Next focusable element',
      action: () => {
        // Handled by browser default behavior
      },
      category: 'navigation'
    },

    // Add custom shortcuts
    ...customShortcuts
  ];

  // Update shortcuts ref
  shortcutsRef.current = shortcuts.filter(shortcut => 
    shortcut.enabled !== false && enableShortcuts
  );

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableShortcuts) return;

    // Ignore shortcuts when user is typing in input fields
    const activeElement = document.activeElement;
    const isTyping = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true' ||
      activeElement.getAttribute('role') === 'textbox'
    );

    // Allow certain shortcuts even when typing (like Escape)
    const allowedWhenTyping = ['Escape', 'Tab'];
    if (isTyping && !allowedWhenTyping.includes(event.key)) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut =>
      shortcut.key.toLowerCase() === event.key.toLowerCase() &&
      !!shortcut.ctrlKey === event.ctrlKey &&
      !!shortcut.altKey === event.altKey &&
      !!shortcut.shiftKey === event.shiftKey &&
      !!shortcut.metaKey === event.metaKey &&
      shortcut.enabled !== false
    );

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        matchingShortcut.action();
        
        // Log shortcut usage in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Keyboard shortcut executed: ${matchingShortcut.description}`);
        }
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }, [enableShortcuts, location.pathname]);

  // Setup event listeners
  useEffect(() => {
    if (!enableShortcuts) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enableShortcuts]);

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback((category: string) => {
    return shortcutsRef.current.filter(shortcut => 
      shortcut.category === category && shortcut.enabled !== false
    );
  }, []);

  // Get all active shortcuts
  const getAllShortcuts = useCallback(() => {
    return shortcutsRef.current.filter(shortcut => shortcut.enabled !== false);
  }, []);

  // Format shortcut key combination for display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const parts: string[] = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push('Cmd');
    
    // Format special keys
    const keyName = {
      ' ': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Enter': '⏎',
      'Escape': 'Esc',
      'Tab': '⇥',
      'Backspace': '⌫',
      'Delete': '⌦'
    }[shortcut.key] || shortcut.key.toUpperCase();
    
    parts.push(keyName);
    
    return parts.join(' + ');
  }, []);

  return {
    shortcuts: shortcutsRef.current,
    getShortcutsByCategory,
    getAllShortcuts,
    formatShortcut,
    enableShortcuts
  };
};

// Hook for displaying keyboard shortcuts help
export const useKeyboardShortcutsHelp = () => {
  const [showHelp, setShowHelp] = useState(false);
  
  useEffect(() => {
    const handleToggleHelp = (event: CustomEvent) => {
      setShowHelp(event.detail.show);
    };
    
    window.addEventListener('toggle-shortcuts-help', handleToggleHelp as EventListener);
    
    return () => {
      window.removeEventListener('toggle-shortcuts-help', handleToggleHelp as EventListener);
    };
  }, []);
  
  return {
    showHelp,
    setShowHelp,
    toggleHelp: () => setShowHelp(prev => !prev),
    closeHelp: () => setShowHelp(false)
  };
};

export default useGlobalKeyboardShortcuts;