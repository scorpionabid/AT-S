import React from 'react';
import BaseForm from '../base/BaseForm';
import useForm, { FormField, FormSection } from '../../hooks/useForm';

interface UserCreateData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
  institution_id: string;
  department_id: string;
  first_name: string;
  last_name: string;
  patronymic: string;
  birth_date: string;
  gender: string;
  contact_phone: string;
  is_active: boolean;
}

interface UserCreateFormRefactoredProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UserCreateFormRefactored: React.FC<UserCreateFormRefactoredProps> = ({ 
  onClose, 
  onSuccess 
}) => {
  
  // Form fields configuration
  const fields: FormField[] = [
    // Account Information
    {
      name: 'username',
      label: 'İstifadəçi Adı',
      type: 'text',
      required: true,
      placeholder: 'İstifadəçi adını daxil edin',
      gridCols: 6,
      section: 'account',
      validation: {
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_]+$/,
        custom: (value: string) => {
          if (value && value.length < 3) {
            return 'İstifadəçi adı ən azı 3 simvol olmalıdır';
          }
          return null;
        }
      },
      description: 'Yalnız hərflər, rəqəmlər və alt xətt istifadə edin'
    },
    {
      name: 'email',
      label: 'E-poçt Ünvanı',
      type: 'email',
      required: true,
      placeholder: 'user@example.com',
      gridCols: 6,
      section: 'account',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      }
    },
    {
      name: 'password',
      label: 'Şifrə',
      type: 'password',
      required: true,
      placeholder: 'Güclü şifrə daxil edin',
      gridCols: 6,
      section: 'account',
      validation: {
        minLength: 8,
        custom: (value: string) => {
          if (!value) return null;
          if (value.length < 8) {
            return 'Şifrə ən azı 8 simvol olmalıdır';
          }
          if (!/(?=.*[a-z])/.test(value)) {
            return 'Şifrədə ən azı bir kiçik hərf olmalıdır';
          }
          if (!/(?=.*[A-Z])/.test(value)) {
            return 'Şifrədə ən azı bir böyük hərf olmalıdır';
          }
          if (!/(?=.*\d)/.test(value)) {
            return 'Şifrədə ən azı bir rəqəm olmalıdır';
          }
          return null;
        }
      },
      description: 'Ən azı 8 simvol, böyük və kiçik hərf, rəqəm'
    },
    {
      name: 'password_confirmation',
      label: 'Şifrə Təkrarı',
      type: 'password',
      required: true,
      placeholder: 'Şifrəni təkrar daxil edin',
      gridCols: 6,
      section: 'account',
      validation: {
        custom: (value: string, formData: any) => {
          if (value !== formData.password) {
            return 'Şifrələr uyğun gəlmir';
          }
          return null;
        }
      }
    },

    // Role and Institution
    {
      name: 'role_id',
      label: 'İstifadəçi Rolu',
      type: 'select',
      required: true,
      gridCols: 6,
      section: 'role',
      placeholder: 'Rol seçin'
    },
    {
      name: 'institution_id',
      label: 'Təşkilat',
      type: 'select',
      required: true,
      gridCols: 6,
      section: 'role',
      placeholder: 'Təşkilat seçin'
    },
    {
      name: 'department_id',
      label: 'Bölmə',
      type: 'select',
      gridCols: 12,
      section: 'role',
      dependency: 'institution_id',
      placeholder: 'Əvvəl təşkilat seçin'
    },

    // Personal Information
    {
      name: 'first_name',
      label: 'Ad',
      type: 'text',
      required: true,
      placeholder: 'Adını daxil edin',
      gridCols: 4,
      section: 'personal',
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZəöüçıığşÇĞIİÖŞÜ\s]+$/
      }
    },
    {
      name: 'last_name',
      label: 'Soyad',
      type: 'text',
      required: true,
      placeholder: 'Soyadını daxil edin',
      gridCols: 4,
      section: 'personal',
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZəöüçıığşÇĞIİÖŞÜ\s]+$/
      }
    },
    {
      name: 'patronymic',
      label: 'Ata Adı',
      type: 'text',
      placeholder: 'Ata adını daxil edin',
      gridCols: 4,
      section: 'personal',
      validation: {
        maxLength: 50,
        pattern: /^[a-zA-ZəöüçıığşÇĞIİÖŞÜ\s]*$/
      }
    },
    {
      name: 'birth_date',
      label: 'Doğum Tarixi',
      type: 'date',
      gridCols: 6,
      section: 'personal',
      validation: {
        custom: (value: string) => {
          if (!value) return null;
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            return 'İstifadəçi ən azı 18 yaşında olmalıdır';
          }
          if (age > 100) {
            return 'Düzgün doğum tarixi daxil edin';
          }
          return null;
        }
      }
    },
    {
      name: 'gender',
      label: 'Cins',
      type: 'select',
      gridCols: 6,
      section: 'personal',
      options: [
        { value: 'male', label: 'Kişi' },
        { value: 'female', label: 'Qadın' },
        { value: 'other', label: 'Digər' }
      ]
    },

    // Contact Information
    {
      name: 'contact_phone',
      label: 'Əlaqə Telefonu',
      type: 'tel',
      placeholder: '+994 XX XXX XX XX',
      gridCols: 6,
      section: 'contact',
      validation: {
        pattern: /^\+994\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/
      },
      description: 'Format: +994 XX XXX XX XX'
    },
    {
      name: 'is_active',
      label: 'Aktiv Status',
      type: 'checkbox',
      gridCols: 6,
      section: 'contact',
      description: 'İstifadəçi hesabı aktiv vəziyyətdədirmi?'
    }
  ];

  // Form sections configuration
  const sections: FormSection[] = [
    {
      title: 'Hesab Məlumatları',
      description: 'Giriş üçün istifadə ediləcək məlumatlar',
      fields: ['username', 'email', 'password', 'password_confirmation']
    },
    {
      title: 'Rol və Təşkilat',
      description: 'İstifadəçinin rolu və aid olduğu təşkilat',
      fields: ['role_id', 'institution_id', 'department_id']
    },
    {
      title: 'Şəxsi Məlumatlar',
      description: 'İstifadəçinin şəxsi məlumatları',
      fields: ['first_name', 'last_name', 'patronymic', 'birth_date', 'gender']
    },
    {
      title: 'Əlaqə Məlumatları',
      description: 'Əlaqə və status məlumatları',
      fields: ['contact_phone', 'is_active']
    }
  ];

  // Initialize form with useForm hook
  const form = useForm<UserCreateData>({
    fields,
    sections,
    initialData: {
      is_active: true,
      gender: '',
      role_id: '',
      institution_id: '',
      department_id: ''
    },
    submitEndpoint: '/users',
    dependentDataEndpoints: {
      role_id: '/roles',
      institution_id: '/institutions',
      department_id: '/departments' // Will be filtered by institution_id
    },
    validationMode: 'onBlur'
  }, {
    onSuccess: (data) => {
      console.log('✅ User created successfully:', data);
      onSuccess();
    },
    onError: (error) => {
      console.error('❌ User creation failed:', error);
    },
    onFieldChange: (name, value) => {
      // Clear department when institution changes
      if (name === 'institution_id') {
        form.setValue('department_id', '');
      }
    }
  });

  return (
    <BaseForm<UserCreateData>
      fields={fields}
      sections={sections}
      form={form}
      title="Yeni İstifadəçi Yaradın"
      description="Sistemə yeni istifadəçi əlavə etmək üçün aşağıdakı formu doldurun"
      submitText="İstifadəçi Yarat"
      cancelText="Ləğv et"
      showCancelButton={true}
      columns={2}
      modalMode={true}
      onCancel={onClose}
    />
  );
};

export default UserCreateFormRefactored;