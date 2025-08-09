import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CRUDState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  selectedItem: T | null;
  isModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  itemToDelete: T | null;
}

export interface CRUDActions<T> {
  setData: (data: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openModal: (item?: T) => void;
  closeModal: () => void;
  openDeleteDialog: (item: T) => void;
  closeDeleteDialog: () => void;
  handleCreate: (item: Omit<T, 'id'>) => Promise<void>;
  handleUpdate: (id: string, item: Partial<T>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleBulkDelete: (ids: string[]) => Promise<void>;
}

export interface CRUDConfig<T> {
  create?: (item: Omit<T, 'id'>) => Promise<T>;
  update?: (id: string, item: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<void>;
  bulkDelete?: (ids: string[]) => Promise<void>;
  onSuccess?: (action: 'create' | 'update' | 'delete', item?: T) => void;
  onError?: (action: 'create' | 'update' | 'delete', error: Error) => void;
}

export function useCRUD<T extends { id: string }>(
  initialData: T[] = [],
  config: CRUDConfig<T> = {}
) {
  const { toast } = useToast();
  
  const [state, setState] = useState<CRUDState<T>>({
    data: initialData,
    loading: false,
    error: null,
    selectedItem: null,
    isModalOpen: false,
    isDeleteDialogOpen: false,
    itemToDelete: null,
  });

  const setData = useCallback((data: T[]) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const openModal = useCallback((item?: T) => {
    setState(prev => ({
      ...prev,
      selectedItem: item || null,
      isModalOpen: true,
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItem: null,
      isModalOpen: false,
    }));
  }, []);

  const openDeleteDialog = useCallback((item: T) => {
    setState(prev => ({
      ...prev,
      itemToDelete: item,
      isDeleteDialogOpen: true,
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      itemToDelete: null,
      isDeleteDialogOpen: false,
    }));
  }, []);

  const handleCreate = useCallback(async (item: Omit<T, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      if (config.create) {
        const newItem = await config.create(item);
        setData([...state.data, newItem]);
        config.onSuccess?.('create', newItem);
        
        toast({
          title: 'Uğurlu',
          description: 'Yeni məlumat əlavə edildi',
        });
      } else {
        // Fallback: optimistic update with generated ID
        const newItem = { ...item, id: Date.now().toString() } as T;
        setData([...state.data, newItem]);
        
        toast({
          title: 'Uğurlu',
          description: 'Yeni məlumat əlavə edildi',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xəta baş verdi';
      setError(errorMessage);
      config.onError?.('create', error as Error);
      
      toast({
        title: 'Xəta',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.data, config, toast, setData, setLoading, setError]);

  const handleUpdate = useCallback(async (id: string, updates: Partial<T>) => {
    setLoading(true);
    setError(null);

    try {
      if (config.update) {
        const updatedItem = await config.update(id, updates);
        setData(state.data.map(item => item.id === id ? updatedItem : item));
        config.onSuccess?.('update', updatedItem);
      } else {
        // Fallback: optimistic update
        setData(state.data.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ));
      }
      
      toast({
        title: 'Uğurlu',
        description: 'Məlumatlar yeniləndi',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xəta baş verdi';
      setError(errorMessage);
      config.onError?.('update', error as Error);
      
      toast({
        title: 'Xəta',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.data, config, toast, setData, setLoading, setError]);

  const handleDelete = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      if (config.delete) {
        await config.delete(id);
      }
      
      setData(state.data.filter(item => item.id !== id));
      config.onSuccess?.('delete');
      
      toast({
        title: 'Uğurlu',
        description: 'Məlumat silindi',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xəta baş verdi';
      setError(errorMessage);
      config.onError?.('delete', error as Error);
      
      toast({
        title: 'Xəta',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.data, config, toast, setData, setLoading, setError]);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);

    try {
      if (config.bulkDelete) {
        await config.bulkDelete(ids);
      }
      
      setData(state.data.filter(item => !ids.includes(item.id)));
      
      toast({
        title: 'Uğurlu',
        description: `${ids.length} məlumat silindi`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xəta baş verdi';
      setError(errorMessage);
      
      toast({
        title: 'Xəta',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.data, config, toast, setData, setLoading, setError]);

  return {
    ...state,
    actions: {
      setData,
      setLoading,
      setError,
      openModal,
      closeModal,
      openDeleteDialog,
      closeDeleteDialog,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleBulkDelete,
    },
  };
}