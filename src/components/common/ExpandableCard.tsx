import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { Icon, IconName } from './Icon';
import { Card, CardHeader, CardContent } from './Card';
import { Button } from './Button';

interface ExpandableCardProps {
  title: string;
  summary?: string;
  icon?: IconName;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  headerAction?: React.ReactNode;
  collapsible?: boolean;
}

interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultExpandedItems?: string[];
  className?: string;
}

interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
  className?: string;
}

// Individual Expandable Card
export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  summary,
  icon,
  children,
  defaultExpanded = false,
  onToggle,
  className = '',
  headerAction,
  collapsible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!collapsible) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  // Animate height changes
  useEffect(() => {
    if (!contentRef.current) return;

    if (isExpanded) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(scrollHeight);
      
      // Set to auto after animation completes
      const timer = setTimeout(() => {
        setHeight('auto');
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setHeight(contentRef.current.scrollHeight);
      // Force reflow
      contentRef.current.offsetHeight;
      setHeight(0);
    }
  }, [isExpanded]);

  return (
    <Card
      className={classNames(
        'expandable-card',
        {
          'expandable-card--expanded': isExpanded,
          'expandable-card--collapsible': collapsible,
        },
        className
      )}
      variant="outlined"
    >
      <CardHeader
        className={classNames(
          'expandable-card__header',
          { 'expandable-card__header--clickable': collapsible }
        )}
        onClick={collapsible ? toggle : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        } : undefined}
      >
        <div className="expandable-card__header-content">
          {icon && (
            <div className="expandable-card__icon">
              <Icon name={icon} size={20} />
            </div>
          )}
          
          <div className="expandable-card__text">
            <h3 className="expandable-card__title">{title}</h3>
            {summary && (
              <p className="expandable-card__summary">{summary}</p>
            )}
          </div>
        </div>

        <div className="expandable-card__header-actions">
          {headerAction && (
            <div className="expandable-card__action">
              {headerAction}
            </div>
          )}
          
          {collapsible && (
            <div className="expandable-card__toggle">
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                className="expandable-card__chevron"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <div
        ref={contentRef}
        className="expandable-card__content"
        style={{
          height: height === 'auto' ? 'auto' : `${height}px`,
          overflow: height === 'auto' ? 'visible' : 'hidden',
        }}
      >
        <CardContent className="expandable-card__body">
          {children}
        </CardContent>
      </div>
    </Card>
  );
};

// Accordion Context
const AccordionContext = React.createContext<{
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
} | null>(null);

// Accordion Container
export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  defaultExpandedItems = [],
  className = '',
}) => {
  const [expandedItems, setExpandedItems] = useState(
    new Set(defaultExpandedItems)
  );

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, allowMultiple }}>
      <div className={classNames('accordion', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

// Accordion Item
export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  icon,
  badge,
  disabled = false,
  className = '',
}) => {
  const context = React.useContext(AccordionContext);
  
  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  const { expandedItems, toggleItem } = context;
  const isExpanded = expandedItems.has(id);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  const handleToggle = () => {
    if (disabled) return;
    toggleItem(id);
  };

  // Animate height changes
  useEffect(() => {
    if (!contentRef.current) return;

    if (isExpanded) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(scrollHeight);
      
      const timer = setTimeout(() => {
        setHeight('auto');
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setHeight(contentRef.current.scrollHeight);
      contentRef.current.offsetHeight;
      setHeight(0);
    }
  }, [isExpanded]);

  return (
    <div
      className={classNames(
        'accordion__item',
        {
          'accordion__item--expanded': isExpanded,
          'accordion__item--disabled': disabled,
        },
        className
      )}
    >
      <button
        className="accordion__header"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${id}`}
      >
        <div className="accordion__header-content">
          {icon && (
            <div className="accordion__icon">
              <Icon name={icon} size={18} />
            </div>
          )}
          
          <span className="accordion__title">{title}</span>
          
          {badge && (
            <span className="accordion__badge">{badge}</span>
          )}
        </div>

        <div className="accordion__toggle">
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            className="accordion__chevron"
          />
        </div>
      </button>

      <div
        ref={contentRef}
        id={`accordion-content-${id}`}
        className="accordion__content"
        style={{
          height: height === 'auto' ? 'auto' : `${height}px`,
          overflow: height === 'auto' ? 'visible' : 'hidden',
        }}
      >
        <div className="accordion__body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Progressive Disclosure Hook
export const useProgressiveDisclosure = (initialState = false) => {
  const [isRevealed, setIsRevealed] = useState(initialState);

  const reveal = () => setIsRevealed(true);
  const hide = () => setIsRevealed(false);
  const toggle = () => setIsRevealed(prev => !prev);

  return {
    isRevealed,
    reveal,
    hide,
    toggle,
  };
};

// Show More/Less Component
interface ShowMoreProps {
  children: React.ReactNode;
  maxHeight?: number;
  showMoreText?: string;
  showLessText?: string;
  className?: string;
}

export const ShowMore: React.FC<ShowMoreProps> = ({
  children,
  maxHeight = 200,
  showMoreText = 'Daha çox göstər',
  showLessText = 'Az göstər',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setShouldShowToggle(contentHeight > maxHeight);
    }
  }, [maxHeight, children]);

  return (
    <div className={classNames('show-more', className)}>
      <div
        ref={contentRef}
        className="show-more__content"
        style={{
          maxHeight: !isExpanded && shouldShowToggle ? `${maxHeight}px` : 'none',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {shouldShowToggle && (
        <div className="show-more__toggle">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            rightIcon={isExpanded ? 'chevron-up' : 'chevron-down'}
          >
            {isExpanded ? showLessText : showMoreText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;