import React from 'react';
import BaseForm from '../common/BaseForm';
import useForm, { FormField } from '../../hooks/useForm';

interface RoleCreateData {
  name: string;
  display_name: string;
  description: string;
  level: number;
  is_active: boolean;
}

interface RoleCreateFormRefactoredProps {
  onClose: () => void;
  onSuccess: () => void;
}

const RoleCreateFormRefactored: React.FC<RoleCreateFormRefactoredProps> = ({ 
  onClose, 
  onSuccess 
}) => {
  
  // Simple form fields without sections
  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Rol Adı (Sistem)',
      type: 'text',
      required: true,
      placeholder: 'rol_adi',
      gridCols: 6,
      validation: {
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-z_]+$/,
        custom: (value: string) => {
          if (value && !/^[a-z_]+$/.test(value)) {
            return 'Yalnız kiçik hərflər və alt xətt istifadə edin';
          }
          return null;
        }
      },
      description: 'Sistem tərəfindən istifadə edilən ad'
    },
    {
      name: 'display_name',
      label: 'Görünən Ad',
      type: 'text',
      required: true,
      placeholder: 'İnsan oxuya bilən ad',
      gridCols: 6,
      validation: {
        minLength: 3,
        maxLength: 100
      },
      description: 'İstifadəçilərə göstərilən ad'
    },
    {
      name: 'description',
      label: 'Açıqlama',
      type: 'textarea',
      required: true,
      placeholder: 'Bu rolun məsuliyyətlərini və icazələrini təsvir edin',
      gridCols: 12,
      validation: {
        minLength: 10,
        maxLength: 500
      }
    },
    {
      name: 'level',
      label: 'İcazə Səviyyəsi',
      type: 'select',
      required: true,
      gridCols: 6,
      options: [
        { value: 1, label: 'Səviyyə 1 (Ən yüksək - Super Admin)' },
        { value: 2, label: 'Səviyyə 2 (Yüksək - Regional Admin)' },
        { value: 3, label: 'Səviyyə 3 (Orta - Sektor Admin)' },
        { value: 4, label: 'Səviyyə 4 (Aşağı - Məktəb Admin)' },
        { value: 5, label: 'Səviyyə 5 (Ən aşağı - İstifadəçi)' }
      ],
      description: 'Yüksək rəqəm = aşağı icazə səviyyəsi'
    },
    {
      name: 'is_active',
      label: 'Aktiv Rol',
      type: 'checkbox',
      gridCols: 6,
      description: 'Bu rol aktiv vəziyyətdədirmi?'
    }
  ];

  // Initialize form with useForm hook
  const form = useForm<RoleCreateData>({
    fields,
    initialData: {
      level: 5,
      is_active: true
    },
    submitEndpoint: '/roles',
    validationMode: 'onChange'
  }, {
    onSuccess: (data) => {
      console.log('✅ Role created successfully:', data);
      onSuccess();
    },
    onError: (error) => {
      console.error('❌ Role creation failed:', error);
    }
  });

  return (
    <BaseForm<RoleCreateData>
      fields={fields}
      form={form}
      title="Yeni Rol Yaradın"
      description="Sistemə yeni istifadəçi rolu əlavə edin"
      submitText="Rol Yarat"
      cancelText="Ləğv et"
      showCancelButton={true}
      columns={2}
      modalMode={true}
      onCancel={onClose}
    />
  );
};

export default RoleCreateFormRefactored;