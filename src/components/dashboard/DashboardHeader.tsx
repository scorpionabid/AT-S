import { Button } from "@/components/ui/button";
import { BellIcon, SearchIcon, UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userRole: string;
  userName: string;
  notificationCount?: number;
}

export const DashboardHeader = ({ 
  title, 
  subtitle, 
  userRole, 
  userName, 
  notificationCount = 0 
}: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Title Section */}
      <div className="min-w-0 flex-1 pr-4">
        <h1 className="text-lg lg:text-xl font-bold text-foreground font-heading truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs lg:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
        {/* Search - Hidden on smaller screens */}
        <div className="relative hidden xl:block">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Axtarış..."
            className="pl-10 w-40 xl:w-48 focus:ring-input-focus focus:border-input-focus"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
          <BellIcon className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center text-[10px] font-medium">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="hidden lg:block text-right min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[120px] xl:max-w-none">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userRole}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
            <UserIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};