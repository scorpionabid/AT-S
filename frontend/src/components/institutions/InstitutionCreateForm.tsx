import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import '../../styles/institutions.css';

interface Institution {
  id: number;
  name: string;
  type: string;
  level: number;
}

interface InstitutionCreateData {
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

interface InstitutionCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InstitutionCreateForm: React.FC<InstitutionCreateFormProps> = ({ onClose, onSuccess }) => {
  console.log('🎨 InstitutionCreateForm component mounted');
  console.log('   - onClose callback:', typeof onClose);
  console.log('   - onSuccess callback:', typeof onSuccess);
  
  // Track component lifecycle
  console.log('🚀 Component render cycle started');
  const [formData, setFormData] = useState<InstitutionCreateData>({
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

  const [availableParents, setAvailableParents] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const institutionTypes = [
    { value: 'ministry', label: 'Nazirlik', level: 1 },
    { value: 'region', label: 'Regional İdarə', level: 2 },
    { value: 'sektor', label: 'Sektor', level: 3 },
    { value: 'school', label: 'Məktəb', level: 4 },
    { value: 'vocational', label: 'Peşə Məktəbi', level: 4 },
    { value: 'university', label: 'Universitet', level: 4 }
  ];

  const regionCodes = [
    { value: 'AZ', label: 'Azərbaycan Respublikası' },
    { value: 'BAK', label: 'Bakı' },
    { value: 'GAN', label: 'Gəncə' },
    { value: 'LAN', label: 'Lənkəran' },
    { value: 'SUM', label: 'Sumqayıt' },
    { value: 'SIR', label: 'Şirvan' },
    { value: 'MIN', label: 'Mingəçevir' },
    { value: 'NAX', label: 'Naxçıvan' },
    { value: 'SMX', label: 'Şəmkir' },
    { value: 'GYG', label: 'Göygöl' }
  ];

  const institutionCodePrefixes = {
    ministry: 'MIN',
    region: 'REG',
    sektor: 'SEK', 
    school: 'SCH',
    vocational: 'VOC',
    university: 'UNI'
  };

  const levelOptions = [
    { value: 1, label: 'Səviyyə 1 - Nazirlik' },
    { value: 2, label: 'Səviyyə 2 - Regional' },
    { value: 3, label: 'Səviyyə 3 - Sektor' },
    { value: 4, label: 'Səviyyə 4 - Məktəb' },
    { value: 5, label: 'Səviyyə 5 - Şöbə' }
  ];

  useEffect(() => {
    console.log('🔄 Form level changed, fetching parents...');
    fetchAvailableParents();
  }, [formData.level]);
  
  useEffect(() => {
    console.log('📋 Form data updated:', formData);
  }, [formData]);
  
  useEffect(() => {
    console.log('⚠️ Errors updated:', errors);
  }, [errors]);
  
  useEffect(() => {
    console.log('🔄 Loading state changed:', loading);
  }, [loading]);

  const fetchAvailableParents = async () => {
    console.log('📡 fetchAvailableParents called');
    console.log('   - Current form level:', formData.level);
    
    try {
      // Fetch institutions that can be parents (level < current level)
      if (formData.level > 1) {
        const targetLevel = formData.level - 1;
        console.log('   - Target parent level:', targetLevel);
        
        const params = new URLSearchParams({
          level: targetLevel.toString(),
          is_active: '1',
          no_cache: '1' // Disable cache to ensure fresh data
        });
        
        const url = `/institutions?${params}`;
        console.log('   - Making request to:', url);
        console.log('   - Params object:', Object.fromEntries(params));
        
        const response = await api.get(url);
        
        console.log('   - Success! Received institutions:', response.data.institutions?.length || 0);
        setAvailableParents(response.data.institutions || []);
      } else {
        console.log('   - Level 1 selected, no parents needed');
        setAvailableParents([]);
      }
    } catch (error: any) {
      console.error('❌ Available parents fetch error:', error);
      console.error('   - Error response data:', error.response?.data);
      console.error('   - Error status:', error.response?.status);
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
          ...prev[parent as keyof InstitutionCreateData],
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

  const generateInstitutionCode = () => {
    const type = formData.type || 'school';
    const typePrefix = institutionCodePrefixes[type as keyof typeof institutionCodePrefixes] || 'INS';
    const date = new Date();
    const timestamp = date.getFullYear().toString().slice(-2) + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${typePrefix}-${timestamp}-${random}`;
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const typeConfig = institutionTypes.find(t => t.value === newType);
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      level: typeConfig?.level || 4,
      parent_id: null, // Reset parent when type changes
      institution_code: prev.institution_code || generateInstitutionCode() // Auto-generate code only if empty
    }));
    
    // Clear parent-related errors when type changes
    if (errors.parent_id) {
      setErrors(prev => ({
        ...prev,
        parent_id: ''
      }));
    }
  };

  const handleGenerateCode = () => {
    setFormData(prev => ({
      ...prev,
      institution_code: generateInstitutionCode()
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Təşkilat adı mütləqdir';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Təşkilat adı minimum 3 simvol olmalıdır';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Təşkilat tipi mütləqdir';
    }

    // Level validation
    if (formData.level < 1 || formData.level > 5) {
      newErrors.level = 'Səviyyə 1-5 arasında olmalıdır';
    }

    // Hierarchy validation
    if (formData.level === 1 && formData.parent_id) {
      newErrors.parent_id = 'Nazirlik səviyyəsi (Level 1) üçün ana təşkilat seçilə bilməz';
    }

    if (formData.level > 1 && !formData.parent_id) {
      newErrors.parent_id = 'Bu səviyyə üçün ana təşkilat seçilməlidir';
    }

    // Institution code validation
    if (formData.institution_code && !/^[A-Z0-9_-]{2,20}$/.test(formData.institution_code)) {
      newErrors.institution_code = 'Kod 2-20 simvol, yalnız böyük həriflər, rəqəmlər, _ və -';
    }

    // Contact info validation
    if (formData.contact_info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_info.email)) {
      newErrors['contact_info.email'] = 'Düzgün email formatı daxil edin';
    }

    // Website validation
    if (formData.metadata.website && !/^https?:\/\/.+/.test(formData.metadata.website)) {
      newErrors['metadata.website'] = 'Düzgün website formatı daxil edin (http:// və ya https://)';
    }

    // Established date validation
    if (formData.established_date) {
      const establishedDate = new Date(formData.established_date);
      const today = new Date();
      if (establishedDate > today) {
        newErrors.established_date = 'Təsis tarixi bugünkü tarixdən sonra ola bilməz';
      }
    }

    // Type-level consistency check
    const typeLevel = getTypeLevelMapping();
    if (typeLevel[formData.type] && typeLevel[formData.type] !== formData.level) {
      newErrors.type = 'Təşkilat tipi və səviyyəsi uyğun deyil';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTypeLevelMapping = () => {
    return {
      ministry: 1,
      region: 2,
      sektor: 3,
      school: 4,
      vocational: 4,
      university: 4
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Form submission started');
    console.log('📝 Form data before submission:', formData);
    
    e.preventDefault();
    
    console.log('⏳ Validating form...');
    if (!validateForm()) {
      console.log('❌ Form validation failed. Errors:', errors);
      return;
    }
    console.log('✅ Form validation passed');

    console.log('🔄 Setting loading state and clearing errors...');
    setLoading(true);
    setErrors({});

    try {
      console.log('📡 Sending API request to /institutions');
      console.log('📦 Request payload:', JSON.stringify(formData, null, 2));
      
      const response = await api.post('/institutions', formData);
      
      console.log('✅ Institution created successfully!');
      console.log('📥 Response data:', response.data);
      console.log('🎉 Calling onSuccess callback...');
      
      onSuccess();
      
      console.log('🚪 Closing modal...');
      onClose();
      
    } catch (error: any) {
      console.error('❌ Institution creation error occurred:');
      console.error('🔍 Error object:', error);
      console.error('📡 Error response:', error.response);
      console.error('📊 Error status:', error.response?.status);
      console.error('📝 Error data:', error.response?.data);
      console.error('💬 Error message:', error.message);
      
      if (error.response?.data?.errors) {
        console.log('🔧 Setting field-specific errors:', error.response.data.errors);
        setErrors(error.response.data.errors);
      } else {
        const errorMessage = error.response?.data?.message || 'Təşkilat yaradılarkən xəta baş verdi';
        console.log('🔧 Setting general error:', errorMessage);
        setErrors({
          general: errorMessage
        });
      }
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  console.log('📋 About to render form modal');
  console.log('   - Current formData:', formData);
  console.log('   - Loading state:', loading);
  console.log('   - Errors:', errors);
  
  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        console.log('🖡️ Modal overlay clicked');
        console.log('   - Click target:', e.target);
        console.log('   - Current target:', e.currentTarget);
        if (e.target === e.currentTarget) {
          console.log('   - Closing modal (clicked outside)');
          onClose();
        }
      }}
    >
      <div 
        className="modal-content institution-create-modal"
        onClick={(e) => {
          console.log('📋 Modal content clicked');
          e.stopPropagation(); // Prevent closing modal
        }}
      >
        <div className="modal-header">
          <h2>Yeni Təşkilat Yaradın</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {errors.general && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            console.log('📋 Form onSubmit event triggered');
            console.log('   - Event target:', e.target);
            console.log('   - Event type:', e.type);
            handleSubmit(e);
          }} 
          className="institution-create-form"
        >
          {/* Basic Information */}
          <div className="form-section">
            <h3>🏢 Əsas Məlumatlar</h3>
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
                >
                  {institutionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && <span className="field-error">{errors.type}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="level">Ierarxiya Səviyyəsi *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={errors.level ? 'error' : ''}
                >
                  {levelOptions.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.level && <span className="field-error">{errors.level}</span>}
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
                  >
                    <option value="">Seçin...</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} ({parent.type})
                      </option>
                    ))}
                  </select>
                  {errors.parent_id && <span className="field-error">{errors.parent_id}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="institution_code">Təşkilat Kodu</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="institution_code"
                    name="institution_code"
                    value={formData.institution_code}
                    onChange={handleInputChange}
                    className={errors.institution_code ? 'error' : ''}
                    placeholder="AUTO-GENERATED"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="btn-generate"
                    title="Yeni kod yarat"
                  >
                    🔄
                  </button>
                </div>
                {errors.institution_code && <span className="field-error">{errors.institution_code}</span>}
                <small className="form-note">Boş buraxsanız avtomatik yaradılacaq. Yalnız böyük həriflər, rəqəmlər, _ və - istifadə edin</small>
              </div>

              <div className="form-group">
                <label htmlFor="region_code">Region Kodu</label>
                <input
                  id="region_code"
                  name="region_code"
                  type="text"
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
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.established_date && <span className="field-error">{errors.established_date}</span>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>📞 Əlaqə Məlumatları</h3>
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
                  className={errors['contact_info.email'] ? 'error' : ''}
                  placeholder="info@institution.edu.az"
                />
                {errors['contact_info.email'] && <span className="field-error">{errors['contact_info.email']}</span>}
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
            <h3>📋 Əlavə Məlumatlar</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="metadata.website">Veb sayt</label>
                <input
                  type="url"
                  id="metadata.website"
                  name="metadata.website"
                  value={formData.metadata.website || ''}
                  onChange={handleInputChange}
                  className={errors['metadata.website'] ? 'error' : ''}
                  placeholder="https://institution.edu.az"
                />
                {errors['metadata.website'] && <span className="field-error">{errors['metadata.website']}</span>}
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  Aktiv təşkilat
                </label>
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
            <button 
              type="button" 
              onClick={() => {
                console.log('🚪 Cancel button clicked - closing modal');
                onClose();
              }} 
              className="btn-secondary"
            >
              Ləğv et
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
              onClick={(e) => {
                console.log('🚀 Create button clicked!');
                console.log('   - Button type:', e.currentTarget.type);
                console.log('   - Form element:', e.currentTarget.form);
                console.log('   - Loading state:', loading);
                console.log('   - Disabled state:', e.currentTarget.disabled);
                console.log('   - preventDefault called:', false);
                
                // Manual form validation test
                console.log('🧪 Testing manual form submission...');
                if (e.currentTarget.form) {
                  console.log('   - Form found, testing submit event');
                  // Don't prevent default - let normal form submission work
                } else {
                  console.log('❌ Form not found!');
                }
              }}
            >
              {loading ? 'Yaradılır...' : 'Təşkilat yarat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionCreateForm;