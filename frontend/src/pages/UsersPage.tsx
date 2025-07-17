import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiPlus, FiRefreshCw } from 'react-icons/fi';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import UsersList from '../components/users/UsersList';
import UserStatsOverview from '../components/users/UserStatsOverview';
import { Button } from '../components/ui/Button';
import { regionAdminService } from '../services/regionAdminService';
import type { RegionUserStats } from '../services/regionAdminService';

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<RegionUserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('users');

  // Show regional stats for RegionAdmin users
  const isRegionAdmin = user?.role === 'regionadmin';

  useEffect(() => {
    if (isRegionAdmin) {
      fetchUserStats();
    }
  }, [isRegionAdmin]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionAdminService.getUserStats();
      setUserStats(data);
    } catch (error: any) {
      setError(error.message || 'İstifadəçi məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isRegionAdmin) {
      fetchUserStats();
    }
  };

  // Page actions based on role
  const pageActions = (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={loading}
      >
        <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Yenilə
      </Button>
      <Button variant="primary" size="sm">
        <FiPlus className="w-4 h-4 mr-2" />
        Yeni İstifadəçi
      </Button>
    </div>
  );

  // Tabs for RegionAdmin
  const renderTabs = () => {
    if (!isRegionAdmin) return null;

    const tabs = [
      { id: 'overview', label: 'Ümumi Baxış', count: userStats?.totalUsers },
      { id: 'users', label: 'İstifadəçilər', count: userStats?.activeUsers },
      { id: 'analytics', label: 'Analitika' }
    ];

    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  const renderContent = () => {
    if (isRegionAdmin) {
      if (error) {
        return (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={handleRefresh}>Yenidən Yüklə</Button>
          </div>
        );
      }

      switch (activeTab) {
        case 'overview':
          return userStats ? (
            <UserStatsOverview 
              stats={userStats} 
              onRefresh={handleRefresh}
              filters={{ institution_id: user?.institution_id }}
            />
          ) : null;
        case 'analytics':
          return (
            <div className="text-center py-8 text-gray-500">
              Analitika bölməsi hazırlanır...
            </div>
          );
        default:
          return <UsersList />;
      }
    }

    // Default SuperAdmin view
    return <UsersList />;
  };

  return (
    <StandardPageLayout
      title="İstifadəçi İdarəetməsi"
      subtitle={isRegionAdmin 
        ? "Regional istifadəçilərin idarəetməsi və statistikalar"
        : "Sistem istifadəçilərinin idarəetməsi"
      }
      icon={<FiUsers className="w-6 h-6 text-blue-600" />}
      actions={pageActions}
    >
      {renderTabs()}
      {renderContent()}
    </StandardPageLayout>
  );
};

export default UsersPage;