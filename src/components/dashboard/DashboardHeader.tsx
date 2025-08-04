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
    <header className="bg-card border-b border-border-light shadow-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Axtarış..."
              className="pl-10 w-64 focus:ring-input-focus focus:border-input-focus"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-secondary">
              <UserIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};