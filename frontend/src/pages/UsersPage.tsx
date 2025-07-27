import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const UsersPage: React.FC = () => {
  const { user } = useAuth();

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
            İstifadəçilər
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Sistem istifadəçilərini idarə edin
          </p>
        </div>
        
        <button style={{
          background: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          + Yeni İstifadəçi
        </button>
      </div>

      {/* Simple content */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>İstifadəçi Siyahısı</h3>
        <p style={{ color: '#6b7280' }}>
          İstifadəçi siyahısı burada görünəcək...
        </p>
      </div>
    </div>
  );
};

export default UsersPage;