import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoleGuard } from '../components/common/access/RoleGuard';
import { useAuth } from '../contexts/AuthContext';
import PermissionMatrix from '../components/admin/PermissionManagement/PermissionMatrix';
import RoleSimulator from '../components/admin/RoleTesting/RoleSimulator';
import { 
  FiSettings, 
  FiUsers, 
  FiShield, 
  FiActivity, 
  FiDatabase,
  FiBarChart,
  FiTool,
  FiEye,
  FiLock,
  FiMonitor
} from 'react-icons/fi';

type AdminTool = 
  | 'overview' 
  | 'permissions' 
  | 'role-simulator' 
  | 'user-management' 
  | 'system-settings'
  | 'analytics'
  | 'security-audit';

/**
 * SuperAdmin Dashboard - Bütün administrativ alətlərə giriş
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<AdminTool>('overview');

  const adminTools = [
    {
      id: 'overview' as AdminTool,
      title: 'Ümumi Baxış',
      description: 'Sistem statusu və əsas statistikalar',
      icon: FiMonitor,
      color: 'blue',
      available: true
    },
    {
      id: 'permissions' as AdminTool,
      title: 'Səlahiyyət İdarəetməsi',
      description: 'Rollara görə səlahiyyətləri idarə edin',
      icon: FiShield,
      color: 'green',
      available: true
    },
    {
      id: 'role-simulator' as AdminTool,
      title: 'Rol Simulatoru',
      description: 'Müxtəlif rolların səlahiyyətlərini test edin',
      icon: FiEye,
      color: 'purple',
      available: true
    },
    {
      id: 'user-management' as AdminTool,
      title: 'İstifadəçi İdarəetməsi',
      description: 'Toplu istifadəçi əməliyyatları',
      icon: FiUsers,
      color: 'orange',
      available: false // TODO: Implement
    },
    {
      id: 'system-settings' as AdminTool,
      title: 'Sistem Parametrləri',
      description: 'Global sistem konfiqurasiyası',
      icon: FiSettings,
      color: 'gray',
      available: false // TODO: Implement
    },
    {
      id: 'analytics' as AdminTool,
      title: 'Analitika',
      description: 'Sistem performans və istifadə statistikaları',
      icon: FiBarChart,
      color: 'indigo',
      available: false // TODO: Implement
    },
    {
      id: 'security-audit' as AdminTool,
      title: 'Təhlükəsizlik Auditi',
      description: 'Sistem təhlükəsizliyi və log analizi',
      icon: FiLock,
      color: 'red',
      available: false // TODO: Implement
    }
  ];

  const getToolColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FiMonitor className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600">
              SuperAdmin kimi sistemi idarə etmək üçün bütün alətlərə çıxışınız var
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Card 
              key={tool.id}
              className={`p-6 transition-all duration-200 cursor-pointer border-2 ${
                isActive 
                  ? getToolColorClasses(tool.color)
                  : tool.available 
                    ? 'hover:shadow-md hover:border-gray-300' 
                    : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => tool.available && setActiveTool(tool.id)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white' : `bg-${tool.color}-100`
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isActive ? `text-${tool.color}-600` : `text-${tool.color}-600`
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    {tool.title}
                    {!tool.available && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Tezliklə
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <FiUsers className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">---</div>
              <div className="text-sm text-gray-500">Aktiv İstifadəçilər</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <FiDatabase className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">---</div>
              <div className="text-sm text-gray-500">Məlumat Bazası</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <FiActivity className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">---</div>
              <div className="text-sm text-gray-500">Günlük Fəaliyyət</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <FiTool className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{adminTools.filter(t => t.available).length}</div>
              <div className="text-sm text-gray-500">Aktiv Alətlər</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'overview':
        return renderOverview();
      case 'permissions':
        return <PermissionMatrix />;
      case 'role-simulator':
        return <RoleSimulator />;
      default:
        return (
          <Card className="p-8 text-center">
            <FiTool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bu alət hazırlanır
            </h3>
            <p className="text-gray-600">
              {adminTools.find(t => t.id === activeTool)?.description}
            </p>
          </Card>
        );
    }
  };

  return (
    <RoleGuard roles={['superadmin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Navigation Tabs */}
          {activeTool !== 'overview' && (
            <Card className="p-4">
              <div className="flex items-center space-x-4 overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTool('overview')}
                  className="whitespace-nowrap"
                >
                  ← Ümumi Baxış
                </Button>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>/</span>
                  <span className="font-medium text-gray-900">
                    {adminTools.find(t => t.id === activeTool)?.title}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Active Tool Content */}
          {renderActiveTool()}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default AdminDashboard;