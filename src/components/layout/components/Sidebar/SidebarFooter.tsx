import React from 'react';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarFooterProps {
  isExpanded: boolean;
  onLogout: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ isExpanded, onLogout }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="border-t border-border p-4">
      {isExpanded ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıxış
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary">
                <User className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {currentUser.name}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Çıxış
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};