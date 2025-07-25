import React, { useState, useRef, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';
import { Card, CardContent } from './Card';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: string;
  icon?: IconName;
  url?: string;
  metadata?: Record<string, any>;
}

interface SearchCategory {
  id: string;
  name: string;
  icon: IconName;
  color: string;
}

interface SmartSearchProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  categories?: SearchCategory[];
  recentSearches?: string[];
  shortcuts?: SearchResult[];
  maxResults?: number;
  className?: string;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
}

interface SearchHighlightProps {
  text: string;
  highlight: string;
}

// Text highlighting component
const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.filter(String).map((part, i) => (
        regex.test(part) ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </span>
  );
};

export const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = 'Axtarış...',
  onSearch,
  onSelect,
  categories = [],
  recentSearches = [],
  shortcuts = [],
  maxResults = 10,
  className = '',
  autoFocus = false,
  clearOnSelect = true,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await onSearch(searchQuery);
      let filteredResults = searchResults;

      // Filter by category if selected
      if (selectedCategory) {
        filteredResults = searchResults.filter(result => 
          result.category === selectedCategory
        );
      }

      setResults(filteredResults.slice(0, maxResults));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < currentResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : currentResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          handleSelectResult(currentResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    onSelect(result);
    
    if (clearOnSelect) {
      setQuery('');
      setResults([]);
    }
    
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Current results to display
  const currentResults = useMemo(() => {
    if (query.trim()) {
      return results;
    }
    
    // Show shortcuts and recent searches when no query
    const combined = [...shortcuts];
    
    recentSearches.forEach(search => {
      combined.push({
        id: `recent-${search}`,
        title: search,
        category: 'recent',
        icon: 'clock',
      });
    });
    
    return combined.slice(0, maxResults);
  }, [query, results, shortcuts, recentSearches, maxResults]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    
    currentResults.forEach(result => {
      if (!groups[result.category]) {
        groups[result.category] = [];
      }
      groups[result.category].push(result);
    });
    
    return groups;
  }, [currentResults]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={containerRef} className={classNames('smart-search', className)}>
      <div className="smart-search__input-container">
        <Icon name="search" size={20} className="smart-search__search-icon" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="smart-search__input"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="smart-search__clear-button"
            aria-label="Axtarışı təmizlə"
          >
            <Icon name="x" size={16} />
          </button>
        )}

        {isLoading && (
          <div className="smart-search__loading">
            <Icon name="loader" size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {/* Categories filter */}
      {categories.length > 0 && (
        <div className="smart-search__categories">
          <button
            onClick={() => setSelectedCategory(null)}
            className={classNames(
              'smart-search__category-btn',
              { 'smart-search__category-btn--active': !selectedCategory }
            )}
          >
            Hamısı
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={classNames(
                'smart-search__category-btn',
                { 'smart-search__category-btn--active': selectedCategory === category.id }
              )}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <Icon name={category.icon} size={14} />
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && (
        <Card className="smart-search__results" variant="elevated">
          <CardContent padding="none">
            {currentResults.length > 0 ? (
              <div ref={resultsRef} className="smart-search__results-list" role="listbox">
                {Object.entries(groupedResults).map(([categoryId, categoryResults]) => (
                  <div key={categoryId} className="smart-search__results-group">
                    {Object.keys(groupedResults).length > 1 && (
                      <div className="smart-search__group-header">
                        {categories.find(c => c.id === categoryId)?.name || categoryId}
                      </div>
                    )}
                    {categoryResults.map((result, index) => {
                      const globalIndex = currentResults.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className={classNames(
                            'smart-search__result-item',
                            { 'smart-search__result-item--selected': globalIndex === selectedIndex }
                          )}
                          role="option"
                          aria-selected={globalIndex === selectedIndex}
                        >
                          {result.icon && (
                            <div className="smart-search__result-icon">
                              <Icon name={result.icon} size={16} />
                            </div>
                          )}
                          
                          <div className="smart-search__result-content">
                            <div className="smart-search__result-title">
                              <SearchHighlight text={result.title} highlight={query} />
                            </div>
                            {result.subtitle && (
                              <div className="smart-search__result-subtitle">
                                <SearchHighlight text={result.subtitle} highlight={query} />
                              </div>
                            )}
                            {result.description && (
                              <div className="smart-search__result-description">
                                <SearchHighlight text={result.description} highlight={query} />
                              </div>
                            )}
                          </div>

                          {result.category === 'recent' && (
                            <div className="smart-search__result-meta">
                              <Icon name="clock" size={12} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="smart-search__no-results">
                <Icon name="search" size={24} className="smart-search__no-results-icon" />
                <p>Heç bir nəticə tapılmadı</p>
                <p className="smart-search__no-results-hint">
                  Başqa açar sözlər cəhd edin
                </p>
              </div>
            ) : !query ? (
              <div className="smart-search__empty-state">
                <Icon name="search" size={24} className="smart-search__empty-icon" />
                <p>Axtarış üçün yazın</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartSearch;