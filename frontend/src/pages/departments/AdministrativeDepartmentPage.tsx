import React from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiClipboard, FiMail, FiFileText, FiUsers, FiCalendar, FiBell } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const AdministrativeDepartmentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="İnzibati Şöbə"
        subtitle="Siyasət idarəetməsi və kommunikasiya"
        icon={<FiClipboard className="w-6 h-6 text-blue-600" />}
      >
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktiv Siyasətlər</p>
                  <p className="text-2xl font-bold text-blue-600">24</p>
                </div>
                <FiFileText className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bu Ay Məktublar</p>
                  <p className="text-2xl font-bold text-green-600">156</p>
                </div>
                <FiMail className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gözləyən Təsdiq</p>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                </div>
                <FiBell className="w-8 h-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktiv Müqavilələr</p>
                  <p className="text-2xl font-bold text-purple-600">42</p>
                </div>
                <FiUsers className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Policy Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Siyasət İdarəetməsi</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">İşəgötürmə Siyasəti</p>
                    <p className="text-sm text-gray-600">Son yenilənmə: 10 Yanvar</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Təhlükəsizlik Protokolu</p>
                    <p className="text-sm text-gray-600">Son yenilənmə: 8 Yanvar</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Yenilənir</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Müəllim Təlimatı</p>
                    <p className="text-sm text-gray-600">Son yenilənmə: 5 Yanvar</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Aktiv</span>
                </div>
              </div>
            </Card>

            {/* Communication Center */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Kommunikasiya Mərkəzi</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Regional İdarəyə hesabat göndərildi</p>
                    <p className="text-xs text-gray-500">2 saat əvvəl</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Yeni siyasət sənədi paylaşıldı</p>
                    <p className="text-xs text-gray-500">4 saat əvvəl</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Məktəblərə dövri məktub göndərildi</p>
                    <p className="text-xs text-gray-500">6 saat əvvəl</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Pending Approvals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Gözləyən Təsdiqlər</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Sənəd</th>
                    <th className="text-left py-2">Göndərən</th>
                    <th className="text-left py-2">Tarix</th>
                    <th className="text-left py-2">Prioritet</th>
                    <th className="text-left py-2">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Yeni İşçi Qəbulu</td>
                    <td className="py-3">Kadr Şöbəsi</td>
                    <td className="py-3">15 Yanvar</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Yüksək</span>
                    </td>
                    <td className="py-3">
                      <Button size="sm" className="mr-2">Təsdiq</Button>
                      <Button size="sm" variant="outline">Bax</Button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Büdcə Dəyişikliyi</td>
                    <td className="py-3">Maliyyə Şöbəsi</td>
                    <td className="py-3">14 Yanvar</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Orta</span>
                    </td>
                    <td className="py-3">
                      <Button size="sm" className="mr-2">Təsdiq</Button>
                      <Button size="sm" variant="outline">Bax</Button>
                    </td>
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
                <FiFileText className="w-6 h-6" />
                <span className="text-sm">Yeni Siyasət</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiMail className="w-6 h-6" />
                <span className="text-sm">Məktub Göndər</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiCalendar className="w-6 h-6" />
                <span className="text-sm">Tədbir Plan</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                <FiBell className="w-6 h-6" />
                <span className="text-sm">Elan Paylaş</span>
              </Button>
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default AdministrativeDepartmentPage;