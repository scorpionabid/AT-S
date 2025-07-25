import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description: string;
  category?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  capturePhase?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, capturePhase = false } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const metaMatches = Boolean(shortcut.metaKey) === event.metaKey;
      const ctrlMatches = Boolean(shortcut.ctrlKey) === event.ctrlKey;
      const altMatches = Boolean(shortcut.altKey) === event.altKey;
      const shiftMatches = Boolean(shortcut.shiftKey) === event.shiftKey;

      return keyMatches && metaMatches && ctrlMatches && altMatches && shiftMatches;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.callback();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown, capturePhase);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, capturePhase);
    };
  }, [handleKeyDown, enabled, capturePhase]);

  return {
    shortcuts: shortcutsRef.current
  };
};

// Pre-defined common shortcuts
export const createCommonShortcuts = (
  onCommandPalette: () => void,
  onQuickSearch: () => void,
  onHelp?: () => void
): KeyboardShortcut[] => [
  {
    key: 'k',
    metaKey: true,
    callback: onCommandPalette,
    description: 'Open command palette',
    category: 'Navigation'
  },
  {
    key: 'k',
    ctrlKey: true,
    callback: onCommandPalette,
    description: 'Open command palette',
    category: 'Navigation'
  },
  {
    key: '/',
    callback: onQuickSearch,
    description: 'Quick search',
    category: 'Search'
  },
  {
    key: 's',
    metaKey: true,
    callback: onQuickSearch,
    description: 'Search',
    category: 'Search'
  },
  {
    key: 's',
    ctrlKey: true,
    callback: onQuickSearch,
    description: 'Search',
    category: 'Search'
  },
  ...(onHelp ? [{
    key: '?',
    callback: onHelp,
    description: 'Show help',
    category: 'Help'
  }] : [])
];

// Hook for managing global app shortcuts
export const useGlobalShortcuts = () => {
  const shortcuts = useRef<Map<string, KeyboardShortcut>>(new Map());

  const addShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    shortcuts.current.set(id, shortcut);
  }, []);

  const removeShortcut = useCallback((id: string) => {
    shortcuts.current.delete(id);
  }, []);

  const getShortcuts = useCallback(() => {
    return Array.from(shortcuts.current.values());
  }, []);

  const getShortcutsByCategory = useCallback((category: string) => {
    return Array.from(shortcuts.current.values()).filter(
      shortcut => shortcut.category === category
    );
  }, []);

  return {
    addShortcut,
    removeShortcut,
    getShortcuts,
    getShortcutsByCategory
  };
};