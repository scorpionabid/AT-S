import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

// Mock user data - in a real app this would come from authentication context
const mockUsers = {
  "admin@edu.gov.az": {
    name: "System Administrator",
    role: "SuperAdmin",
    permissions: ["all"]
  },
  "baki@edu.gov.az": {
    name: "Bakı Regional Admin",
    role: "RegionAdmin", 
    region: "Bakı"
  },
  "seki@edu.gov.az": {
    name: "Şəki Regional Admin",
    role: "RegionAdmin",
    region: "Şəki-Zaqatala"
  }
};

type User = {
  name: string;
  role: string;
  region?: string;
  permissions?: string[];
};

const Layout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app would call API
    const user = mockUsers[email as keyof typeof mockUsers];
    
    if (user && password === "123456") {
      setCurrentUser(user);
      setIsAuthenticated(true);
      navigate("/");
      toast({
        title: "Uğurla giriş etdiniz",
        description: `Xoş gəlmisiniz, ${user.name}`,
      });
    } else {
      toast({
        title: "Giriş xətası",
        description: "E-poçt və ya şifrə yanlışdır",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate("/");
    toast({
      title: "Sistemdən çıxış",
      description: "Uğurla çıxış etdiniz",
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getDashboardTitle = () => {
    if (!currentUser) return "Dashboard";
    
    switch (currentUser.role) {
      case "SuperAdmin":
        return "Sistem İdarəetməsi";
      case "RegionAdmin":
        return `${currentUser.region} Regional İdarəetmə`;
      default:
        return "İdarəetmə Paneli";
    }
  };

  const getDashboardSubtitle = () => {
    if (!currentUser) return "";
    
    switch (currentUser.role) {
      case "SuperAdmin":
        return "Azərbaycan Təhsil İdarəetmə Sistemi - Ana Panel";
      case "RegionAdmin":
        return `${currentUser.region} regional təhsil idarəsi məlumat sistemi`;
      default:
        return "Azərbaycan Təhsil İdarəetmə Sistemi";
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show main dashboard layout
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-full">
        <Sidebar
          userRole={currentUser.role}
          currentUser={currentUser.name}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPath={location.pathname}
        />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6">
            <DashboardHeader
              title={getDashboardTitle()}
              subtitle={getDashboardSubtitle()}
              userRole={currentUser.role}
              userName={currentUser.name}
              notificationCount={5}
            />
          </header>
          <main className="flex-1 overflow-y-auto bg-surface">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;