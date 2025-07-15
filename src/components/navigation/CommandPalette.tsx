import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import { FiSearch, FiCommand, FiX, FiClock, FiArrowRight, FiStar } from 'react-icons/fi';
import styles from './CommandPalette.module.scss';

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className={styles.searchInput}
            />
            <div className={styles.shortcut}>
              <FiCommand size={14} />
              <span>K</span>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={20} />
          </button>
        </div>

        {/* Results */}
        <div className={styles.content}>
          {filteredCommands.length > 0 ? (
            <>
              {!query && (
                <div className={styles.sectionHeader}>
                  <FiClock size={16} />
                  <span>Recent & Favorites</span>
                </div>
              )}
              
              <ul ref={resultListRef} className={styles.resultList}>
                {filteredCommands.map((command, index) => (
                  <li
                    key={command.id}
                    className={`${styles.resultItem} ${
                      index === selectedIndex ? styles.selected : ''
                    }`}
                    onClick={() => {
                      command.action();
                      setSelectedIndex(index);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className={styles.resultIcon}>
                      {command.icon}
                    </div>
                    
                    <div className={styles.resultContent}>
                      <div className={styles.resultTitle}>
                        {command.title}
                        {command.isFavorite && (
                          <FiStar className={styles.favoriteIcon} size={12} />
                        )}
                      </div>
                      {command.description && (
                        <div className={styles.resultDescription}>
                          {command.description}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.resultMeta}>
                      <span className={styles.category}>{command.category}</span>
                      {command.shortcut && (
                        <div className={styles.shortcutDisplay}>
                          {command.shortcut.map((key, i) => (
                            <kbd key={i} className={styles.key}>{key}</kbd>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(command.id);
                        }}
                        className={styles.favoriteButton}
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
            <div className={styles.noResults}>
              <FiSearch size={24} />
              <p>No commands found</p>
              <p>Try searching for something else</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerItem}>
            <kbd className={styles.key}>↑</kbd>
            <kbd className={styles.key}>↓</kbd>
            <span>navigate</span>
          </div>
          <div className={styles.footerItem}>
            <kbd className={styles.key}>↵</kbd>
            <span>select</span>
          </div>
          <div className={styles.footerItem}>
            <kbd className={styles.key}>esc</kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;