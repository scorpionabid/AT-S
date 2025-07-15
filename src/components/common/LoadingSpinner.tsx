import React from 'react';
import { FaSpinner } from 'react-icons/fa';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  text?: string;
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const textSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text = '',
}) => {
  const spinnerSize = sizeMap[size];
  const textSize = textSizeMap[size];

  return (
    <div className={`flex items-center ${className}`}>
      <FaSpinner
        className={`animate-spin ${spinnerSize} ${!text ? '' : 'mr-2'}`}
        aria-hidden="true"
      />
      {text && <span className={textSize}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
export { LoadingSpinner };
