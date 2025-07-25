import React, { useEffect, useState } from 'react';
import { useForm, validationRules } from '../../hooks';
import { api } from '../../services/api';
import '../../styles/institutions.css';

// Types
interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
  parent_id: number | null;
  level: number;
  region_code: string;
  institution_code: string;
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
  is_active: boolean;
  established_date: string;
}

interface InstitutionFormProps {
  isEdit?: boolean;
  institutionId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface InstitutionFormData {
  name: string;
  short_name: string;
  type: string;
  parent_id: number | null;
  level: number;
  region_code: string;
  institution_code: string;
  phone: string;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
  location_address: string;
  description: string;
  website: string;
  is_active: boolean;
  established_date: string;
}

const initialFormData: InstitutionFormData = {
  name: '',
  short_name: '',
  type: '',
  parent_id: null,
  level: 1,
  region_code: '',
  institution_code: '',
  phone: '',
  email: '',
  address: '',
  latitude: '',
  longitude: '',
  location_address: '',
  description: '',
  website: '',
  is_active: true,
  established_date: ''
};

// Validation rules for institution form
const institutionValidationRules = {
  name: validationRules.required,
  short_name: validationRules.required,
  type: validationRules.required,
  level: validationRules.required,
  region_code: validationRules.required,
  institution_code: validationRules.required,
  email: (value: string) => {
    if (!value) return null;
    return validationRules.email(value);
  },
  website: (value: string) => {
    if (!value) return null;
    const urlPattern = /^https?:\/\/.+/;
    return !urlPattern.test(value) ? 'Düzgün URL formatı daxil edin (http:// və ya https://)' : null;
  }
};

const InstitutionFormUnified: React.FC<InstitutionFormProps> = ({
  isEdit = false,
  institutionId,
  onClose,
  onSuccess
}) => {
  // State for dropdown options
  const [parentInstitutions, setParentInstitutions] = useState<Institution[]>([]);
  const [institutionTypes] = useState([
    { value: 'ministry', label: 'Nazirlik' },
    { value: 'region', label: 'Regional İdarə' },
    { value: 'sektor', label: 'Sektor' },
    { value: 'school', label: 'Məktəb' },
    { value: 'gymnasium', label: 'Gimnaziya' },
    { value: 'lyceum', label: 'Litse' },
    { value: 'university', label: 'Universitet' },
    { value: 'college', label: 'Kollec' }
  ]);

  // Use our custom form hook
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    setFormData,
    setErrors,
    setLoading,
    validateForm
  } = useForm<InstitutionFormData>({
    initialData: initialFormData,
    validationRules: institutionValidationRules,
    onSubmit: handleFormSubmit
  });

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && institutionId) {
      loadInstitutionData();
    }
  }, [isEdit, institutionId]);

  // Load parent institutions
  useEffect(() => {
    loadParentInstitutions();
  }, []);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/institutions/${institutionId}`);
      const institution = response.data;
      
      // Transform API data to form format
      setFormData({
        name: institution.name || '',
        short_name: institution.short_name || '',
        type: institution.type || '',
        parent_id: institution.parent_id || null,
        level: institution.level || 1,
        region_code: institution.region_code || '',
        institution_code: institution.institution_code || '',
        phone: institution.contact_info?.phone || '',
        email: institution.contact_info?.email || '',
        address: institution.contact_info?.address || '',
        latitude: institution.location?.latitude?.toString() || '',
        longitude: institution.location?.longitude?.toString() || '',
        location_address: institution.location?.address || '',
        description: institution.metadata?.description || '',
        website: institution.metadata?.website || '',
        is_active: institution.is_active !== false,
        established_date: institution.established_date || ''
      });
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Məlumatları yükləyərkən xəta baş verdi' });
    } finally {
      setLoading(false);
    }
  };

  const loadParentInstitutions = async () => {
    try {
      const response = await api.get('/institutions', {
        params: { per_page: 100, type: 'parent' }
      });
      setParentInstitutions(response.data.data || []);
    } catch (error) {
      console.error('Error loading parent institutions:', error);
    }
  };

  async function handleFormSubmit(data: InstitutionFormData) {
    try {
      // Transform form data to API format
      const apiData = {
        name: data.name,
        short_name: data.short_name,
        type: data.type,
        parent_id: data.parent_id,
        level: data.level,
        region_code: data.region_code,
        institution_code: data.institution_code,
        contact_info: {
          phone: data.phone || undefined,
          email: data.email || undefined,
          address: data.address || undefined
        },
        location: {
          latitude: data.latitude ? parseFloat(data.latitude) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude) : undefined,
          address: data.location_address || undefined
        },
        metadata: {
          description: data.description || undefined,
          website: data.website || undefined
        },
        is_active: data.is_active,
        established_date: data.established_date || undefined
      };

      if (isEdit && institutionId) {
        await api.put(`/institutions/${institutionId}`, apiData);
      } else {
        await api.post('/institutions', apiData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || 
                   `${isEdit ? 'Yenilənmə' : 'Yaradılma'} zamanı xəta baş verdi` 
        });
      }
      throw error; // Re-throw to let useForm handle loading state
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = name === 'parent_id' ? (value ? parseInt(value) : null) : value;
    handleInputChange({ ...e, target: { ...e.target, value: finalValue } } as any);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content institution-form-modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Təşkilatı Yenilə' : 'Yeni Təşkilat Yarat'}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="institution-form">
          {errors.general && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="form-section">
            <h3>Əsas Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Tam Ad *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Təşkilatın tam adı"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="short_name">Qısa Ad *</label>
                <input
                  type="text"
                  id="short_name"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className={errors.short_name ? 'error' : ''}
                  placeholder="Təşkilatın qısa adı"
                />
                {errors.short_name && <span className="field-error">{errors.short_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type">Təşkilat Növü *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="">Növü seçin</option>
                  {institutionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && <span className="field-error">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="parent_id">Üst Təşkilat</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id || ''}
                  onChange={handleSelectChange}
                >
                  <option value="">Üst təşkilat seçin</option>
                  {parentInstitutions.map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="level">Səviyyə *</label>
                <input
                  type="number"
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={errors.level ? 'error' : ''}
                  min="1"
                  max="10"
                />
                {errors.level && <span className="field-error">{errors.level}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="region_code">Region Kodu *</label>
                <input
                  type="text"
                  id="region_code"
                  name="region_code"
                  value={formData.region_code}
                  onChange={handleInputChange}
                  className={errors.region_code ? 'error' : ''}
                  placeholder="AZ-XX"
                />
                {errors.region_code && <span className="field-error">{errors.region_code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="institution_code">Təşkilat Kodu *</label>
                <input
                  type="text"
                  id="institution_code"
                  name="institution_code"
                  value={formData.institution_code}
                  onChange={handleInputChange}
                  className={errors.institution_code ? 'error' : ''}
                  placeholder="TXXX"
                />
                {errors.institution_code && <span className="field-error">{errors.institution_code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="established_date">Təsis Tarixi</label>
                <input
                  type="date"
                  id="established_date"
                  name="established_date"
                  value={formData.established_date}
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
                <label htmlFor="phone">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+994XXXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="email@example.com"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="address">Ünvan</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Təşkilatın ünvanı"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3>Əlavə Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="website">Veb Sayt</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={errors.website ? 'error' : ''}
                  placeholder="https://example.com"
                />
                {errors.website && <span className="field-error">{errors.website}</span>}
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange({
                      ...e,
                      target: { ...e.target, value: e.target.checked }
                    } as any)}
                  />
                  Aktiv
                </label>
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="description">Təsvir</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Təşkilat haqqında əlavə məlumat"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-button-group">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-base btn-secondary"
              disabled={loading}
            >
              Ləğv et
            </button>
            <button 
              type="submit" 
              className="btn-base btn-primary"
              disabled={loading}
            >
              {loading ? 'Yüklənir...' : (isEdit ? 'Yenilə' : 'Yarat')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionFormUnified;