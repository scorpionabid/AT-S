import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  level: number;
  parent_id: number;
  institution_code: string;
  contact_info: any;
  location: any;
  is_active: boolean;
  established_date: string;
}

interface InstitutionEditFormProps {
  institution: Institution;
  onSuccess: () => void;
  onCancel: () => void;
}

interface UpdateInstitutionData {
  name: string;
  short_name: string;
  institution_code: string;
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };
  location: {
    region?: string;
    district?: string;
    address?: string;
  };
  is_active: boolean;
  established_date?: string;
}

const InstitutionEditForm: React.FC<InstitutionEditFormProps> = ({
  institution,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateInstitutionData>({
    name: institution.name || '',
    short_name: institution.short_name || '',
    institution_code: institution.institution_code || '',
    contact_info: {
      phone: institution.contact_info?.phone || '',
      email: institution.contact_info?.email || '',
      address: institution.contact_info?.address || ''
    },
    location: {
      region: institution.location?.region || '',
      district: institution.location?.district || '',
      address: institution.location?.address || ''
    },
    is_active: institution.is_active,
    established_date: institution.established_date ? 
      new Date(institution.established_date).toISOString().split('T')[0] : ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UpdateInstitutionData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/regionadmin/institutions/${institution.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Təşkilat yenilənə bilmədi');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionTypeDisplay = (type: string): string => {
    const types: Record<string, string> = {
      'sektor': 'Sektor',
      'sector_education_office': 'Sektor',
      'school': 'Məktəb',
      'secondary_school': 'Orta Məktəb',
      'primary_school': 'İbtidai Məktəb',
      'gymnasium': 'Gimnaziya',
      'vocational': 'Peşə Məktəbi'
    };
    return types[type] || type;
  };

  return (
    <div className="institution-edit-form">
      <div className="form-header">
        <h2>Təşkilat Redaktəsi</h2>
        <button onClick={onCancel} className="close-btn">✕</button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Əsas Məlumatlar</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Təşkilat Adı *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="short_name">Qısa Ad</label>
              <input
                type="text"
                id="short_name"
                name="short_name"
                value={formData.short_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Təşkilat Tipi</label>
              <input
                type="text"
                value={getInstitutionTypeDisplay(institution.type)}
                disabled
                className="disabled-field"
              />
              <small className="field-note">Təşkilat tipi dəyişdirilə bilməz</small>
            </div>

            <div className="form-group">
              <label htmlFor="institution_code">Təşkilat Kodu</label>
              <input
                type="text"
                id="institution_code"
                name="institution_code"
                value={formData.institution_code}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="established_date">Yaranma Tarixi</label>
              <input
                type="date"
                id="established_date"
                name="established_date"
                value={formData.established_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <span className="checkbox-text">Aktiv təşkilat</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Əlaqə Məlumatları</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contact_info.phone">Telefon</label>
              <input
                type="tel"
                id="contact_info.phone"
                name="contact_info.phone"
                value={formData.contact_info.phone || ''}
                onChange={handleInputChange}
                placeholder="+994 XX XXX XX XX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_info.email">Email</label>
              <input
                type="email"
                id="contact_info.email"
                name="contact_info.email"
                value={formData.contact_info.email || ''}
                onChange={handleInputChange}
                placeholder="info@example.az"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="contact_info.address">Ünvan</label>
              <textarea
                id="contact_info.address"
                name="contact_info.address"
                value={formData.contact_info.address || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Təşkilatın ünvanı"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="form-section">
          <h3>Məkan Məlumatları</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="location.region">Region</label>
              <input
                type="text"
                id="location.region"
                name="location.region"
                value={formData.location.region || ''}
                onChange={handleInputChange}
                placeholder="Məsələn: Gəncə"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location.district">Rayon</label>
              <input
                type="text"
                id="location.district"
                name="location.district"
                value={formData.location.district || ''}
                onChange={handleInputChange}
                placeholder="Məsələn: Kəpəz"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Yenilənir...' : 'Dəyişiklikləri Saxla'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionEditForm;