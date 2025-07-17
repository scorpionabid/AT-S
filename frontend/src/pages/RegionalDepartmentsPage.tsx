import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Loading';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiDollarSign, 
  FiSettings, 
  FiTrendingUp,
  FiUsers,
  FiBarChart,
  FiFileText,
  FiClock,
  FiTarget,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiPlus
} from 'react-icons/fi';

interface DepartmentStats {
  id: string;
  name: string;
  type: 'tehsil' | 'maliyye' | 'inzibati' | 'tesserrufat';
  displayName: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  stats: {
    totalOperators: number;
    activeOperators: number;
    completedTasks: number;
    pendingTasks: number;
    monthlyReports: number;
    budgetManaged?: number;
    facilitiesManaged?: number;
    administrativeActions?: number;
    educationPrograms?: number;
  };
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'in_progress';
    operator: string;
  }>;
}

const RegionalDepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      
      // Mock data for development - in production this would be API call
      const mockDepartments: DepartmentStats[] = [
        {
          id: 'education',
          name: 'tehsil',
          type: 'tehsil',
          displayName: 'Təhsil Şöbəsi',
          description: 'Təhsil metodikası və akademik fəaliyyətlərin idarəetməsi',
          icon: FiFileText,
          color: 'purple',
          stats: {
            totalOperators: 18,
            activeOperators: 16,
            completedTasks: 62,
            pendingTasks: 14,
            monthlyReports: 22,
            educationPrograms: 45
          },
          recentActivities: [
            {
              id: '7',
              title: 'Yeni təhsil proqramı təsdiqi',
              description: 'Riyaziyyat fənni üçün yenilənmiş proqram',
              timestamp: '1 saat əvvəl',
              status: 'completed',
              operator: 'Lalə Əhmədova'
            },
            {
              id: '8',
              title: 'Müəllim attestasiyası',
              description: 'Regional müəllimlərin illik attestasiyası',
              timestamp: '3 saat əvvəl',
              status: 'in_progress',
              operator: 'Orxan Bayramov'
            }
          ]
        },
        {
          id: 'finance',
          name: 'maliyye',
          type: 'maliyye',
          displayName: 'Maliyyə Şöbəsi',
          description: 'Regional maliyyə əməliyyatları və büdcə idarəetməsi',
          icon: FiDollarSign,
          color: 'green',
          stats: {
            totalOperators: 12,
            activeOperators: 10,
            completedTasks: 45,
            pendingTasks: 8,
            monthlyReports: 15,
            budgetManaged: 2500000
          },
          recentActivities: [
            {
              id: '1',
              title: 'Aylıq büdcə hesabatı tamamlandı',
              description: 'Yanvar ayı üçün regional büdcə icra hesabatı',
              timestamp: '2 saat əvvəl',
              status: 'completed',
              operator: 'Səməd Məmmədov'
            },
            {
              id: '2',
              title: 'Məktəb təmir büdcəsi təsdiqi',
              description: '15 saylı məktəbin təmir işləri büdcəsi',
              timestamp: '5 saat əvvəl',
              status: 'pending',
              operator: 'Günay Əliyeva'
            }
          ]
        },
        {
          id: 'administrative',
          name: 'inzibati',
          type: 'inzibati',
          displayName: 'İnzibati Şöbəsi',
          description: 'Kadr idarəetməsi və inzibati əməliyyatlar',
          icon: FiSettings,
          color: 'blue',
          stats: {
            totalOperators: 8,
            activeOperators: 7,
            completedTasks: 32,
            pendingTasks: 12,
            monthlyReports: 8,
            administrativeActions: 156
          },
          recentActivities: [
            {
              id: '3',
              title: 'Yeni müəllim təyinatı',
              description: 'Riyaziyyat müəllimi 3 saylı məktəbə təyin edildi',
              timestamp: '1 saat əvvəl',
              status: 'completed',
              operator: 'Nigar Həsənova'
            },
            {
              id: '4',
              title: 'Kadr siyahısının yenilənməsi',
              description: 'Regional kadr bazasının güncəllənməsi',
              timestamp: '3 saat əvvəl',
              status: 'in_progress',
              operator: 'Rəşad İbrahimov'
            }
          ]
        },
        {
          id: 'facility',
          name: 'tesserrufat',
          type: 'tesserrufat',
          displayName: 'Təsərrüfat Şöbəsi',
          description: 'Infrastruktur və təsərrüfat işlərinin idarəedilməsi',
          icon: FiTrendingUp,
          color: 'orange',
          stats: {
            totalOperators: 15,
            activeOperators: 13,
            completedTasks: 28,
            pendingTasks: 18,
            monthlyReports: 12,
            facilitiesManaged: 67
          },
          recentActivities: [
            {
              id: '5',
              title: 'Istilik sistemi təmiri tamamlandı',
              description: '8 saylı məktəbdə istilik sisteminin təmiri',
              timestamp: '4 saat əvvəl',
              status: 'completed',
              operator: 'Kamil Quliyev'
            },
            {
              id: '6',
              title: 'Yeni mebel alışı',
              description: '5 məktəb üçün siniflərə mebel tədarükü',
              timestamp: '6 saat əvvəl',
              status: 'pending',
              operator: 'Leyla Nəbiyeva'
            }
          ]
        }
      ];

      setDepartments(mockDepartments);
      setError(null);
    } catch (err: any) {
      setError('Şöbə məlumatları yüklənərkən xəta baş verdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'in_progress': return <FiTarget className="w-4 h-4" />;
      default: return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Gözləyir';
      case 'in_progress': return 'Davam edir';
      default: return 'Naməlum';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchDepartmentData}>Yenidən Yüklə</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Regional Şöbələr
          </h1>
          <p className="text-gray-600">
            Regional səviyyədə şöbələrin fəaliyyətinin izlənməsi və idarəedilməsi
          </p>
        </div>

        {/* Department Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const IconComponent = dept.icon;
            return (
              <Card 
                key={dept.id} 
                className={`p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-${dept.color}-500`}
                onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 bg-${dept.color}-100 rounded-lg`}>
                      <IconComponent className={`w-6 h-6 text-${dept.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dept.displayName}</h3>
                      <p className="text-sm text-gray-600">{dept.description}</p>
                    </div>
                  </div>
                </div>

                {/* Department Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{dept.stats.totalOperators}</div>
                    <div className="text-xs text-gray-600">Ümumi Operator</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dept.stats.activeOperators}</div>
                    <div className="text-xs text-gray-600">Aktiv Operator</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{dept.stats.completedTasks}</div>
                    <div className="text-xs text-gray-600">Tamamlanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{dept.stats.pendingTasks}</div>
                    <div className="text-xs text-gray-600">Gözləyən</div>
                  </div>
                </div>

                {/* Department Specific Stats */}
                <div className="border-t pt-4">
                  {dept.type === 'maliyye' && dept.stats.budgetManaged && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">İdarə olunan büdcə:</span>
                      <span className="font-medium text-green-600">
                        {(dept.stats.budgetManaged / 1000000).toFixed(1)}M AZN
                      </span>
                    </div>
                  )}
                  {dept.type === 'tesserrufat' && dept.stats.facilitiesManaged && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">İdarə olunan obyekt:</span>
                      <span className="font-medium text-orange-600">{dept.stats.facilitiesManaged}</span>
                    </div>
                  )}
                  {dept.type === 'inzibati' && dept.stats.administrativeActions && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aylıq əməliyyat:</span>
                      <span className="font-medium text-blue-600">{dept.stats.administrativeActions}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to department specific page
                    }}
                  >
                    Detallı Görünüş
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Department Details */}
        {selectedDepartment && (
          <Card className="p-6">
            {(() => {
              const dept = departments.find(d => d.id === selectedDepartment);
              if (!dept) return null;

              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {dept.displayName} - Son Fəaliyyətlər
                    </h3>
                    <Button variant="primary">
                      <FiPlus className="w-4 h-4 mr-2" />
                      Yeni Tapşırıq
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {dept.recentActivities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                {getStatusIcon(activity.status)}
                                <span className="ml-1">{getStatusText(activity.status)}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <FiUsers className="w-3 h-3 mr-1" />
                                {activity.operator}
                              </span>
                              <span className="flex items-center">
                                <FiClock className="w-3 h-3 mr-1" />
                                {activity.timestamp}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <FiFileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <FiBarChart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Performans Hesabatı</h4>
            <p className="text-xs text-gray-600">Şöbələr üzrə aylıq hesabat</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <FiUsers className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Operator İdarəetməsi</h4>
            <p className="text-xs text-gray-600">Şöbə operatorlarının idarəsi</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <FiTarget className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Tapşırıq Koordinasiyası</h4>
            <p className="text-xs text-gray-600">Şöbələr arası koordinasiya</p>
          </Card>

          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <FiFileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Sənəd İdarəetməsi</h4>
            <p className="text-xs text-gray-600">Regional sənədlər və protokollar</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegionalDepartmentsPage;