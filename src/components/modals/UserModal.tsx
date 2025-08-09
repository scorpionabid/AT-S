import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormBuilder, createField, commonValidations } from '@/components/forms/FormBuilder';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  region?: string;
  institution?: string;
  status: 'active' | 'inactive';
  phone?: string;
  createdAt?: string;
}

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (user: Partial<User>) => Promise<void>;
}

const roleOptions = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Region Admin', value: 'region_admin' },
  { label: 'Institution Admin', value: 'institution_admin' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Observer', value: 'observer' },
];

const regionOptions = [
  { label: 'Bakı', value: 'baki' },
  { label: 'Şəki-Zaqatala', value: 'seki-zaqatala' },
  { label: 'Quba-Xaçmaz', value: 'quba-xacmaz' },
  { label: 'Aran', value: 'aran' },
  { label: 'Gəncə-Qazax', value: 'gence-qazax' },
  { label: 'Şirvan-Salyan', value: 'sirvan-salyan' },
  { label: 'Lənkəran-Astara', value: 'lenkaran-astara' },
  { label: 'Qərbi Azərbaycan', value: 'qerbi-azerbaycan' },
];

const statusOptions = [
  { label: 'Aktiv', value: 'active' },
  { label: 'Deaktiv', value: 'inactive' },
];

export function UserModal({ open, onClose, user, onSave }: UserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const fields = [
    createField('name', 'Ad və Soyad', 'text', {
      required: true,
      placeholder: 'İstifadəçinin tam adı',
      validation: commonValidations.required,
    }),
    createField('email', 'Email', 'email', {
      required: true,
      placeholder: 'ornek@edu.gov.az',
      validation: commonValidations.email,
    }),
    createField('phone', 'Telefon', 'text', {
      placeholder: '+994 XX XXX XX XX',
      validation: commonValidations.phone.optional(),
    }),
    createField('role', 'Rol', 'select', {
      required: true,
      options: roleOptions,
      placeholder: 'Rol seçin',
      validation: commonValidations.required,
    }),
    createField('region', 'Region', 'select', {
      options: regionOptions,
      placeholder: 'Region seçin (əgər tələb olunursa)',
    }),
    createField('institution', 'Təşkilat', 'text', {
      placeholder: 'Təşkilat adı (əgər tələb olunursa)',
    }),
    createField('status', 'Status', 'select', {
      required: true,
      options: statusOptions,
      defaultValue: 'active',
      validation: commonValidations.required,
    }),
  ];

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSave(data);
      toast({
        title: 'Uğurlu',
        description: user 
          ? 'İstifadəçi məlumatları yeniləndi' 
          : 'Yeni istifadəçi əlavə edildi',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Əməliyyat zamanı xəta baş verdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'İstifadəçi məlumatlarını redaktə et' : 'Yeni istifadəçi əlavə et'}
          </DialogTitle>
        </DialogHeader>
        
        <FormBuilder
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel={user ? 'Yenilə' : 'Əlavə et'}
          loading={loading}
          defaultValues={user || {}}
          columns={2}
        />
      </DialogContent>
    </Dialog>
  );
}