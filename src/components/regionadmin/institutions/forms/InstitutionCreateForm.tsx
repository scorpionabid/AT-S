import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

interface InstitutionCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface CreateInstitutionData {
  name: string;
  short_name: string;
  type: string;
  parent_id?: number;
  institution_code?: string;
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
  established_date?: string;
}

interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
}

const InstitutionCreateForm: React.FC<InstitutionCreateFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Institution[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  const [formData, setFormData] = useState<CreateInstitutionData>({
    name: '',
    short_name: '',
    type: 'sektor',
    contact_info: {},
    location: {}
  });

  // Fetch sectors when type changes to school
  React.useEffect(() => {
    if (formData.type === 'school' || formData.type === 'vocational') {
      fetchSectors();
    }
  }, [formData.type]);

  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/regionadmin/institutions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only sectors (level 3)
        const sectorList = data.institutions?.filter((inst: Institution) => inst.level === 3) || [];
        setSectors(sectorList);
      }
    } catch (err) {
      console.error('Failed to fetch sectors:', err);
    } finally {
      setLoadingSectors(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateInstitutionData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'parent_id' ? (value ? parseInt(value) : undefined) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/regionadmin/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Təşkilat yaradıla bilmədi');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const institutionTypes = [
    { value: 'sektor', label: 'Sektor' },
    { value: 'school', label: 'Məktəb' },
    { value: 'vocational', label: 'Peşə Məktəbi' }
  ];

  return (
    <div className="institution-create-form">
      <div className="form-header">
        <h2>Yeni Təşkilat Yarat</h2>
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
                placeholder="Məsələn: Gəncə Test Məktəbi"
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
                placeholder="Məsələn: GTM"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Təşkilat Tipi *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {institutionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {(formData.type === 'school' || formData.type === 'vocational') && (
              <div className="form-group">
                <label htmlFor="parent_id">Valideyn Sektor *</label>
                {loadingSectors ? (
                  <div className="loading-sectors">Sektorlar yüklənir...</div>
                ) : (
                  <select
                    id="parent_id"
                    name="parent_id"
                    value={formData.parent_id || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sektor seçin</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="institution_code">Təşkilat Kodu</label>
              <input
                type="text"
                id="institution_code"
                name="institution_code"
                value={formData.institution_code || ''}
                onChange={handleInputChange}
                placeholder="Məsələn: GTM-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="established_date">Yaranma Tarixi</label>
              <input
                type="date"
                id="established_date"
                name="established_date"
                value={formData.established_date || ''}
                onChange={handleInputChange}
              />
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
            {loading ? 'Yaradılır...' : 'Təşkilat Yarat'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstitutionCreateForm;