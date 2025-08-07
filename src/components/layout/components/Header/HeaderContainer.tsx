import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayout } from '@/contexts/LayoutContext';

interface HeaderContainerProps {
  children: React.ReactNode;
}

export const HeaderContainer: React.FC<HeaderContainerProps> = ({ children }) => {
  const { toggleSidebar, isMobile } = useLayout();

  return (
    <header className="h-16 flex items-center border-b border-border bg-card/50 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-4 h-9 w-9"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        {/* Header Content */}
        {children}
      </div>
    </header>
  );
};