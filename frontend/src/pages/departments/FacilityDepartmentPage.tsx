import React from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiTool, FiHome, FiAlertTriangle, FiCheckCircle, FiCalendar, FiPackage } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const FacilityDepartmentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Təsərrüfat Şöbəsi"
        subtitle="Avadanlıq və infrastruktur idarəetməsi"
        icon={<FiTool className="w-6 h-6 text-orange-600" />}
      >
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ümumi Avadanlıq</p>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
                <FiPackage className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktiv Təmir</p>
                  <p className="text-2xl font-bold text-orange-600">15</p>
                </div>
                <FiTool className="w-8 h-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Problematik</p>
                  <p className="text-2xl font-bold text-red-600">8</p>
                </div>
                <FiAlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bu Ay Təmir</p>
                  <p className="text-2xl font-bold text-green-600">42</p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Requests */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Təmir Sorğuları</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div>
                    <p className="font-medium">İstilik Sistemi Nasazlığı</p>
                    <p className="text-sm text-gray-600">123 saylı məktəb • 2 saat əvvəl</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Təcili</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div>
                    <p className="font-medium">Kompüter Laboratoriyası</p>
                    <p className="text-sm text-gray-600">45 saylı məktəb • 5 saat əvvəl</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Orta</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium">Bağça Təmiri</p>
                    <p className="text-sm text-gray-600">78 saylı məktəb • 1 gün əvvəl</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Aşağı</span>
                </div>
              </div>
            </Card>

            {/* Asset Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Avadanlıq İdarəetməsi</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kompüterlər</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">425/500</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proyektorlar</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-sm font-medium">140/200</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Masa və Stul</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-medium">1900/2000</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Laboratoriya Avadanlığı</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium">180/300</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Maintenance Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Təmir Cədvəli</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Məktəb</th>
                    <th className="text-left py-2">Təmir Növü</th>
                    <th className="text-left py-2">Planlaşdırılmış Tarix</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Məsul</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">12 saylı məktəb</td>
                    <td className="py-3">Elektrik sistemi</td>
                    <td className="py-3">20 Yanvar 2024</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Planlaşdırılıb</span>
                    </td>
                    <td className="py-3">Rəşad Məmmədov</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">34 saylı məktəb</td>
                    <td className="py-3">Boya işləri</td>
                    <td className="py-3">18 Yanvar 2024</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Davam edir</span>
                    </td>
                    <td className="py-3">Əli Həsənov</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">67 saylı məktəb</td>
                    <td className="py-3">Su sistemi</td>
                    <td className="py-3">15 Yanvar 2024</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Tamamlandı</span>
                    </td>
                    <td className="py-3">Cavid Quliyev</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sürətli Əməliyyatlar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiAlertTriangle className="w-6 h-6" />
                <span className="text-sm">Təcili Təmir</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiPackage className="w-6 h-6" />
                <span className="text-sm">Yeni Avadanlıq</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiCalendar className="w-6 h-6" />
                <span className="text-sm">Təmir Planla</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiHome className="w-6 h-6" />
                <span className="text-sm">Bina Müayinəsi</span>
              </Button>
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default FacilityDepartmentPage;