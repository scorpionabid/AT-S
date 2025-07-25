import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Loading } from '../ui/Loading';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalInstitutions: number;
  activeSurveys: number;
  pendingTasks: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalInstitutions: 43,
          activeSurveys: 12,
          pendingTasks: 25,
          systemHealth: 'good'
        });
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Xoş gəldiniz, {user?.username}
        </h1>
        <p className="text-gray-600">
          Sistem idarəetmə paneli
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ümumi istifadəçilər</p>
                <p className="text-2xl font-bold">{stats?.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktiv istifadəçilər</p>
                <p className="text-2xl font-bold">{stats?.activeUsers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Təssisatlar</p>
                <p className="text-2xl font-bold">{stats?.totalInstitutions}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktiv sorğular</p>
                <p className="text-2xl font-bold">{stats?.activeSurveys}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Gözləyən tapşırıqlar</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Sorğu yaradılması</p>
                  <p className="text-sm text-gray-600">Müəllim qiymətləndirmə formu</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Təcili</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Hesabat təhziri</p>
                  <p className="text-sm text-gray-600">Aylıq fəaliyyət hesabatı</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Orta</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Sistem yenilənməsi</p>
                  <p className="text-sm text-gray-600">Təhlükəsizlik yaması</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Aşağı</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Sistem vəziyyəti</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Sistem sağlamlığı</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  stats?.systemHealth === 'good' 
                    ? 'bg-green-100 text-green-800' 
                    : stats?.systemHealth === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats?.systemHealth === 'good' ? 'Yaxşı' : 
                   stats?.systemHealth === 'warning' ? 'Diqqət' : 'Kritik'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Databaza</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span>API statusu</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Aktiv</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Disk sahəsi</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">75%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;