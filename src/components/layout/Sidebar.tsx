import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  HomeIcon, 
  UsersIcon, 
  FileTextIcon, 
  BarChart3Icon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  LogOutIcon,
  SchoolIcon,
  ClipboardListIcon,
  FolderIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: string;
  currentUser: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ userRole, currentUser, onNavigate, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    const baseItems = [
      { icon: HomeIcon, label: "Ana səhifə", path: "/dashboard" },
      { icon: BellIcon, label: "Bildirişlər", path: "/notifications" },
    ];

    const roleSpecificItems = {
      SuperAdmin: [
        { icon: UsersIcon, label: "Regionlar", path: "/regions" },
        { icon: BarChart3Icon, label: "Sistem statistikası", path: "/analytics" },
        { icon: SettingsIcon, label: "Sistem parametrləri", path: "/settings" },
      ],
      RegionAdmin: [
        { icon: ClipboardListIcon, label: "Sorğular", path: "/surveys" },
        { icon: UsersIcon, label: "Sektorlar", path: "/sectors" },
        { icon: FolderIcon, label: "Sənədlər", path: "/documents" },
        { icon: BarChart3Icon, label: "Hesabatlar", path: "/reports" },
      ],
      RegionOperator: [
        { icon: ClipboardListIcon, label: "Sorğular", path: "/surveys" },
        { icon: FolderIcon, label: "Sənədlər", path: "/documents" },
        { icon: FileTextIcon, label: "Tapşırıqlar", path: "/tasks" },
      ],
      SektorAdmin: [
        { icon: SchoolIcon, label: "Təhsil müəssisələri", path: "/institutions" },
        { icon: ClipboardListIcon, label: "Sorğular", path: "/surveys" },
        { icon: FileTextIcon, label: "Tapşırıqlar", path: "/tasks" },
        { icon: BarChart3Icon, label: "Sektor hesabatları", path: "/sector-reports" },
      ],
      SchoolAdmin: [
        { icon: ClipboardListIcon, label: "Sorğular", path: "/surveys" },
        { icon: FileTextIcon, label: "Tapşırıqlar", path: "/tasks" },
        { icon: UsersIcon, label: "Personallar", path: "/staff" },
        { icon: BarChart3Icon, label: "Məktəb hesabatları", path: "/school-reports" },
      ],
      Teacher: [
        { icon: ClipboardListIcon, label: "Tapşırıqlar", path: "/assignments" },
        { icon: FileTextIcon, label: "Dərs planları", path: "/lesson-plans" },
        { icon: BarChart3Icon, label: "Qiymətləndirmələr", path: "/assessments" },
      ]
    };

    return [...baseItems, ...(roleSpecificItems[userRole as keyof typeof roleSpecificItems] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <div className={cn(
      "bg-card border-r border-border-light shadow-card flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <SchoolIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">ATİS</h2>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={cn(
              "w-full justify-start hover:bg-accent hover:text-accent-foreground",
              isCollapsed ? "px-2" : "px-3"
            )}
            onClick={() => onNavigate(item.path)}
          >
            <item.icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border-light space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-2 bg-secondary rounded-lg">
            <p className="text-sm font-medium text-secondary-foreground">{currentUser}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full text-destructive hover:bg-destructive-light hover:text-destructive",
            isCollapsed ? "px-2" : "justify-start px-3"
          )}
          onClick={onLogout}
        >
          <LogOutIcon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
          {!isCollapsed && <span className="text-sm">Çıxış</span>}
        </Button>
      </div>
    </div>
  );
};