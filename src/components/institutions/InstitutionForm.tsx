import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../../services/api';
import { Dialog } from '../common/Dialog';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../ui/Button';
import { FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const INSTITUTION_TYPES = [
  { value: 'ministry', label: 'Nazirlik' },
  { value: 'region', label: 'Regional İdarə' },
  { value: 'sektor', label: 'Sektor' },
  { value: 'school', label: 'Məktəb' },
  { value: 'vocational', label: 'Peşə Məktəbi' },
  { value: 'university', label: 'Universitet' }
];

const LEVEL_OPTIONS = [
  { value: 1, label: 'Səviyyə 1 - Nazirlik' },
  { value: 2, label: 'Səviyyə 2 - Regional' },
  { value: 3, label: 'Səviyyə 3 - Sektor' },
  { value: 4, label: 'Səviyyə 4 - Məktəb' },
  { value: 5, label: 'Səviyyə 5 - Şöbə' }
];

const schema = yup.object().shape({
  name: yup.string().required('Ad mütləqdir'),
  short_name: yup.string(),
  type: yup.string().required('Növ seçilməlidir'),
  level: yup.number().required('Səviyyə seçilməlidir'),
  institution_code: yup.string().required('Təşkilat kodu mütləqdir'),
  region_code: yup.string().when('level', {
    is: (level: number) => level >= 2,
    then: yup.string().required('Region kodu mütləqdir'),
  }),
  established_date: yup.string(),
  is_active: yup.boolean().default(true),
  parent_id: yup.number().nullable()
});

interface InstitutionFormProps {
  institution?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const InstitutionForm: React.FC<InstitutionFormProps> = ({ 
  institution, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const [parentLoading, setParentLoading] = useState(false);
  const isEdit = !!institution?.id;

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      short_name: '',
      type: '',
      level: 1,
      institution_code: '',
      region_code: '',
      established_date: '',
      is_active: true,
      parent_id: null as number | null
    }
  });

  const watchLevel = watch('level');
  const watchType = watch('type');

  useEffect(() => {
    if (institution) {
      reset({
        name: institution.name,
        short_name: institution.short_name || '',
        type: institution.type,
        level: institution.level,
        institution_code: institution.institution_code || '',
        region_code: institution.region_code || '',
        established_date: institution.established_date || '',
        is_active: institution.is_active,
        parent_id: institution.parent?.id || null
      });
    }
  }, [institution, reset]);

  useEffect(() => {
    const fetchParents = async () => {
      if (watchLevel > 1) {
        setParentLoading(true);
        try {
          const response = await api.get(`/institutions?level=${watchLevel - 1}`);
          setParents(response.data.institutions);
        } catch (error) {
          console.error('Error fetching parents:', error);
          toast.error('Ana təşkilatlar yüklənərkən xəta baş verdi');
        } finally {
          setParentLoading(false);
        }
      } else {
        setParents([]);
        setValue('parent_id', null);
      }
    };

    fetchParents();
  }, [watchLevel, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/institutions/${institution.id}`, data);
        toast.success('Təşkilat uğurla yeniləndi');
      } else {
        await api.post('/institutions', data);
        toast.success('Təşkilat uğurla yaradıldı');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving institution:', error);
      const errorMessage = error.response?.data?.message || 'Xəta baş verdi, zəhmət olmasa yenidən cəhd edin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={true} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEdit ? 'Təşkilatı redaktə et' : 'Yeni Təşkilat Əlavə Et'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Təşkilat məlumatlarını daxil edin
            </p>
          </div>
          <button
            type="button"
            className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Bağla</span>
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Təşkilatın adı"
                    placeholder="Məs: Bakı şəhəri Nizami rayonu 23 nömrəli tam orta məktəb"
                    error={errors.name?.message}
                    required
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="short_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Qısa ad"
                    placeholder="Məs: 23 nömrəli məktəb"
                    error={errors.short_name?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="institution_code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Təşkilat kodu"
                    placeholder="Məs: 123456"
                    error={errors.institution_code?.message}
                    required
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Təşkilat növü"
                    options={INSTITUTION_TYPES}
                    error={errors.type?.message}
                    required
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Səviyyə"
                    options={LEVEL_OPTIONS}
                    error={errors.level?.message}
                    required
                    onChange={(e) => {
                      field.onChange(parseInt(e.target.value, 10));
                    }}
                  />
                )}
              />
            </div>

            {watchLevel > 1 && (
              <div>
                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Ana Təşkilat"
                      options={[
                        { value: '', label: 'Seçin...' },
                        ...parents.map(parent => ({
                          value: parent.id,
                          label: parent.name
                        }))
                      ]}
                      error={errors.parent_id?.message}
                      isLoading={parentLoading}
                      required
                      value={field.value || ''}
                      onChange={(e) => {
                        field.onChange(e.target.value ? parseInt(e.target.value, 10) : null);
                      }}
                    />
                  )}
                />
              </div>
            )}

            {watchLevel >= 2 && (
              <div>
                <Controller
                  name="region_code"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Region kodu"
                      placeholder="Məs: 10"
                      error={errors.region_code?.message}
                      required={watchLevel >= 2}
                    />
                  )}
                />
              </div>
            )}

            <div>
              <Controller
                name="established_date"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    label="Təsis tarixi"
                    error={errors.established_date?.message}
                  />
                )}
              />
            </div>

            <div className="flex items-center pt-6">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Aktiv təşkilat
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              İmtina et
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              <FiSave className="mr-2 h-4 w-4" />
              {isEdit ? 'Yadda saxla' : 'Yarat'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default InstitutionForm;
