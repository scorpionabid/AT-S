/**
 * ATİS Base List Component
 * Universal list component bütün list patterns üçün
 */

import React, { ReactNode, useCallback } from 'react';
import { StyleSystem, styles } from '../../utils/StyleSystem';
import { HookFactory } from '../../hooks/HookFactory';
import { GenericCrudService } from '../../services/base/GenericCrudService';
import BaseModal from './BaseModal';

// Generic list item interface
export interface BaseListItem {
  id: number | string;
  [key: string]: any;
}

// Column configuration
export interface ListColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => ReactNode;
  className?: string;
}

// Action configuration
export interface ListAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  show?: (item: T) => boolean;
  disabled?: (item: T) => boolean;
  onClick: (item: T) => void;
}

// Bulk action configuration
export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  confirmMessage?: string;
  onClick: (items: T[]) => void;
}

// Filter configuration
export interface ListFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  defaultValue?: any;
}

// Base list props
export interface BaseListProps<T extends BaseListItem> {
  // Data
  service?: GenericCrudService<T>;
  data?: T[];
  loading?: boolean;
  error?: string | null;
  
  // Configuration
  columns: ListColumn<T>[];
  actions?: ListAction<T>[];
  bulkActions?: BulkAction<T>[];
  filters?: ListFilter[];
  
  // Features
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  
  // Styling
  variant?: 'default' | 'minimal' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  
  // Callbacks
  onItemClick?: (item: T) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  onDataChange?: () => void;
  
  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  
  // Custom rendering
  renderItem?: (item: T, index: number) => ReactNode;
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
}

export function BaseListComponent<T extends BaseListItem>({
  service,
  data: externalData,
  loading: externalLoading,
  error: externalError,
  columns,
  actions = [],
  bulkActions = [],
  filters = [],
  searchable = true,
  searchPlaceholder = 'Axtarış...',
  selectable = false,
  pagination = true,
  pageSize = 20,
  sortable = true,
  variant = 'default',
  size = 'md',
  onItemClick,
  onSelectionChange,
  onDataChange,
  emptyTitle = 'Heç bir məlumat tapılmadı',
  emptyDescription = 'Həmin kriterlərə uyğun məlumat mövcud deyil',
  emptyAction,
  renderItem,
  renderHeader,
  renderFooter
}: BaseListProps<T>) {
  
  // Use service data or external data
  const useListHook = service ? 
    HookFactory.createListHook(service, { 
      pageSize,
      onSuccess: onDataChange,
      onError: (op, error) => console.error(`List ${op} error:`, error)
    }) : null;
  
  const listState = useListHook?.() || {
    items: externalData || [],
    loading: externalLoading || false,
    error: externalError || null,
    selectedItems: [],
    filters: {},
    sortBy: 'id',
    sortOrder: 'desc' as const,
    pagination: null,
    operations: {} as any,
    fetchItems: () => {},
    toggleSelection: () => {},
    selectAll: () => {},
    clearSelection: () => {},
    updateFilters: () => {},
    updateSort: () => {},
    clearFilters: () => {},
    refresh: () => {}
  };

  // Search state
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = HookFactory.createDebounceHook(500);
  const debouncedSearchTerm = debouncedSearch(searchTerm);

  // Confirmation modal for bulk actions
  const confirmationModal = HookFactory.createToggleHook();
  const [pendingBulkAction, setPendingBulkAction] = React.useState<BulkAction<T> | null>(null);

  // Update filters when search changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      listState.updateFilters({ search: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm]);

  // Handle selection change
  React.useEffect(() => {
    onSelectionChange?.(listState.selectedItems);
  }, [listState.selectedItems, onSelectionChange]);

  // Handle bulk action
  const handleBulkAction = useCallback((action: BulkAction<T>) => {
    if (listState.selectedItems.length === 0) return;
    
    if (action.confirmMessage) {
      setPendingBulkAction(action);
      confirmationModal.setTrue();
    } else {
      action.onClick(listState.selectedItems);
    }
  }, [listState.selectedItems, confirmationModal]);

  // Confirm bulk action
  const confirmBulkAction = useCallback(async () => {
    if (pendingBulkAction) {
      await pendingBulkAction.onClick(listState.selectedItems);
      setPendingBulkAction(null);
      confirmationModal.setFalse();
      listState.clearSelection();
    }
  }, [pendingBulkAction, listState, confirmationModal]);

  // Render table header
  const renderTableHeader = () => (
    <thead style={styles.bg(StyleSystem.tokens.colors.gray[50])}>
      <tr>
        {selectable && (
          <th style={{ ...styles.p('3'), width: '40px' }}>
            <input
              type="checkbox"
              checked={listState.selectedItems.length === listState.items.length && listState.items.length > 0}
              onChange={(e) => e.target.checked ? listState.selectAll() : listState.clearSelection()}
              style={StyleSystem.focusRing()}
            />
          </th>
        )}
        {columns.map((column) => (
          <th 
            key={String(column.key)} 
            style={{
              ...styles.p('3'),
              ...styles.text('sm', 'semibold', StyleSystem.tokens.colors.gray[900]),
              ...(column.width && { width: column.width }),
              textAlign: column.align || 'left',
              cursor: sortable && column.sortable ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (sortable && column.sortable) {
                listState.updateSort(String(column.key));
              }
            }}
            className={column.className}
          >
            <div style={styles.flex('row', 'center', '2')}>
              {column.label}
              {sortable && column.sortable && listState.sortBy === column.key && (
                <span style={styles.text('xs')}>
                  {listState.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </th>
        ))}
        {actions.length > 0 && (
          <th style={{ ...styles.p('3'), width: '120px', textAlign: 'right' }}>
            Əməliyyatlar
          </th>
        )}
      </tr>
    </thead>
  );

  // Render table row
  const renderTableRow = (item: T, index: number) => (
    <tr 
      key={item.id}
      style={{
        ...StyleSystem.transition(),
        cursor: onItemClick ? 'pointer' : 'default'
      }}
      onClick={() => onItemClick?.(item)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = StyleSystem.tokens.colors.gray[50];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {selectable && (
        <td style={styles.p('3')}>
          <input
            type="checkbox"
            checked={listState.selectedItems.some(selected => selected.id === item.id)}
            onChange={(e) => {
              e.stopPropagation();
              listState.toggleSelection(item);
            }}
            style={StyleSystem.focusRing()}
          />
        </td>
      )}
      {columns.map((column) => {
        const value = column.key === 'index' ? index + 1 : item[column.key as keyof T];
        const cellContent = column.render ? column.render(value, item, index) : String(value || '—');
        
        return (
          <td 
            key={String(column.key)}
            style={{
              ...styles.p('3'),
              ...styles.text('sm'),
              textAlign: column.align || 'left'
            }}
            className={column.className}
          >
            {cellContent}
          </td>
        );
      })}
      {actions.length > 0 && (
        <td style={{ ...styles.p('3'), textAlign: 'right' }}>
          <div style={styles.flex('row', 'center', '2')}>
            {actions
              .filter(action => !action.show || action.show(item))
              .map((action) => (
                <button
                  key={action.key}
                  style={StyleSystem.button(action.variant || 'secondary', 'sm')}
                  disabled={action.disabled?.(item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  title={action.label}
                >
                  {action.icon || action.label}
                </button>
              ))}
          </div>
        </td>
      )}
    </tr>
  );

  // Render filters
  const renderFilters = () => {
    if (filters.length === 0 && !searchable) return null;

    return (
      <div style={{ ...styles.flex('row', 'center', '4'), ...styles.mb('4') }}>
        {searchable && (
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...StyleSystem.input(),
                ...styles.fullW()
              }}
            />
          </div>
        )}
        
        {filters.map((filter) => (
          <div key={filter.key} style={{ minWidth: '200px' }}>
            {filter.type === 'select' ? (
              <select
                onChange={(e) => listState.updateFilters({ [filter.key]: e.target.value })}
                style={StyleSystem.input()}
              >
                <option value="">{filter.placeholder || filter.label}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type}
                placeholder={filter.placeholder || filter.label}
                onChange={(e) => listState.updateFilters({ [filter.key]: e.target.value })}
                style={StyleSystem.input()}
              />
            )}
          </div>
        ))}
        
        {(filters.length > 0 || searchTerm) && (
          <button
            onClick={() => {
              setSearchTerm('');
              listState.clearFilters();
            }}
            style={StyleSystem.button('secondary', 'sm')}
          >
            Təmizlə
          </button>
        )}
      </div>
    );
  };

  // Render bulk actions
  const renderBulkActions = () => {
    if (bulkActions.length === 0 || listState.selectedItems.length === 0) return null;

    return (
      <div style={{ ...styles.flex('row', 'center', '4'), ...styles.mb('4'), ...styles.p('3'), ...styles.bg(StyleSystem.tokens.colors.blue[50]) }}>
        <span style={styles.text('sm', 'medium')}>
          {listState.selectedItems.length} element seçildi
        </span>
        
        <div style={styles.flex('row', 'center', '2')}>
          {bulkActions.map((action) => (
            <button
              key={action.key}
              style={StyleSystem.button(action.variant || 'secondary', 'sm')}
              onClick={() => handleBulkAction(action)}
            >
              {action.icon && <span style={styles.mr('2')}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
          
          <button
            onClick={listState.clearSelection}
            style={StyleSystem.button('ghost', 'sm')}
          >
            Seçimi ləğv et
          </button>
        </div>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination || !listState.pagination) return null;

    const { currentPage, lastPage, total } = listState.pagination;
    
    return (
      <div style={{ ...styles.flex('row', 'center', 'between'), ...styles.mt('4') }}>
        <span style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>
          Cəmi {total} nəticə
        </span>
        
        <div style={styles.flex('row', 'center', '2')}>
          <button
            disabled={currentPage === 1}
            onClick={() => listState.fetchItems(currentPage - 1)}
            style={StyleSystem.button('secondary', 'sm')}
          >
            Əvvəlki
          </button>
          
          <span style={styles.text('sm')}>
            {currentPage} / {lastPage}
          </span>
          
          <button
            disabled={currentPage === lastPage}
            onClick={() => listState.fetchItems(currentPage + 1)}
            style={StyleSystem.button('secondary', 'sm')}
          >
            Növbəti
          </button>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div style={{ ...styles.center(), ...styles.py('8') }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ ...styles.text('lg', 'semibold', StyleSystem.tokens.colors.gray[900]), ...styles.mb('2') }}>
          {emptyTitle}
        </div>
        <div style={{ ...styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600]), ...styles.mb('4') }}>
          {emptyDescription}
        </div>
        {emptyAction}
      </div>
    </div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <div style={{ ...styles.center(), ...styles.py('8') }}>
      <div style={styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600])}>
        Yüklənir...
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div style={{ ...styles.center(), ...styles.py('8') }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ ...styles.text('lg', 'semibold', StyleSystem.tokens.colors.danger[600]), ...styles.mb('2') }}>
          Xəta baş verdi
        </div>
        <div style={{ ...styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600]), ...styles.mb('4') }}>
          {listState.error}
        </div>
        <button
          onClick={listState.refresh}
          style={StyleSystem.button('primary', 'sm')}
        >
          Yenidən cəhd et
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div style={StyleSystem.card()}>
      {renderHeader?.()}
      
      {renderFilters()}
      {renderBulkActions()}
      
      <div style={{ overflow: 'auto' }}>
        {listState.loading ? (
          renderLoadingState()
        ) : listState.error ? (
          renderErrorState()
        ) : listState.items.length === 0 ? (
          renderEmptyState()
        ) : renderItem ? (
          <div style={styles.grid()}>
            {listState.items.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <table style={{ ...styles.fullW(), borderCollapse: 'collapse' }}>
            {renderTableHeader()}
            <tbody>
              {listState.items.map((item, index) => renderTableRow(item, index))}
            </tbody>
          </table>
        )}
      </div>
      
      {renderPagination()}
      {renderFooter?.()}
      
      {/* Bulk action confirmation modal */}
      <BaseModal
        isOpen={confirmationModal.value}
        onClose={confirmationModal.setFalse}
        title="Əməliyyatı təsdiqlə"
        size="sm"
        variant="warning"
        primaryAction={{
          label: 'Təsdiqlə',
          onClick: confirmBulkAction,
          variant: 'danger'
        }}
        secondaryAction={{
          label: 'Ləğv et',
          onClick: confirmationModal.setFalse
        }}
      >
        <p style={styles.text('base')}>
          {pendingBulkAction?.confirmMessage || 
           `${listState.selectedItems.length} elementi üzərində bu əməliyyatı həyata keçirmək istədiyinizə əminsiniz?`}
        </p>
      </BaseModal>
    </div>
  );
}

export default BaseListComponent;