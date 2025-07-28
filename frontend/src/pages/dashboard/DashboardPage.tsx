import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Dashboard
        </h1>
        <p className="text-neutral-600 mt-1">
          ATİS İdarəetmə Paneli
        </p>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-card hover:shadow-card-elevated transition-shadow duration-200">
          <h3 className="text-neutral-900 mb-2 font-medium">İstifadəçilər</h3>
          <p className="text-2xl font-bold text-primary-500">1,234</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-card hover:shadow-card-elevated transition-shadow duration-200">
          <h3 className="text-neutral-900 mb-2 font-medium">Müəssisələr</h3>
          <p className="text-2xl font-bold text-success-500">89</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-card hover:shadow-card-elevated transition-shadow duration-200">
          <h3 className="text-neutral-900 mb-2 font-medium">Sorğular</h3>
          <p className="text-2xl font-bold text-warning-500">45</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-card hover:shadow-card-elevated transition-shadow duration-200">
          <h3 className="text-neutral-900 mb-2 font-medium">Hesabatlar</h3>
          <p className="text-2xl font-bold text-error-500">12</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-card">
        <h3 className="text-neutral-900 mb-4 font-semibold">Son Fəaliyyətlər</h3>
        <p className="text-neutral-600">
          Son fəaliyyətlər burada görünəcək...
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;