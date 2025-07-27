import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Institution {
  id: number;
  name: string;
  short_name: string;
  type: string;
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
  parent: {
    id: number;
    name: string;
    type: string;
  } | null;
}

interface InstitutionEditData {
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

interface AvailableParent {
  id: number;
  name: string;
  type: string;
  level: number;
}

interface InstitutionEditFormProps {
  institutionId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const InstitutionEditForm: React.FC<InstitutionEditFormProps> = ({ institutionId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<InstitutionEditData>({
    name: '',
    short_name: '',
    type: 'school',
    parent_id: null,
    level: 4,
    region_code: '',
    institution_code: '',
    contact_info: {},
    location: {},
    metadata: {},
    is_active: true,
    established_date: ''
  });

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [availableParents, setAvailableParents] = useState<AvailableParent[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const institutionTypes = [
    { value: 'ministry', label: 'Nazirlik', level: 1 },
    { value: 'region', label: 'Regional İdarə', level: 2 },
    { value: 'sektor', label: 'Sektor', level: 3 },
    { value: 'school', label: 'Məktəb', level: 4 },
    { value: 'vocational', label: 'Peşə Məktəbi', level: 4 },
    { value: 'university', label: 'Universitet', level: 4 }
  ];

  const levelOptions = [
    { value: 1, label: 'Səviyyə 1 - Nazirlik' },
    { value: 2, label: 'Səviyyə 2 - Regional' },
    { value: 3, label: 'Səviyyə 3 - Sektor' },
    { value: 4, label: 'Səviyyə 4 - Məktəb' },
    { value: 5, label: 'Səviyyə 5 - Şöbə' }
  ];

  useEffect(() => {
    fetchInstitution();
  }, [institutionId]);

  useEffect(() => {
    if (formData.level) {
      fetchAvailableParents();
    }
  }, [formData.level, institutionId]);

  const fetchInstitution = async () => {
    try {
      setFetchLoading(true);
      console.log('🔍 Fetching institution with ID:', institutionId);
      const response = await api.get(`/institutions/${institutionId}`);
      console.log('📥 Institution API response:', response.data);
      
      // Handle different response structures
      const institutionData = response.data.data || response.data.institution || response.data;
      console.log('📋 Institution data:', institutionData);
      
      setInstitution(institutionData);
      
      setFormData({
        name: institutionData.name || '',
        short_name: institutionData.short_name || '',
        type: institutionData.type || 'school',
        parent_id: institutionData.parent ? institutionData.parent.id : null,
        level: institutionData.level || 4,
        region_code: institutionData.region_code || '',
        institution_code: institutionData.institution_code || '',
        contact_info: institutionData.contact_info || {},
        location: institutionData.location || {},
        metadata: institutionData.metadata || {},
        is_active: institutionData.is_active ?? true,
        established_date: institutionData.established_date || ''
      });
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || 'Təşkilat məlumatları yüklənərkən xəta baş verdi'
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchAvailableParents = async () => {
    try {
      // Fetch institutions that can be parents (level < current level, excluding self and descendants)
      if (formData.level > 1) {
        const response = await api.get(`/institutions?level=${formData.level - 1}&is_active=true&no_cache=1`);
        const parents = (response.data.institutions || []).filter((parent: AvailableParent) => 
          parent.id !== institutionId // Exclude self
        );
        setAvailableParents(parents);
      } else {
        setAvailableParents([]);
      }
    } catch (error) {
      console.error('Available parents fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'level' || name === 'parent_id') {
      const numValue = value === '' ? null : parseInt(value);
      
      // Auto-generate region code when parent changes
      if (name === 'parent_id' && numValue) {
        const parent = availableParents.find(p => p.id === numValue);
        if (parent) {
          const parentRegionCode = getRegionCodeFromParent(parent);
          setFormData(prev => ({
            ...prev,
            [name]: numValue,
            region_code: parentRegionCode
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: numValue
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: numValue
        }));
      }
    } else if (name === 'is_active') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name.includes('.')) {
      // Handle nested object fields like contact_info.phone
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof InstitutionEditData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Helper function to determine region code from parent
  const getRegionCodeFromParent = (parent: any): string => {
    // If parent has region_code, use it
    if (parent.region_code) {
      return parent.region_code;
    }
    
    // If parent is regional type, determine from name
    if (parent.type === 'region') {
      const name = parent.name.toLowerCase();
      if (name.includes('bakı')) return 'BAK';
      if (name.includes('gəncə')) return 'GAN';
      if (name.includes('lənkəran')) return 'LAN';
      if (name.includes('sumqayıt')) return 'SUM';
      if (name.includes('şirvan')) return 'SIR';
      if (name.includes('mingəçevir')) return 'MIN';
      if (name.includes('naxçıvan')) return 'NAX';
      if (name.includes('şəmkir')) return 'SMX';
      if (name.includes('göygöl')) return 'GYG';
    }
    
    // Default to Azerbaijan if can't determine
    return 'AZ';
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const typeConfig = institutionTypes.find(t => t.value === newType);
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      level: typeConfig?.level || 4,
      parent_id: null // Reset parent when type changes
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Təşkilat adı mütləqdir';
    }

    if (!formData.type) {
      newErrors.type = 'Təşkilat tipi mütləqdir';
    }

    if (formData.level < 1 || formData.level > 5) {
      newErrors.level = 'Səviyyə 1-5 arasında olmalıdır';
    }

    if (formData.level > 1 && !formData.parent_id) {
      newErrors.parent_id = 'Yuxarı səviyyə təşkilat seçilməlidir';
    }

    if (formData.institution_code && !/^[A-Z0-9_]{2,20}$/.test(formData.institution_code)) {
      newErrors.institution_code = 'Kod 2-20 simvol, yalnız böyük həriflər, rəqəmlər və _';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.put(`/institutions/${institutionId}`, formData);
      console.log('Institution updated successfully:', response.data);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Institution update error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Təşkilat yenilənərkən xəta baş verdi'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isSystemInstitution = () => {
    return institution?.level === 1 || institution?.type === 'ministry';
  };

  if (fetchLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Təşkilat məlumatları yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content institution-edit-modal">
        <div className="modal-header">
          <h2>Təşkilatı Redaktə Et: {institution?.name}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        {isSystemInstitution() && (
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <span>Bu sistem təşkilatıdır. Dəyişiklikləri diqqətlə edin.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="institution-edit-form">
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
                  className={errors.name ? 'error' : ''}
                  placeholder="Məktəbin və ya təşkilatın tam adı"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="short_name">Qısa Ad</label>
                <input
                  type="text"
                  id="short_name"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className={errors.short_name ? 'error' : ''}
                  placeholder="Qısa ad və ya akronim"
                />
                {errors.short_name && <span className="field-error">{errors.short_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type">Təşkilat Tipi *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className={errors.type ? 'error' : ''}
                  disabled={isSystemInstitution()}
                >
                  {institutionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && <span className="field-error">{errors.type}</span>}
                {isSystemInstitution() && (
                  <small className="form-note">Sistem təşkilatının tipi dəyişdirilə bilməz</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="level">Ierarxiya Səviyyəsi *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={errors.level ? 'error' : ''}
                  disabled={isSystemInstitution()}
                >
                  {levelOptions.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.level && <span className="field-error">{errors.level}</span>}
                {isSystemInstitution() && (
                  <small className="form-note">Sistem təşkilatının səviyyəsi dəyişdirilə bilməz</small>
                )}
              </div>

              {formData.level > 1 && (
                <div className="form-group">
                  <label htmlFor="parent_id">Yuxarı Səviyyə Təşkilat *</label>
                  <select
                    id="parent_id"
                    name="parent_id"
                    value={formData.parent_id || ''}
                    onChange={handleInputChange}
                    className={errors.parent_id ? 'error' : ''}
                    disabled={isSystemInstitution()}
                  >
                    <option value="">Seçin...</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} ({parent.type})
                      </option>
                    ))}
                  </select>
                  {errors.parent_id && <span className="field-error">{errors.parent_id}</span>}
                  {isSystemInstitution() && (
                    <small className="form-note">Sistem təşkilatının valideynliyi dəyişdirilə bilməz</small>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="institution_code">Təşkilat Kodu</label>
                <input
                  type="text"
                  id="institution_code"
                  name="institution_code"
                  value={formData.institution_code}
                  onChange={handleInputChange}
                  className={errors.institution_code ? 'error' : ''}
                  placeholder="MEKTEB_001"
                />
                {errors.institution_code && <span className="field-error">{errors.institution_code}</span>}
                <small className="form-note">Yalnız böyük həriflər, rəqəmlər və _ istifadə edin</small>
              </div>

              <div className="form-group">
                <label htmlFor="region_code">Region Kodu</label>
                <input
                  type="text"
                  id="region_code"
                  name="region_code"
                  value={formData.region_code}
                  readOnly
                  className={`readonly-field ${errors.region_code ? 'error' : ''}`}
                  placeholder="Parent təşkilatdan avtomatik gələcək..."
                />
                <small className="field-hint">
                  Bu field avtomatik olaraq yuxarı səviyyə təşkilatdan götürülür
                </small>
                {errors.region_code && <span className="field-error">{errors.region_code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="established_date">Təsis Tarixi</label>
                <input
                  type="date"
                  id="established_date"
                  name="established_date"
                  value={formData.established_date}
                  onChange={handleInputChange}
                  className={errors.established_date ? 'error' : ''}
                />
                {errors.established_date && <span className="field-error">{errors.established_date}</span>}
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
                  placeholder="info@institution.edu.az"
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="contact_info.address">Ünvan</label>
                <textarea
                  id="contact_info.address"
                  name="contact_info.address"
                  value={formData.contact_info.address || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Tam ünvan"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3>Əlavə Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="metadata.website">Veb sayt</label>
                <input
                  type="url"
                  id="metadata.website"
                  name="metadata.website"
                  value={formData.metadata.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://institution.edu.az"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={isSystemInstitution()}
                  />
                  Aktiv təşkilat
                </label>
                {isSystemInstitution() && (
                  <small className="form-note">Sistem təşkilatı deaktiv edilə bilməz</small>
                )}
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="metadata.description">Təsvir</label>
                <textarea
                  id="metadata.description"
                  name="metadata.description"
                  value={formData.metadata.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Təşkilat haqqında əlavə məlumat"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Ləğv et
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Yenilənir...' : 'Dəyişiklikləri saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionEditForm;