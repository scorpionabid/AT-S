import React from 'react';
import { DashboardLayout } from '../../components/layout/Dashboard';
import StandardPageLayout from '../../components/layout/StandardPageLayout';
import { FiDollarSign, FiBarChart, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const FinanceDepartmentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <StandardPageLayout 
        title="Maliyyə Şöbəsi"
        subtitle="Büdcə izləmə və maliyyə hesabatları"
        icon={<FiDollarSign className="w-6 h-6 text-green-600" />}
      >
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ümumi Büdcə</p>
                  <p className="text-2xl font-bold text-green-600">₼2,450,000</p>
                </div>
                <FiDollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">İstifadə Olunan</p>
                  <p className="text-2xl font-bold text-blue-600">₼1,890,500</p>
                </div>
                <FiBarChart className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Qalan Büdcə</p>
                  <p className="text-2xl font-bold text-purple-600">₼559,500</p>
                </div>
                <FiTrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bu Ay Xərc</p>
                  <p className="text-2xl font-bold text-orange-600">₼185,000</p>
                </div>
                <FiFileText className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Büdcə Bölgüsü</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">İnsan Resursları</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">İnfrastruktur</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Təlim və İnkişaf</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Digər Xərclər</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Son Əməliyyatlar</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Müəllim Maaşları</p>
                    <p className="text-sm text-gray-600">15 Yanvar 2024</p>
                  </div>
                  <span className="text-red-600 font-medium">-₼125,000</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Avadanlıq Alışı</p>
                    <p className="text-sm text-gray-600">12 Yanvar 2024</p>
                  </div>
                  <span className="text-red-600 font-medium">-₼45,000</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Büdcə Artımı</p>
                    <p className="text-sm text-gray-600">10 Yanvar 2024</p>
                  </div>
                  <span className="text-green-600 font-medium">+₼200,000</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Maliyyə Əməliyyatları</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="flex items-center space-x-2">
                <FiFileText className="w-4 h-4" />
                <span>Büdcə Hesabatı</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <FiBarChart className="w-4 h-4" />
                <span>Xərc Analizi</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <FiTrendingUp className="w-4 h-4" />
                <span>Proqnoz Hesabı</span>
              </Button>
            </div>
          </Card>
        </div>
      </StandardPageLayout>
    </DashboardLayout>
  );
};

export default FinanceDepartmentPage;