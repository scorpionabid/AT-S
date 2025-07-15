import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import { FiSearch, FiCommand, FiX, FiClock, FiArrowRight, FiStar } from 'react-icons/fi';
// Removed SCSS module import - using Tailwind CSS classes

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords: string[];
  shortcut?: string[];
  isFavorite?: boolean;
  lastUsed?: Date;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [favoriteCommands, setFavoriteCommands] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultListRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { menuItems } = useNavigation();

  // Generate commands from navigation items and common actions
  const allCommands = useMemo<CommandItem[]>(() => {
    const commands: CommandItem[] = [];

    // Navigation commands from menu items
    if (menuItems) {
      menuItems.forEach((item) => {
        commands.push({
          id: `nav-${item.id}`,
          title: item.title || item.name || '',
          description: `Navigate to ${item.title || item.name}`,
          category: 'Navigation',
          icon: item.icon ? <item.icon size={16} /> : <FiArrowRight size={16} />,
          action: () => {
            navigate(item.path || item.href || '');
            addToRecent(`nav-${item.id}`);
            onClose();
          },
          keywords: [item.title || '', item.name || '', 'page', 'navigate'],
          isFavorite: favoriteCommands.includes(`nav-${item.id}`)
        });

        // Add sub-navigation commands
        if (item.children) {
          item.children.forEach((child) => {
            commands.push({
              id: `nav-${child.id}`,
              title: child.title || child.name || '',
              description: `Navigate to ${child.title || child.name}`,
              category: 'Navigation',
              icon: child.icon ? <child.icon size={16} /> : <FiArrowRight size={16} />,
              action: () => {
                navigate(child.path || child.href || '');
                addToRecent(`nav-${child.id}`);
                onClose();
              },
              keywords: [child.title || '', child.name || '', 'page', 'navigate'],
              isFavorite: favoriteCommands.includes(`nav-${child.id}`)
            });
          });
        }
      });
    }

    // Common action commands
    const actionCommands: CommandItem[] = [
      {
        id: 'action-search',
        title: 'Global Search',
        description: 'Search across all content',
        category: 'Actions',
        icon: <FiSearch size={16} />,
        action: () => {
          // Implement global search
          console.log('Opening global search...');
          addToRecent('action-search');
          onClose();
        },
        keywords: ['search', 'find', 'look', 'query'],
        shortcut: ['⌘', 'K'],
        isFavorite: favoriteCommands.includes('action-search')
      },
      {
        id: 'action-profile',
        title: 'View Profile',
        description: 'View your user profile',
        category: 'Actions',
        icon: <FiStar size={16} />,
        action: () => {
          navigate('/profile');
          addToRecent('action-profile');
          onClose();
        },
        keywords: ['profile', 'user', 'account', 'settings'],
        isFavorite: favoriteCommands.includes('action-profile')
      },
      {
        id: 'action-help',
        title: 'Help & Documentation',
        description: 'View help and documentation',
        category: 'Actions',
        icon: <FiSearch size={16} />,
        action: () => {
          // Open help
          console.log('Opening help...');
          addToRecent('action-help');
          onClose();
        },
        keywords: ['help', 'documentation', 'support', 'guide'],
        shortcut: ['?'],
        isFavorite: favoriteCommands.includes('action-help')
      }
    ];

    return [...commands, ...actionCommands];
  }, [menuItems, favoriteCommands, navigate, onClose]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show recent and favorite commands when no query
      const recent = allCommands.filter(cmd => recentCommands.includes(cmd.id));
      const favorites = allCommands.filter(cmd => cmd.isFavorite);
      return [...favorites, ...recent].slice(0, 10);
    }

    const searchTerm = query.toLowerCase().trim();
    return allCommands
      .filter(command => 
        command.title.toLowerCase().includes(searchTerm) ||
        command.description?.toLowerCase().includes(searchTerm) ||
        command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      )
      .sort((a, b) => {
        // Prioritize exact title matches
        const aExact = a.title.toLowerCase().startsWith(searchTerm) ? 1 : 0;
        const bExact = b.title.toLowerCase().startsWith(searchTerm) ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        
        // Then favorites
        const aFav = a.isFavorite ? 1 : 0;
        const bFav = b.isFavorite ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        
        // Then recent
        const aRecent = recentCommands.includes(a.id) ? 1 : 0;
        const bRecent = recentCommands.includes(b.id) ? 1 : 0;
        return bRecent - aRecent;
      })
      .slice(0, 10);
  }, [query, allCommands, recentCommands]);

  // Add command to recent list
  const addToRecent = (commandId: string) => {
    setRecentCommands(prev => {
      const updated = [commandId, ...prev.filter(id => id !== commandId)].slice(0, 5);
      localStorage.setItem('commandPalette.recent', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle favorite command
  const toggleFavorite = (commandId: string) => {
    setFavoriteCommands(prev => {
      const updated = prev.includes(commandId)
        ? prev.filter(id => id !== commandId)
        : [...prev, commandId];
      localStorage.setItem('commandPalette.favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Load saved state
  useEffect(() => {
    const savedRecent = localStorage.getItem('commandPalette.recent');
    const savedFavorites = localStorage.getItem('commandPalette.favorites');
    
    if (savedRecent) {
      setRecentCommands(JSON.parse(savedRecent));
    }
    
    if (savedFavorites) {
      setFavoriteCommands(JSON.parse(savedFavorites));
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultListRef.current) {
      const selectedElement = resultListRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center flex-1 relative">
            <FiSearch className="absolute left-3 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="w-full pl-10 pr-16 py-2 border-none outline-none text-gray-900 placeholder-gray-500 bg-transparent"
            />
            <div className="absolute right-3 flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
              <FiCommand size={14} />
              <span>K</span>
            </div>
          </div>
          <button onClick={onClose} className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors">&
            <FiX size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <>
              {!query && (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b border-gray-100">
                  <FiClock size={16} />
                  <span>Recent & Favorites</span>
                </div>
              )}
              
              <ul ref={resultListRef} className="py-1">&
                {filteredCommands.map((command, index) => (
                  <li
                    key={command.id}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => {
                      command.action();
                      setSelectedIndex(index);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >&
                    <div className="w-8 h-8 flex items-center justify-center text-gray-500 mr-3">
                      {command.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {command.title}
                        {command.isFavorite && (
                          <FiStar className="text-yellow-500" size={12} />
                        )}
                      </div>
                      {command.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {command.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">{command.category}</span>
                      {command.shortcut && (
                        <div className="flex gap-1">
                          {command.shortcut.map((key, i) => (
                            <kbd key={i} className="px-1.5 py-0.5 text-xs bg-gray-200 rounded border border-gray-300 font-mono">{key}</kbd>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(command.id);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                        title={command.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <FiStar 
                          size={14} 
                          fill={command.isFavorite ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiSearch size={24} />
              <p>No commands found</p>
              <p>Try searching for something else</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">↓</kbd>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">↵</kbd>
            <span>select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 font-mono">esc</kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;