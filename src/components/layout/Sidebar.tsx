import { useState } from "react";
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
  CalendarIcon,
  GraduationCapIcon,
  ClockIcon,
  UserCheckIcon,
  TrendingUpIcon,
  ShieldIcon,
  DatabaseIcon,
  MonitorIcon,
  ArchiveIcon,
  CheckSquareIcon,
  ClipboardIcon,
  FilesIcon,
  ChevronRightIcon,
  DownloadIcon,
  BabyIcon,
  LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  userRole: string;
  currentUser: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  currentPath: string;
}

export const Sidebar = ({ userRole, currentUser, onNavigate, onLogout, currentPath }: SidebarProps) => {
  const [surveysOpen, setSurveysOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);

  const getSuperAdminMenuStructure = () => [
    {
      groupLabel: "Ana İdarəetmə",
      items: [
        { icon: HomeIcon, label: "Ana səhifə", path: "/dashboard" },
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
      { icon: HomeIcon, label: "Ana səhifə", path: "/dashboard" },
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

  const isActive = (path: string) => currentPath === path;

  if (userRole === "SuperAdmin") {
    const menuStructure = getSuperAdminMenuStructure();
    
    return (
      <ShadcnSidebar collapsible="icon" className="border-r border-border-light">
        <SidebarHeader className="border-b border-border-light">
          <div className="flex items-center space-x-2 px-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <SchoolIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h2 className="font-semibold text-sm text-foreground">ATİS</h2>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {menuStructure.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <SidebarGroupLabel>{group.groupLabel}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, itemIndex) => (
                    <SidebarMenuItem key={itemIndex}>
                      {item.hasSubmenu ? (
                        <Collapsible
                          open={item.label === "Sorğular üçün təsdiq" ? surveysOpen : schoolOpen}
                          onOpenChange={item.label === "Sorğular üçün təsdiq" ? setSurveysOpen : setSchoolOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                              <ChevronRightIcon className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu?.map((subItem, subIndex) => (
                                <SidebarMenuSubItem key={subIndex}>
                                  <SidebarMenuSubButton
                                    onClick={() => onNavigate(subItem.path)}
                                    isActive={isActive(subItem.path)}
                                  >
                                    <span>{subItem.label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton
                          onClick={() => onNavigate(item.path!)}
                          isActive={isActive(item.path!)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-border-light">
          <div className="group-data-[collapsible=icon]:hidden px-2 py-2 bg-secondary rounded-lg mb-2">
            <p className="text-sm font-medium text-secondary-foreground">{currentUser}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Çıxış</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </ShadcnSidebar>
    );
  }

  // For other roles, use simpler structure
  const menuItems = getOtherRoleMenuStructure();
  
  return (
    <ShadcnSidebar collapsible="icon" className="border-r border-border-light">
      <SidebarHeader className="border-b border-border-light">
        <div className="flex items-center space-x-2 px-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <SchoolIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-sm text-foreground">ATİS</h2>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.path)}
                    isActive={isActive(item.path)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border-light">
        <div className="group-data-[collapsible=icon]:hidden px-2 py-2 bg-secondary rounded-lg mb-2">
          <p className="text-sm font-medium text-secondary-foreground">{currentUser}</p>
          <p className="text-xs text-muted-foreground">{userRole}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOutIcon className="w-4 h-4" />
              <span>Çıxış</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};