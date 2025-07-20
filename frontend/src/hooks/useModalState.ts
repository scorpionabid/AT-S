// ====================
// ATİS Modal State Hook
// Eliminates modal management duplication
// ====================

import { useState, useCallback } from 'react';

export interface UseModalStateOptions {
  initialOpen?: boolean;
  onOpen?: (item?: any) => void;
  onClose?: () => void;
}

export interface UseModalStateReturn<T = any> {
  isOpen: boolean;
  selectedItem: T | null;
  
  // Actions
  openModal: (item?: T) => void;
  closeModal: () => void;
  toggleModal: () => void;
  setSelectedItem: (item: T | null) => void;
  
  // Convenience methods for common modal patterns
  openCreateModal: () => void;
  openEditModal: (item: T) => void;
  openViewModal: (item: T) => void;
  openDeleteModal: (item: T) => void;
}

export function useModalState<T = any>({
  initialOpen = false,
  onOpen,
  onClose
}: UseModalStateOptions = {}): UseModalStateReturn<T> {
  
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedItem, setSelectedItemState] = useState<T | null>(null);

  // Open modal with optional item
  const openModal = useCallback((item?: T) => {
    if (item !== undefined) {
      setSelectedItemState(item);
    }
    setIsOpen(true);
    onOpen?.(item);
  }, [onOpen]);

  // Close modal and clear selected item
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItemState(null);
    onClose?.();
  }, [onClose]);

  // Toggle modal state
  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Set selected item without opening modal
  const setSelectedItem = useCallback((item: T | null) => {
    setSelectedItemState(item);
  }, []);

  // Convenience methods for common modal patterns
  const openCreateModal = useCallback(() => {
    openModal(); // No item for create
  }, [openModal]);

  const openEditModal = useCallback((item: T) => {
    openModal(item);
  }, [openModal]);

  const openViewModal = useCallback((item: T) => {
    openModal(item);
  }, [openModal]);

  const openDeleteModal = useCallback((item: T) => {
    openModal(item);
  }, [openModal]);

  return {
    isOpen,
    selectedItem,
    
    // Basic actions
    openModal,
    closeModal,
    toggleModal,
    setSelectedItem,
    
    // Convenience methods
    openCreateModal,
    openEditModal,
    openViewModal,
    openDeleteModal
  };
}

// Hook for managing multiple modals
export interface UseMultiModalStateReturn {
  modals: Record<string, boolean>;
  selectedItems: Record<string, any>;
  
  openModal: (modalName: string, item?: any) => void;
  closeModal: (modalName: string) => void;
  toggleModal: (modalName: string) => void;
  isModalOpen: (modalName: string) => boolean;
  getSelectedItem: <T = any>(modalName: string) => T | null;
  closeAllModals: () => void;
}

export function useMultiModalState(modalNames: string[] = []): UseMultiModalStateReturn {
  const [modals, setModals] = useState<Record<string, boolean>>(
    modalNames.reduce((acc, name) => ({ ...acc, [name]: false }), {})
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, any>>({});

  const openModal = useCallback((modalName: string, item?: any) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (item !== undefined) {
      setSelectedItems(prev => ({ ...prev, [modalName]: item }));
    }
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedItems(prev => {
      const newItems = { ...prev };
      delete newItems[modalName];
      return newItems;
    });
  }, []);

  const toggleModal = useCallback((modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  const isModalOpen = useCallback((modalName: string) => {
    return !!modals[modalName];
  }, [modals]);

  const getSelectedItem = useCallback(<T = any>(modalName: string): T | null => {
    return selectedItems[modalName] || null;
  }, [selectedItems]);

  const closeAllModals = useCallback(() => {
    setModals(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
    setSelectedItems({});
  }, []);

  return {
    modals,
    selectedItems,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    getSelectedItem,
    closeAllModals
  };
}

export default useModalState;