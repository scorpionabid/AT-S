import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import DepartmentManagement from '../departments/DepartmentManagement';

interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  region_code: string;
  institution_code: string;
  is_active: boolean;
  established_date: string;
  hierarchy_path: string;
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  metadata: {
    description?: string;
    website?: string;
  };
  parent: {
    id: number;
    name: string;
    type: string;
  } | null;
  children_count: number;
  created_at: string;
  updated_at: string;
}

interface InstitutionDetailsProps {
  institutionId: number;
  onClose: () => void;
}

const InstitutionDetails: React.FC<InstitutionDetailsProps> = ({ institutionId, onClose }) => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'departments'>('details');

  useEffect(() => {
    fetchInstitutionDetails();
  }, [institutionId]);

  const fetchInstitutionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/institutions/${institutionId}`);
      setInstitution(response.data.institution);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Təşkilat məlumatları yüklənərkən xəta baş verdi';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canManage = () => {
    const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
    return roleName === 'superadmin';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('az-AZ');
  };

  const getTypeDisplayName = (type: string) => {
    const types = {
      'ministry': 'Nazirlik',
      'region': 'Regional İdarə',
      'sektor': 'Sektor',
      'school': 'Məktəb',
      'vocational': 'Peşə Məktəbi',
      'university': 'Universitet'
    };
    return types[type as keyof typeof types] || type;
  };

  const getLevelDisplayName = (level: number) => {
    const levels = {
      1: 'Səviyyə 1 - Nazirlik',
      2: 'Səviyyə 2 - Regional',
      3: 'Səviyyə 3 - Sektor',
      4: 'Səviyyə 4 - Məktəb',
      5: 'Səviyyə 5 - Şöbə'
    };
    return levels[level as keyof typeof levels] || `Səviyyə ${level}`;
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content institution-details-modal">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Təşkilat məlumatları yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="modal-overlay">
        <div className="modal-content institution-details-modal">
          <div className="modal-header">
            <h2>Xəta</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error || 'Təşkilat tapılmadı'}</span>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary">Bağla</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal-content institution-details-modal large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="institution-header">
            <h2>{institution.name}</h2>
            {institution.short_name && (
              <span className="institution-short">({institution.short_name})</span>
            )}
            <div className="institution-badges">
              <span className={`type-badge type-${institution.type}`}>
                {getTypeDisplayName(institution.type)}
              </span>
              <span className={`level-badge level-${institution.level}`}>
                {getLevelDisplayName(institution.level)}
              </span>
              <span className={`status-badge ${institution.is_active ? 'active' : 'inactive'}`}>
                {institution.is_active ? 'Aktiv' : 'Deaktiv'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 Detallar
          </button>
          <button 
            className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            🏢 Şöbələr
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'details' && (
            <div className="institution-details-content">
              {/* Basic Information */}
              <div className="details-section">
                <h3>🏢 Əsas Məlumatlar</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Təşkilat kodu:</span>
                    <span className="detail-value">{institution.institution_code || 'Təyin edilməyib'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Region kodu:</span>
                    <span className="detail-value">{institution.region_code || 'Təyin edilməyib'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Təsis tarixi:</span>
                    <span className="detail-value">
                      {institution.established_date ? formatDate(institution.established_date) : 'Məlum deyil'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ierarxiya yolu:</span>
                    <span className="detail-value">{institution.hierarchy_path}</span>
                  </div>
                  {institution.parent && (
                    <div className="detail-item">
                      <span className="detail-label">Ana təşkilat:</span>
                      <span className="detail-value">
                        {institution.parent.name} ({getTypeDisplayName(institution.parent.type)})
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Alt təşkilatlar:</span>
                    <span className="detail-value">{institution.children_count}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(institution.contact_info?.phone || institution.contact_info?.email || institution.contact_info?.address) && (
                <div className="details-section">
                  <h3>📞 Əlaqə Məlumatları</h3>
                  <div className="details-grid">
                    {institution.contact_info.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Telefon:</span>
                        <span className="detail-value">{institution.contact_info.phone}</span>
                      </div>
                    )}
                    {institution.contact_info.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">
                          <a href={`mailto:${institution.contact_info.email}`} target="_blank" rel="noopener noreferrer">
                            {institution.contact_info.email}
                          </a>
                        </span>
                      </div>
                    )}
                    {institution.contact_info.address && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Ünvan:</span>
                        <span className="detail-value">{institution.contact_info.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(institution.metadata?.description || institution.metadata?.website) && (
                <div className="details-section">
                  <h3>📋 Əlavə Məlumatlar</h3>
                  <div className="details-grid">
                    {institution.metadata.website && (
                      <div className="detail-item">
                        <span className="detail-label">Veb sayt:</span>
                        <span className="detail-value">
                          <a href={institution.metadata.website} target="_blank" rel="noopener noreferrer">
                            {institution.metadata.website}
                          </a>
                        </span>
                      </div>
                    )}
                    {institution.metadata.description && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Təsvir:</span>
                        <span className="detail-value">{institution.metadata.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="details-section">
                <h3>🔧 Sistem Məlumatları</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Yaradılma tarixi:</span>
                    <span className="detail-value">{formatDate(institution.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Son yenilənmə:</span>
                    <span className="detail-value">{formatDate(institution.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="departments-tab-content">
              <DepartmentManagement 
                institutionId={institution.id}
                institutionType={institution.type}
                canManage={canManage()}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Bağla</button>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetails;