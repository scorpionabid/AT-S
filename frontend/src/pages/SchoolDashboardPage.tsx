import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  FiUserCheck, 
  FiCalendar, 
  FiClock, 
  FiBarChart,
  FiArrowRight,
  FiUsers,
  FiBook,
  FiAward
} from 'react-icons/fi';

const SchoolDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Məktəb İdarəetməsi
          </h1>
          <p className="text-gray-600">
            Məktəb akademik funksiyalarının vahid idarəetmə paneli
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Attendance Management */}
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiUserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Davamiyyət</h3>
                  <p className="text-sm text-gray-600">Sinif səviyyəsində izləmə</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bu gün həzir olan:</span>
                <span className="font-medium">1,234 şagird</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Davamiyyət faizi:</span>
                <span className="font-medium text-green-600">94.2%</span>
              </div>
              <Link to="/attendance">
                <Button className="w-full mt-4" variant="outline">
                  İdarə Et
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Schedule Management */}
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cədvəllər</h3>
                  <p className="text-sm text-gray-600">Dərs cədvəlləri</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aktiv cədvəllər:</span>
                <span className="font-medium">45 sinif</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gözləyən təsdiq:</span>
                <span className="font-medium text-orange-600">3 cədvəl</span>
              </div>
              <Link to="/schedules">
                <Button className="w-full mt-4" variant="outline">
                  İdarə Et
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Teaching Loads */}
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dərs Yükləri</h3>
                  <p className="text-sm text-gray-600">Müəllim yükləri</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ümumi müəllimlər:</span>
                <span className="font-medium">87 nəfər</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Orta yük:</span>
                <span className="font-medium text-blue-600">18.5 saat</span>
              </div>
              <Link to="/teaching-loads">
                <Button className="w-full mt-4" variant="outline">
                  İdarə Et
                  <FiArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Performance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Akademik Performans</h3>
              <FiBarChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiUsers className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Ümumi şagird sayı</span>
                </div>
                <span className="font-medium">1,356</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiBook className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Aktiv kurslar</span>
                </div>
                <span className="font-medium">124</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiAward className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Orta qiymət</span>
                </div>
                <span className="font-medium">4.2</span>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Son Fəaliyyətlər</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">7A sinfi davamiyyəti yeniləndi</p>
                  <p className="text-xs text-gray-500">5 dəqiqə əvvəl</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Yeni dərs cədvəli təsdiqləndi</p>
                  <p className="text-xs text-gray-500">15 dəqiqə əvvəl</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Müəllim yükləri yeniləndi</p>
                  <p className="text-xs text-gray-500">30 dəqiqə əvvəl</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SchoolDashboardPage;