import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'SuperAdmin' | 'RegionAdmin' | 'User';

export interface User {
  name: string;
  role: UserRole;
  region?: string;
  permissions?: string[];
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data - in a real app this would come from authentication service
const mockUsers = {
  "admin@edu.gov.az": {
    name: "System Administrator",
    role: "SuperAdmin" as UserRole,
    permissions: ["all"],
    email: "admin@edu.gov.az"
  },
  "baki@edu.gov.az": {
    name: "Bakı Regional Admin",
    role: "RegionAdmin" as UserRole, 
    region: "Bakı",
    email: "baki@edu.gov.az"
  },
  "seki@edu.gov.az": {
    name: "Şəki Regional Admin",
    role: "RegionAdmin" as UserRole,
    region: "Şəki-Zaqatala",
    email: "seki@edu.gov.az"
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app would call API
    const user = mockUsers[email as keyof typeof mockUsers];
    
    if (user && password === "123456") {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};