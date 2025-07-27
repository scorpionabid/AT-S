import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>
          ATİS İdarəetmə Paneli
        </p>
      </div>

      {/* Dashboard cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>İstifadəçilər</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>1,234</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Müəssisələr</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>89</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Sorğular</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>45</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Hesabatlar</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>12</p>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>Son Fəaliyyətlər</h3>
        <p style={{ color: '#6b7280' }}>
          Son fəaliyyətlər burada görünəcək...
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;