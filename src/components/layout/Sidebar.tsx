import { useState, useCallback } from "react";
import { 
  HomeIcon, 
  UsersIcon, 
  FileTextIcon, 
  BarChart3Icon,
  SettingsIcon,
  BellIcon,
  LogOutIcon,
  SchoolIcon,
  ClipboardListIcon,
  FolderIcon,
  BuildingIcon,
  MapPinIcon,
  GraduationCapIcon,
  ShieldIcon,
  DatabaseIcon,
  MonitorIcon,
  ClipboardIcon,
  ChevronRightIcon,
  DownloadIcon,
  BabyIcon,
  LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: string;
  currentUser: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  currentPath: string;
}

export const Sidebar = ({ userRole, currentUser, onNavigate, onLogout, currentPath }: SidebarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [surveysOpen, setSurveysOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);

  const handleNavigateAndCollapse = useCallback((path: string) => {
    onNavigate(path);
    setIsHovered(false);
  }, [onNavigate]);

  const getSuperAdminMenuStructure = () => [
    {
      groupLabel: "Ana İdarəetmə",
      items: [
        { icon: HomeIcon, label: "Ana səhifə", path: "/" },
        { icon: BellIcon, label: "Bildirişlər", path: "/notifications" },
      ]
    },
    {
      groupLabel: "İstifadəçi İdarəetməsi", 
      items: [
        { icon: UsersIcon, label: "İstifadəçilər", path: "/users" },
        { icon: ShieldIcon, label: "Rollar", path: "/roles" },
        { icon: BuildingIcon, label: "Departmentlər", path: "/departments" },
        { icon: SchoolIcon, label: "Müəssisələr", path: "/institutions" },
        { icon: BabyIcon, label: "Məktəbəqədər müəssisələr", path: "/preschools" },
      ]
    },
    {
      groupLabel: "Regional İdarəetmə",
      items: [
        { icon: MapPinIcon, label: "Regionlar", path: "/regions" },
        { icon: UsersIcon, label: "Sektorlar", path: "/sectors" },
        { icon: DatabaseIcon, label: "İerarxiya İdarəetməsi", path: "/hierarchy" },
      ]
    },
    {
      groupLabel: "Sorğu Sistemi",
      items: [
        { 
          icon: ClipboardListIcon, 
          label: "Sorğular", 
          hasSubmenu: true,
          submenu: [
            { label: "Sorğular", path: "/surveys" },
            { label: "Təsdiq", path: "/surveys/approval" },
            { label: "Sorğu nəticələri", path: "/surveys/results" },
            { label: "Arxiv", path: "/surveys/archive" },
          ]
        },
      ]
    },
    {
      groupLabel: "Tapşırıq İdarəetməsi",
      items: [
        { icon: FileTextIcon, label: "Tapşırıqlar", path: "/tasks" },
      ]
    },
    {
      groupLabel: "Məktəb İdarəetmə Modulu",
      items: [
        {
          icon: GraduationCapIcon,
          label: "Məktəb",
          hasSubmenu: true,
          submenu: [
            { label: "Dərs Yükü", path: "/school/workload" },
            { label: "Dərs Cədvəli", path: "/school/schedules" },
            { label: "Davamiyyət", path: "/school/attendance" },
            { label: "Qiymətləndirmələr", path: "/school/assessments" },
          ]
        }
      ]
    },
    {
      groupLabel: "Sənəd və Məlumat İdarəetməsi",
      items: [
        { icon: FolderIcon, label: "Sənədlər", path: "/documents" },
        { icon: DownloadIcon, label: "Hesabatlar", path: "/reports" },
        { icon: LinkIcon, label: "Linklər", path: "/links" },
      ]
    },
    {
      groupLabel: "Sistem İdarəetməsi",
      items: [
        { icon: SettingsIcon, label: "Sistem Parametrləri", path: "/settings" },
        { icon: BarChart3Icon, label: "Sistem Statistikası", path: "/analytics" },
        { icon: ClipboardIcon, label: "Audit Logları", path: "/audit-logs" },
        { icon: MonitorIcon, label: "Performans Monitorinqi", path: "/performance" },
      ]
    }
  ];

  const getOtherRoleMenuStructure = () => {
    const baseItems = [
      { icon: HomeIcon, label: "Ana səhifə", path: "/" },
      { icon: BellIcon, label: "Bildirişlər", path: "/notifications" },
    ];

    const roleSpecificItems = {
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

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/";
    return currentPath === path;
  };

  const isExpanded = isHovered;

  // SuperAdmin layout with grouped menu structure
  if (userRole === "SuperAdmin") {
    const menuStructure = getSuperAdminMenuStructure();
    
    return (
      <div 
        className={cn(
          "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col shadow-elevated",
          isExpanded ? "w-64" : "w-14"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="h-14 flex items-center px-3 border-b border-sidebar-border bg-sidebar">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary flex-shrink-0">
              <SchoolIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className={cn("transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
              <h2 className="font-semibold text-sm text-sidebar-foreground">ATİS</h2>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuStructure.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {isExpanded && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.groupLabel}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {item.hasSubmenu ? (
                      <div>
                        <button
                          onClick={() => {
                            if (item.label === "Sorğular") setSurveysOpen(!surveysOpen);
                            if (item.label === "Məktəb") setSchoolOpen(!schoolOpen);
                          }}
                          className={cn(
                            "w-full flex items-center px-3 py-2 text-sm transition-colors duration-200",
                            "hover:bg-sidebar-accent text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {isExpanded && (
                            <>
                              <span className="ml-3 truncate">{item.label}</span>
                              <ChevronRightIcon 
                                className={cn(
                                  "ml-auto h-4 w-4 transition-transform duration-200",
                                  (item.label === "Sorğular" && surveysOpen) || (item.label === "Məktəb" && schoolOpen) ? "rotate-90" : ""
                                )} 
                              />
                            </>
                          )}
                        </button>
                        {isExpanded && ((item.label === "Sorğular" && surveysOpen) || (item.label === "Məktəb" && schoolOpen)) && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.submenu?.map((subItem, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => handleNavigateAndCollapse(subItem.path)}
                                className={cn(
                                  "w-full flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded-md",
                                  isActive(subItem.path)
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                )}
                              >
                                <span className="truncate">{subItem.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNavigateAndCollapse(item.path!)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded-md mx-1",
                          isActive(item.path!)
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && <span className="ml-3 truncate">{item.label}</span>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {isExpanded && (
            <div className="mb-3 px-2 py-2 bg-sidebar-accent rounded-lg">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser}</p>
              <p className="text-xs text-muted-foreground truncate">{userRole}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded-md",
              "text-destructive hover:bg-destructive/10"
            )}
          >
            <LogOutIcon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="ml-3">Çıxış</span>}
          </button>
        </div>
      </div>
    );
  }

  // For other roles, use simpler structure
  const menuItems = getOtherRoleMenuStructure();
  
  return (
    <div 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col shadow-elevated",
        isExpanded ? "w-64" : "w-14"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="h-14 flex items-center px-3 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary flex-shrink-0">
            <SchoolIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className={cn("transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
            <h2 className="font-semibold text-sm text-sidebar-foreground">ATİS</h2>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigateAndCollapse(item.path)}
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded-md mx-1",
              isActive(item.path)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="ml-3 truncate">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {isExpanded && (
          <div className="mb-3 px-2 py-2 bg-sidebar-accent rounded-lg">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser}</p>
            <p className="text-xs text-muted-foreground truncate">{userRole}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded-md",
            "text-destructive hover:bg-destructive/10"
          )}
        >
          <LogOutIcon className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="ml-3">Çıxış</span>}
        </button>
      </div>
    </div>
  );
};
