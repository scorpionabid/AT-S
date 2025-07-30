import React from 'react';
import StandardPageLayout from '../components/layout/StandardPageLayout';
import { FiHome } from 'react-icons/fi';

const InstitutionsPage: React.FC = () => {
  return (
    <StandardPageLayout
      title="Müəssisələr"
      subtitle="Təhsil müəssisələrini idarə edin"
      icon={<FiHome className="w-6 h-6 text-blue-600" />}
    >
      <div className="dashboard-container">
        {/* Action Button */}
        <div className="dashboard-grid">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Müəssisə İdarəçiliyi</h3>
                <p className="chart-subtitle">Müəssisələri əlavə edin və idarə edin</p>
              </div>
              <button className="px-4 py-2 bg-success-500 text-white rounded-md text-sm hover:bg-success-600 font-medium">
                + Yeni Müəssisə
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-success-100 text-success-600">
                🏫
              </div>
            </div>
            <div className="stats-card-value">234</div>
            <div className="stats-card-title">Məktəblər</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-primary-100 text-primary-600">
                🧒
              </div>
            </div>
            <div className="stats-card-value">89</div>
            <div className="stats-card-title">Uşaq Bağçaları</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-warning-100 text-warning-600">
                🎓
              </div>
            </div>
            <div className="stats-card-value">45</div>
            <div className="stats-card-title">Liseylər</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-purple-100 text-purple-600">
                📚
              </div>
            </div>
            <div className="stats-card-value">12</div>
            <div className="stats-card-title">Digər</div>
          </div>
        </div>

        {/* Institutions List */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Müəssisələr Siyahısı</h3>
              <p className="chart-subtitle">Bütün müəssisələrin siyahısı</p>
            </div>
          </div>
          <div className="text-sm text-neutral-600 p-4">
            Müəssisələr cədvəli həyata keçirilir...
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default InstitutionsPage;