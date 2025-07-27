import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f9fafb' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
        Test Səhifəsi
      </h1>
      
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <p style={{ color: '#6b7280' }}>
          Bu sadə test səhifəsidir. Bütün Tailwind CSS kodları silindi.
        </p>
      </div>
    </div>
  );
};

export default TailwindTest;