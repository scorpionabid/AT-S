import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { useToast } from "@/hooks/use-toast";

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

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState("/dashboard");
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app would call API
    const user = mockUsers[email as keyof typeof mockUsers];
    
    if (user && password === "123456") {
      setCurrentUser(user);
      setIsAuthenticated(true);
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
    setCurrentPath("/dashboard");
    toast({
      title: "Sistemdən çıxış",
      description: "Uğurla çıxış etdiniz",
    });
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const renderDashboardContent = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case "SuperAdmin":
        return <SuperAdminDashboard />;
      case "RegionAdmin":
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Regional Admin Dashboard</h2>
              <p className="text-muted-foreground">
                {currentUser.region} regional idarəetmə paneli hazırlanır...
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">{currentUser.role} Dashboard</h2>
              <p className="text-muted-foreground">Bu panel hazırlanmaqdadır...</p>
            </div>
          </div>
        );
    }
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
    <div className="flex h-screen bg-background">
      <Sidebar
        userRole={currentUser.role}
        currentUser={currentUser.name}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          title={getDashboardTitle()}
          subtitle={getDashboardSubtitle()}
          userRole={currentUser.role}
          userName={currentUser.name}
          notificationCount={5}
        />
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          {renderDashboardContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
