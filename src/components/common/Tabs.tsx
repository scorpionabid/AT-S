import { Children, type ReactNode, type ReactElement, useState, isValidElement } from 'react';
import classNames from 'classnames';

type TabVariant = 'default' | 'pills' | 'underline' | 'outline';
type TabSize = 'sm' | 'md' | 'lg';
type TabPosition = 'start' | 'center' | 'end' | 'stretch';

interface TabProps {
  children: ReactNode;
  value?: number | string;
  label?: string;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

interface TabsProps {
  children: ReactElement<TabProps> | ReactElement<TabProps>[];
  className?: string;
  variant?: TabVariant;
  size?: TabSize;
  position?: TabPosition;
  fullWidth?: boolean;
  defaultActiveTab?: number | string;
  onChange?: (activeTab: number | string) => void;
}

const Tabs = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  position = 'start',
  fullWidth = false,
  defaultActiveTab = 0,
  onChange,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState<number | string>(defaultActiveTab);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const positionClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    stretch: 'justify-between',
  };

  const handleTabChange = (tabValue: number | string) => {
    setActiveTab(tabValue);
    if (onChange) {
      onChange(tabValue);
    }
  };

  const renderTabs = () => {
    return Children.map(children, (child, index) => {
      if (!isValidElement(child)) return null;
      
      const { value, label, disabled, icon, className: tabClassName } = child.props as TabProps;
      const tabValue = value !== undefined ? value : index;
      const isActive = activeTab === tabValue;

      const tabClasses = classNames(
        'flex items-center justify-center px-4 py-2 font-medium rounded-md focus:outline-none transition-colors duration-200',
        sizeClasses[size],
        {
          'text-blue-600 bg-blue-50': isActive && variant === 'default',
          'text-gray-900 hover:bg-gray-100': !isActive && variant === 'default',
          'bg-white border border-gray-300': variant === 'outline' && !isActive,
          'border-blue-500 bg-blue-50 text-blue-700': variant === 'outline' && isActive,
          'rounded-full px-4 py-1': variant === 'pills',
          'bg-blue-600 text-white': variant === 'pills' && isActive,
          'text-gray-700 hover:bg-gray-100': variant === 'pills' && !isActive,
          'border-b-2 border-transparent': variant === 'underline',
          'border-blue-500 text-blue-600': variant === 'underline' && isActive,
          'text-gray-500 hover:text-gray-700 hover:border-gray-300': variant === 'underline' && !isActive,
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled,
        },
        tabClassName
      );

      return (
        <button
          key={tabValue}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-disabled={disabled}
          disabled={disabled}
          className={tabClasses}
          onClick={() => handleTabChange(tabValue)}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {label || child}
        </button>
      );
    });
  };

  const renderTabContent = () => {
    return Children.map(children, (child, index) => {
      if (!isValidElement(child)) return null;
      
      const tabValue = child.props.value !== undefined ? child.props.value : index;
      const isActive = activeTab === tabValue;
      
      if (!isActive) return null;
      
      return (
        <div className={classNames('mt-4', child.props.className)}>
          {child.props.children}
        </div>
      );
    });
  };

  const tabListClasses = classNames(
    'flex space-x-1',
    positionClasses[position],
    {
      'w-full': fullWidth,
    },
    className
  );

  return (
    <div>
      <div className={tabListClasses} role="tablist">
        {renderTabs()}
      </div>
      {renderTabContent()}
    </div>
  );
};

const Tab = ({ children, className }: TabProps) => {
  return <div className={className}>{children}</div>;
};

Tabs.Tab = Tab;

export { Tabs, Tab };
export default Tabs;
