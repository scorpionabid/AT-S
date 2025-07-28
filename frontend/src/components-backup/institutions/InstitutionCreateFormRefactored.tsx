import React from 'react';
import BaseForm from '../base/BaseForm';
import useForm, { FormField, FormSection } from '../../hooks/useForm';

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

interface InstitutionCreateFormRefactoredProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InstitutionCreateFormRefactored: React.FC<InstitutionCreateFormRefactoredProps> = ({ 
  onClose, 
  onSuccess 
}) => {
  
  // Form fields configuration
  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Təşkilat Adı',
      type: 'text',
      required: true,
      placeholder: 'Təşkilat adını daxil edin',
      gridCols: 6,
      section: 'basic',
      validation: {
        minLength: 3,
        maxLength: 255
      }
    },
    {
      name: 'short_name',
      label: 'Qısa Ad',
      type: 'text',
      required: true,
      placeholder: 'Qısa adı daxil edin',
      gridCols: 6,
      section: 'basic',
      validation: {
        minLength: 2,
        maxLength: 50
      }
    },
    {
      name: 'type',
      label: 'Təşkilat Növü',
      type: 'select',
      required: true,
      gridCols: 6,
      section: 'basic',
      options: [
        { value: 'ministry', label: 'Nazirlik' },
        { value: 'region', label: 'Regional İdarə' },
        { value: 'sektor', label: 'Sektor' },
        { value: 'school', label: 'Məktəb' },
        { value: 'vocational', label: 'Peşə Məktəbi' },
        { value: 'university', label: 'Universitet' }
      ]
    },
    {
      name: 'level',
      label: 'Səviyyə',
      type: 'select',
      required: true,
      gridCols: 6,
      section: 'basic',
      options: [
        { value: 1, label: 'Səviyyə 1 - Nazirlik' },
        { value: 2, label: 'Səviyyə 2 - Regional İdarə' },
        { value: 3, label: 'Səviyyə 3 - Sektor' },
        { value: 4, label: 'Səviyyə 4 - Təhsil Müəssisəsi' },
        { value: 5, label: 'Səviyyə 5 - Alt Bölmə' }
      ]
    },
    {
      name: 'parent_id',
      label: 'Ana Təşkilat',
      type: 'select',
      gridCols: 6,
      section: 'hierarchy',
      placeholder: 'Ana təşkilat seçin (isteğe bağlı)'
    },
    {
      name: 'region_code',
      label: 'Region Kodu',
      type: 'select',
      required: true,
      gridCols: 6,
      section: 'hierarchy',
      options: [
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
      ]
    },
    {
      name: 'institution_code',
      label: 'Təşkilat Kodu',
      type: 'text',
      required: true,
      placeholder: 'Təşkilat kodunu daxil edin',
      gridCols: 12,
      section: 'hierarchy',
      validation: {
        pattern: /^[A-Z0-9_-]+$/,
        custom: (value: string) => {
          if (value && value.length < 3) {
            return 'Təşkilat kodu ən azı 3 simvol olmalıdır';
          }
          return null;
        }
      },
      description: 'Yalnız böyük hərflər, rəqəmlər və tire istifadə edin'
    },
    {
      name: 'established_date',
      label: 'Təsis Tarixi',
      type: 'date',
      required: true,
      gridCols: 6,
      section: 'details'
    },
    {
      name: 'is_active',
      label: 'Aktiv Status',
      type: 'checkbox',
      gridCols: 6,
      section: 'details',
      description: 'Təşkilat aktiv vəziyyətdədirmi?'
    },
    // Contact Information
    {
      name: 'contact_info.phone',
      label: 'Əlaqə Telefonu',
      type: 'tel',
      placeholder: '+994 XX XXX XX XX',
      gridCols: 6,
      section: 'contact',
      validation: {
        pattern: /^\+994\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/
      }
    },
    {
      name: 'contact_info.email',
      label: 'E-poçt Ünvanı',
      type: 'email',
      placeholder: 'info@example.az',
      gridCols: 6,
      section: 'contact'
    },
    {
      name: 'contact_info.address',
      label: 'Ünvan',
      type: 'textarea',
      placeholder: 'Tam ünvanı daxil edin',
      gridCols: 12,
      section: 'contact'
    },
    // Location
    {
      name: 'location.latitude',
      label: 'Enlik (Latitude)',
      type: 'number',
      placeholder: '40.4093',
      gridCols: 6,
      section: 'location',
      validation: {
        min: -90,
        max: 90
      }
    },
    {
      name: 'location.longitude',
      label: 'Uzunluq (Longitude)',
      type: 'number',
      placeholder: '49.8671',
      gridCols: 6,
      section: 'location',
      validation: {
        min: -180,
        max: 180
      }
    },
    {
      name: 'location.address',
      label: 'Lokasiya Ünvanı',
      type: 'textarea',
      placeholder: 'GPS ünvanını daxil edin',
      gridCols: 12,
      section: 'location'
    },
    // Metadata
    {
      name: 'metadata.description',
      label: 'Açıqlama',
      type: 'textarea',
      placeholder: 'Təşkilat haqqında ətraflı məlumat',
      gridCols: 12,
      section: 'metadata',
      validation: {
        maxLength: 1000
      }
    },
    {
      name: 'metadata.website',
      label: 'Rəsmi Veb Sayt',
      type: 'url',
      placeholder: 'https://example.az',
      gridCols: 12,
      section: 'metadata'
    }
  ];

  // Form sections configuration
  const sections: FormSection[] = [
    {
      title: 'Əsas Məlumatlar',
      description: 'Təşkilatın əsas məlumatları',
      fields: ['name', 'short_name', 'type', 'level']
    },
    {
      title: 'İyerarxiya və Kodlaşdırma',
      description: 'Təşkilat strukturu və kodlaşdırma məlumatları',
      fields: ['parent_id', 'region_code', 'institution_code']
    },
    {
      title: 'Təfərrüatlar',
      description: 'Əlavə məlumatlar və status',
      fields: ['established_date', 'is_active']
    },
    {
      title: 'Əlaqə Məlumatları',
      description: 'Telefon, e-poçt və ünvan məlumatları',
      fields: ['contact_info.phone', 'contact_info.email', 'contact_info.address']
    },
    {
      title: 'Lokasiya Məlumatları',
      description: 'GPS koordinatları və lokasiya ünvanı',
      fields: ['location.latitude', 'location.longitude', 'location.address']
    },
    {
      title: 'Əlavə Məlumatlar',
      description: 'Açıqlama və veb sayt məlumatları',
      fields: ['metadata.description', 'metadata.website']
    }
  ];

  // Initialize form with useForm hook
  const form = useForm<InstitutionCreateData>({
    fields,
    sections,
    initialData: {
      type: 'school',
      level: 4,
      is_active: true,
      contact_info: {},
      location: {},
      metadata: {}
    },
    submitEndpoint: '/institutions',
    dependentDataEndpoints: {
      parent_id: '/institutions/parents' // Load potential parent institutions
    },
    validationMode: 'onBlur'
  }, {
    onSuccess: (data) => {
      console.log('✅ Institution created successfully:', data);
      onSuccess();
    },
    onError: (error) => {
      console.error('❌ Institution creation failed:', error);
    },
    transformSubmitData: (data) => {
      // Transform nested objects for API
      return {
        ...data,
        contact_info: JSON.stringify(data.contact_info),
        location: JSON.stringify(data.location),
        metadata: JSON.stringify(data.metadata)
      };
    }
  });

  return (
    <BaseForm<InstitutionCreateData>
      fields={fields}
      sections={sections}
      form={form}
      title="Yeni Təşkilat Yaradın"
      description="Sistemə yeni təşkilat əlavə etmək üçün aşağıdakı formu doldurun"
      submitText="Təşkilat Yarat"
      cancelText="Ləğv et"
      showCancelButton={true}
      columns={2}
      modalMode={true}
      onCancel={onClose}
    />
  );
};

export default InstitutionCreateFormRefactored;