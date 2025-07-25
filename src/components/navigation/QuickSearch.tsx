import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useNavigation } from '../../hooks/useNavigation';
// Removed SCSS module import - using Tailwind CSS classes

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  maxResults?: number;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'content' | 'user' | 'action';
  url: string;
  category: string;
  icon?: React.ReactNode;
  relevanceScore: number;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ 
  isOpen, 
  onClose, 
  placeholder = "Search everything...",
  maxResults = 8 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    'İstifadəçilər', 'Sorğular', 'Hesabatlar', 'Tapşırıqlar', 'Sənədlər'
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { menuItems } = useNavigation();

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockResults: SearchResult[] = [];
    
    // Search through navigation items
    if (menuItems) {
      menuItems.forEach((item) => {
        const title = item.title || item.name || '';
        const path = item.path || item.href || '';
        
        if (title.toLowerCase().includes(searchQuery.toLowerCase())) {
          mockResults.push({
            id: `nav-${item.id}`,
            title,
            description: `Navigate to ${title}`,
            type: 'page',
            url: path,
            category: 'Navigation',
            icon: item.icon ? <item.icon size={16} /> : undefined,
            relevanceScore: title.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 10 : 5
          });
        }
        
        // Search sub-items
        if (item.children) {
          item.children.forEach((child) => {
            const childTitle = child.title || child.name || '';
            const childPath = child.path || child.href || '';
            
            if (childTitle.toLowerCase().includes(searchQuery.toLowerCase())) {
              mockResults.push({
                id: `nav-${child.id}`,
                title: childTitle,
                description: `Navigate to ${childTitle}`,
                type: 'page',
                url: childPath,
                category: title,
                icon: child.icon ? <child.icon size={16} /> : undefined,
                relevanceScore: childTitle.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 8 : 3
              });
            }
          });
        }
      });
    }
    
    // Add mock content results
    const contentResults: SearchResult[] = [
      {
        id: 'content-1',
        title: 'User Management Guide',
        description: 'Learn how to manage users and permissions in the system',
        type: 'content',
        url: '/help/user-management',
        category: 'Documentation',
        relevanceScore: searchQuery.toLowerCase().includes('user') ? 9 : 2
      },
      {
        id: 'content-2',
        title: 'Survey Creation Tutorial',
        description: 'Step-by-step guide to creating effective surveys',
        type: 'content',
        url: '/help/surveys',
        category: 'Documentation',
        relevanceScore: searchQuery.toLowerCase().includes('survey') ? 9 : 2
      },
      {
        id: 'action-1',
        title: 'Create New Survey',
        description: 'Quickly create a new survey',
        type: 'action',
        url: '/surveys/create',
        category: 'Quick Actions',
        relevanceScore: searchQuery.toLowerCase().includes('create') || searchQuery.toLowerCase().includes('survey') ? 8 : 1
      }
    ];
    
    // Filter and sort results
    const allResults = [...mockResults, ...contentResults]
      .filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
    
    setIsLoading(false);
    return allResults;
  };

  // Handle search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        const searchResults = await performSearch(query);
        setResults(searchResults);
        setSelectedIndex(0);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, maxResults]);

  // Handle navigation
  const handleResultSelect = (result: SearchResult) => {
    navigate(result.url);
    addToRecentSearches(query);
    onClose();
  };

  // Add to recent searches
  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5);
      localStorage.setItem('quickSearch.recent', JSON.stringify(updated));
      return updated;
    });
  };

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('quickSearch.recent');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultSelect(results[selectedIndex]);
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
  }, [isOpen, results, selectedIndex, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh]" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <FiSearch className="text-gray-400 mr-3" size={20} />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 py-2 px-1 border-none outline-none text-lg text-gray-900 placeholder-gray-500 bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors mr-2"
            >
              <FiX size={16} />
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching...</span>
            </div>
          )}

          {!query && !isLoading && (
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
                    <FiClock size={16} />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 cursor-pointer transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.suggestionGroup}>
                <div className={styles.suggestionHeader}>
                  <FiTrendingUp size={16} />
                  <span>Popular Searches</span>
                </div>
                <div className={styles.suggestionList}>
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 cursor-pointer transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query && !isLoading && results.length > 0 && (
            <div className="">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span>Search Results</span>
                <span className="text-sm font-medium text-gray-600">{results.length} found</span>
              </div>
              <div className="">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleResultSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {result.icon && (
                      <div className="w-10 h-10 flex items-center justify-center text-gray-500 mr-3">{result.icon}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-1 truncate">{result.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {result.description}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">{result.category}</span>
                      <span className="text-xs text-blue-600 font-medium">{result.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && !isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiSearch size={32} />
              <h3>No results found</h3>
              <p>Try adjusting your search or browse popular searches above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;