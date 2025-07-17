import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiCommand, FiArrowRight, FiClock } from 'react-icons/fi';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import { searchMenuItems } from '../../utils/navigation/menuConfig';
import { cn } from '../../utils/cn';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface SearchResult {
  id: string;
  title: string;
  path: string;
  description?: string;
  category?: string;
  icon?: React.ComponentType<any>;
  type: 'page' | 'action' | 'recent';
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const { menuItems } = useNavigation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      // Show recent searches when no query
      return recentSearches.slice(0, 5).map(recent => ({
        id: `recent-${recent}`,
        title: recent,
        path: '',
        type: 'recent' as const,
        description: 'Son axtarış'
      }));
    }

    const results: SearchResult[] = [];
    
    // Search menu items
    const menuResults = searchMenuItems(user, query);
    menuResults.forEach(item => {
      results.push({
        id: item.id,
        title: item.title,
        path: item.path,
        description: item.description,
        category: item.category,
        icon: item.icon,
        type: 'page'
      });
    });

    // Add quick actions if query matches
    const quickActions = [
      { title: 'Yeni İstifadəçi', path: '/users/create', description: 'İstifadəçi yaradın' },
      { title: 'Yeni Sorğu', path: '/surveys/create', description: 'Sorğu yaradın' },
      { title: 'Yeni Müəssisə', path: '/institutions/create', description: 'Müəssisə yaradın' },
      { title: 'Yeni Rol', path: '/roles/create', description: 'Rol yaradın' }
    ];

    quickActions.forEach(action => {
      if (action.title.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: `action-${action.path}`,
          title: action.title,
          path: action.path,
          description: action.description,
          type: 'action'
        });
      }
    });

    return results.slice(0, 8); // Limit results
  }, [query, user, recentSearches]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleResultSelect(searchResults[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('atis-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load recent searches:', error);
      }
    }
  }, []);

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'recent') {
      setQuery(result.title);
      return;
    }

    if (result.path) {
      // Save to recent searches
      const newRecentSearches = [
        query || result.title,
        ...recentSearches.filter(item => item !== (query || result.title))
      ].slice(0, 10);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('atis-recent-searches', JSON.stringify(newRecentSearches));

      // Navigate to result
      navigate(result.path);
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('atis-recent-searches');
  };

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'recent') {
      return <FiClock className="w-4 h-4 text-gray-400" />;
    }
    if (result.type === 'action') {
      return <FiArrowRight className="w-4 h-4 text-blue-500" />;
    }
    if (result.icon) {
      const Icon = result.icon;
      return <Icon className="w-4 h-4 text-gray-500" />;
    }
    return <FiSearch className="w-4 h-4 text-gray-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Search Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div 
          ref={overlayRef}
          className={cn(
            "w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden",
            "border border-gray-200",
            className
          )}
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <FiSearch className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Səhifələri, əməliyyatları axtarın..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="flex-1 outline-none text-gray-900 placeholder-gray-500"
            />
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 rounded">⌘K</kbd>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="py-2">
                {!query && recentSearches.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
                    <span>Son axtarışlar</span>
                    <button
                      onClick={clearRecentSearches}
                      className="hover:text-gray-700"
                    >
                      Təmizlə
                    </button>
                  </div>
                )}
                
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      "w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                      index === selectedIndex && "bg-blue-50 border-r-2 border-blue-500"
                    )}
                  >
                    <div className="mr-3">
                      {getResultIcon(result)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    {result.category && (
                      <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {result.category}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-gray-500">
                <FiSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>"{query}" üçün nəticə tapılmadı</p>
                <p className="text-sm mt-1">Başqa açar söz cəhd edin</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Axtarış etmək üçün yazmağa başlayın</p>
                <p className="text-sm mt-1">Səhifələr, əməliyyatlar və daha çox</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded mr-1">↑↓</kbd>
                  Naviqasiya
                </span>
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded mr-1">↵</kbd>
                  Seç
                </span>
                <span className="flex items-center">
                  <kbd className="px-1.5 py-0.5 bg-white border rounded mr-1">Esc</kbd>
                  Bağla
                </span>
              </div>
              <div>
                {searchResults.length} nəticə
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;