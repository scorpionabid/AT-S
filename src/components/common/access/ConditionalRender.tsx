import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface ConditionalRenderProps {
  children: React.ReactNode;
  condition: (user: any) => boolean;
  fallback?: React.ReactNode;
}

const ConditionalRender: React.FC<ConditionalRenderProps> = ({ 
  children, 
  condition, 
  fallback = null 
}) => {
  const { user } = useAuth();

  if (!user || !condition(user)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ConditionalRender;