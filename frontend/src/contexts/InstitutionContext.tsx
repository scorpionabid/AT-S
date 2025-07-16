import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Institution } from '../services/institutionService';
import { institutionService } from '../services/institutionService';
import { useToast } from '../hooks/useToast';

interface InstitutionContextType {
  institutions: Institution[];
  loading: boolean;
  error: Error | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
  filters: {
    search: string;
    type: string;
    level: number | '';
    isActive: boolean | null;
  };
  fetchInstitutions: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: string;
    level?: number | '';
    is_active?: boolean | null;
  }) => Promise<void>;
  createInstitution: (data: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) => Promise<Institution | null>;
  updateInstitution: (id: number, data: Partial<Institution>) => Promise<Institution | null>;
  deleteInstitution: (id: number) => Promise<boolean>;
  toggleInstitutionStatus: (id: number, isActive: boolean) => Promise<boolean>;
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    type: string;
    level: number | '';
    isActive: boolean | null;
  }>>;
  resetFilters: () => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 15,
  });
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    level: '' as number | '',
    isActive: null as boolean | null,
  });
  
  const { showSuccess, showError } = useToast();

  const fetchInstitutions = useCallback(async (params: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: string;
    level?: number | '';
    is_active?: boolean | null;
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const { level: levelFilter, isActive, ...restFilters } = filters;
      const { level: paramsLevel, ...restParams } = params;
      
      const response = await institutionService.getInstitutions({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...restFilters,
        ...restParams,
        level: levelFilter !== '' ? levelFilter : undefined,
        is_active: isActive !== null ? isActive : undefined,
      });
      
      // Ensure we have valid institution data
      const validInstitutions = (response.data || []).filter(institution => 
        institution && 
        typeof institution === 'object' && 
        institution.id !== undefined && 
        institution.id !== null
      );
      setInstitutions(validInstitutions);
      setPagination(prev => ({
        ...prev,
        currentPage: response.meta.current_page,
        totalPages: response.meta.last_page,
        totalItems: response.meta.total,
        perPage: response.meta.per_page,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch institutions';
      const error = new Error(errorMessage);
      setError(error);
      showError('Təşkilatlar yüklənərkən xəta baş verdi: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.perPage, showError]);

  const createInstitution = useCallback(async (data: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const newInstitution = await institutionService.createInstitution(data);
      await fetchInstitutions();
      showSuccess('Təşkilat uğurla yaradıldı');
      return newInstitution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Təşkilat yaradılarkən xəta baş verdi';
      showError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchInstitutions, showError, showSuccess]);

  const updateInstitution = useCallback(async (id: number, data: Partial<Institution>) => {
    try {
      setLoading(true);
      const updatedInstitution = await institutionService.updateInstitution(id, data);
      await fetchInstitutions();
      showSuccess('Təşkilat məlumatları uğurla yeniləndi');
      return updatedInstitution;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Təşkilat yenilənərkən xəta baş verdi';
      showError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchInstitutions, showError, showSuccess]);

  const deleteInstitution = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await institutionService.deleteInstitution(id);
      await fetchInstitutions();
      showSuccess('Təşkilat uğurla silindi');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Təşkilat silinərkən xəta baş verdi';
      showError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchInstitutions, showError, showSuccess]);

  const toggleInstitutionStatus = useCallback(async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      await institutionService.toggleStatus(id, isActive);
      await fetchInstitutions();
      showSuccess(`Təşkilat uğurla ${isActive ? 'aktivləşdirildi' : 'deaktivləşdirildi'}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Status dəyişdirilərkən xəta baş verdi';
      showError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchInstitutions, showError, showSuccess]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      level: '',
      isActive: null,
    });
  }, []);

  return (
    <InstitutionContext.Provider
      value={{
        institutions,
        loading,
        error,
        pagination,
        filters,
        fetchInstitutions,
        createInstitution,
        updateInstitution,
        deleteInstitution,
        toggleInstitutionStatus,
        setFilters,
        resetFilters,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
};

export default InstitutionContext;
