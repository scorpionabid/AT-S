import React from 'react';

const InstitutionsPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            Müəssisələr
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Təhsil müəssisələrini idarə edin
          </p>
        </div>
        
        <button style={{
          background: '#10b981',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          + Yeni Müəssisə
        </button>
      </div>

      {/* Stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '16px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Məktəblər</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>234</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '16px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Uşaq Bağçaları</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>89</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '16px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Liseylər</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>45</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '16px'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Digər</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>12</p>
        </div>
      </div>

      {/* Institutions list */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>Müəssisə Siyahısı</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Müəssisə axtar..."
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ color: '#6b7280' }}>
          Müəssisə siyahısı burada görünəcək...
        </div>
      </div>
    </div>
  );
};

export default InstitutionsPage;