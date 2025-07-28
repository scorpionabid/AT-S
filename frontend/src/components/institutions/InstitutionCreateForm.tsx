/**
 * Institution Create Form - Migrated to BaseForm
 * Köhnə 500+ sətirlik komponent → 120 sətir
 */

import React from 'react';
import BaseForm, { FormWrapper } from '../base/BaseForm';
import { StyleSystem, styles } from '../../utils/StyleSystem';

interface InstitutionCreateData {
  name: string;
  short_name: string;
  type: string;
  parent_id: number | null;
  level: number;
  region_code: string;
  institution_code: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  description?: string;
  website?: string;
  is_active: boolean;
  established_date: string;
}

interface InstitutionCreateFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InstitutionCreateForm: React.FC<InstitutionCreateFormProps> = ({ onClose, onSuccess }) => {
  // Static data configurations
  const institutionTypes = [
    { value: 'ministry', label: 'Nazirlik' },
    { value: 'region', label: 'Regional İdarə' },
    { value: 'sektor', label: 'Sektor' },
    { value: 'school', label: 'Məktəb' },
    { value: 'vocational', label: 'Peşə Məktəbi' },
    { value: 'university', label: 'Universitet' }
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

  const levelOptions = [
    { value: 1, label: 'Səviyyə 1 - Nazirlik' },
    { value: 2, label: 'Səviyyə 2 - Regional' },
    { value: 3, label: 'Səviyyə 3 - Sektor' },
    { value: 4, label: 'Səviyyə 4 - Məktəb' },
    { value: 5, label: 'Səviyyə 5 - Şöbə' }
  ];

  // Form configuration
  const institutionFormConfig = {
    fields: [
      // Basic Information
      {
        name: 'name',
        label: 'Təşkilat Adı',
        type: 'text' as const,
        required: true,
        placeholder: 'Təşkilatın tam adını daxil edin',
        validation: {
          minLength: 3,
          maxLength: 200
        },
        gridCols: 8,
        description: 'Təşkilatın rəsmi adı'
      },
      {
        name: 'short_name',
        label: 'Qısa Ad',
        type: 'text' as const,
        placeholder: 'Qısa ad (ixtiyari)',
        validation: {
          maxLength: 50
        },
        gridCols: 4,
        description: 'Təşkilatın qısaldılmış adı'
      },
      {
        name: 'type',
        label: 'Təşkilat Tipi',
        type: 'select' as const,
        required: true,
        options: institutionTypes,
        gridCols: 6
      },
      {
        name: 'level',
        label: 'Təşkilat Səviyyəsi',
        type: 'select' as const,
        required: true,
        options: levelOptions,
        gridCols: 6
      },
      {
        name: 'parent_id',
        label: 'Əsas Təşkilat',
        type: 'select' as const,
        options: [], // Will be populated dynamically based on level
        dependency: 'level',
        placeholder: 'Əsas təşkilat seçin',
        gridCols: 6
      },
      {
        name: 'region_code',
        label: 'Region Kodu',
        type: 'select' as const,
        required: true,
        options: regionCodes,
        gridCols: 6
      },
      
      // Contact Information
      {
        name: 'contact_phone',
        label: 'Telefon',
        type: 'tel' as const,
        placeholder: '+994 XX XXX XX XX',
        validation: {
          pattern: /^(\+994|0)?[0-9\s\-\(\)]{7,}$/
        },
        gridCols: 4
      },
      {
        name: 'contact_email',
        label: 'Email',
        type: 'email' as const,
        placeholder: 'info@example.com',
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        gridCols: 4
      },
      {
        name: 'website',
        label: 'Veb Sayt',
        type: 'url' as const,
        placeholder: 'https://example.com',
        gridCols: 4
      },
      {
        name: 'contact_address',
        label: 'Ünvan',
        type: 'textarea' as const,
        placeholder: 'Təşkilatın fiziki ünvanı',
        validation: {
          maxLength: 500
        },
        gridCols: 12
      },
      
      // Technical Details
      {
        name: 'institution_code',
        label: 'Təşkilat Kodu',
        type: 'text' as const,
        required: true,
        placeholder: 'Unikal təşkilat kodu',
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: /^[A-Z0-9_-]+$/
        },
        gridCols: 6,
        description: 'Sistemdə unikal olmalıdır (böyük hərf və rəqəm)'
      },
      {
        name: 'established_date',
        label: 'Təsis Tarixi',
        type: 'date' as const,
        gridCols: 6
      },
      {
        name: 'description',
        label: 'Təsvir',
        type: 'textarea' as const,
        placeholder: 'Təşkilat haqqında qısa məlumat',
        validation: {
          maxLength: 1000
        },
        gridCols: 12
      },
      
      // Location (Optional)
      {
        name: 'location_latitude',
        label: 'Enlik (Latitude)',
        type: 'number' as const,
        placeholder: 'XX.XXXXXX',
        validation: {
          min: -90,
          max: 90
        },
        gridCols: 6
      },
      {
        name: 'location_longitude',
        label: 'Uzunluq (Longitude)',
        type: 'number' as const,
        placeholder: 'XX.XXXXXX',
        validation: {
          min: -180,
          max: 180
        },
        gridCols: 6
      },
      
      // Status
      {
        name: 'is_active',
        label: 'Aktiv təşkilat',
        type: 'checkbox' as const,
        gridCols: 12,
        description: 'Təşkilat aktiv vəziyyətdə yaradılsın'
      }
    ],
    
    sections: [
      {
        title: 'Əsas Məlumatlar',
        description: 'Təşkilatın əsas identifikasiya məlumatları',
        fields: ['name', 'short_name', 'type', 'level', 'parent_id', 'region_code']
      },
      {
        title: 'Əlaqə Məlumatları',
        description: 'Təşkilatla əlaqə saxlamaq üçün məlumatlar',
        fields: ['contact_phone', 'contact_email', 'website', 'contact_address']
      },
      {
        title: 'Texniki Məlumatlar',
        description: 'Sistem və idarəetmə məlumatları',
        fields: ['institution_code', 'established_date', 'description']
      },
      {
        title: 'Məkan Məlumatları (İxtiyari)',
        description: 'Coğrafi koordinatlar',
        fields: ['location_latitude', 'location_longitude']
      },
      {
        title: 'Status',
        description: 'Təşkilatın cari vəziyyəti',
        fields: ['is_active']
      }
    ],
    
    initialData: {
      type: 'school',
      level: 4,
      is_active: true,
      region_code: 'BAK'
    },
    
    submitEndpoint: '/institutions',
    dependentDataEndpoints: {
      parent_id: '/institutions' // Will be filtered by level
    },
    validationMode: 'onBlur' as const
  };

  // Transform submit data
  const transformSubmitData = (data: InstitutionCreateData) => {
    // Structure the data according to API expectations
    return {
      name: data.name,
      short_name: data.short_name,
      type: data.type,
      parent_id: data.parent_id || null,
      level: Number(data.level),
      region_code: data.region_code,
      institution_code: data.institution_code,
      contact_info: {
        phone: data.contact_phone || null,
        email: data.contact_email || null,
        address: data.contact_address || null
      },
      location: {
        latitude: data.location_latitude || null,
        longitude: data.location_longitude || null,
        address: data.contact_address || null
      },
      metadata: {
        description: data.description || null,
        website: data.website || null
      },
      is_active: Boolean(data.is_active),
      established_date: data.established_date || null
    };
  };

  // Custom field renderer for code generation
  const renderCodeField = (field: any, value: any, onChange: any, error?: string) => {
    if (field.name !== 'institution_code') return null;

    const generateCode = () => {
      // Auto-generate code based on type and region
      const typePrefix = {
        ministry: 'MIN',
        region: 'REG',
        sektor: 'SEK',
        school: 'SCH',
        vocational: 'VOC',
        university: 'UNI'
      };
      
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const prefix = typePrefix[field.type as keyof typeof typePrefix] || 'GEN';
      const generated = `${prefix}_${randomNum}`;
      onChange(generated);
    };

    return (
      <div style={styles.mb('4')}>
        <label style={styles.text('sm', 'medium')}>
          {field.label} {field.required && <span style={{ color: StyleSystem.tokens.colors.danger[500] }}>*</span>}
        </label>
        
        <div style={styles.flex('row', 'center', '2')}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            style={{
              ...StyleSystem.input(!!error),
              flex: 1
            }}
          />
          
          <button
            type="button"
            onClick={generateCode}
            style={StyleSystem.button('secondary', 'sm')}
          >
            Avtomatik Yarat
          </button>
        </div>
        
        {field.description && (
          <p style={styles.text('xs', 'normal', StyleSystem.tokens.colors.gray[600])}>
            {field.description}
          </p>
        )}
        
        {error && (
          <p style={styles.text('sm', 'normal', StyleSystem.tokens.colors.danger[600])}>
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <FormWrapper<InstitutionCreateData>
      config={institutionFormConfig}
      title="Yeni Təşkilat Yaradın"
      subtitle="Sistemə yeni təhsil təşkilatı əlavə edin"
      variant="sectioned"
      layout="horizontal"
      size="md"
      isModal
      onCancel={onClose}
      transformSubmitData={transformSubmitData}
      onSuccess={(createdInstitution) => {
        console.log('Institution created successfully:', createdInstitution);
        onSuccess();
      }}
      onError={(error) => {
        console.error('Institution creation failed:', error);
      }}
      renderField={renderCodeField}
    />
  );
};

export default InstitutionCreateForm;