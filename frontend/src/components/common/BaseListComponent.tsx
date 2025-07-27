import React, { ReactNode, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Base interfaces for all list components
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface BaseListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ActionConfig<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  condition?: (item: T, user: any) => boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface ColumnConfig<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface BaseListProps<T extends BaseEntity> {
  // Data & API
  data: T[];
  loading: boolean;
  error: string | null;
  meta: PaginationMeta;
  onRefetch: () => void;
  
  // Configuration
  title: string;
  columns: ColumnConfig<T>[];
  actions?: ActionConfig<T>[];
  filters?: FilterConfig[];
  
  // Permissions
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  
  // Events
  onCreateClick?: () => void;
  onSearchChange?: (term: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  
  // UI Customization
  viewModes?: Array<{ key: string; label: string; icon?: ReactNode }>;
  currentViewMode?: string;
  onViewModeChange?: (mode: string) => void;
  bulkActions?: boolean;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  
  // Children
  createFormComponent?: ReactNode;
  editFormComponent?: ReactNode;
  detailsComponent?: ReactNode;
}

const BaseListComponent = <T extends BaseEntity>({
  data,
  loading,
  error,
  meta,
  onRefetch,
  title,
  columns,
  actions = [],
  filters = [],
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = false,
  onCreateClick,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onSortChange,
  viewModes = [],
  currentViewMode = 'table',
  onViewModeChange,
  bulkActions = false,
  searchPlaceholder = 'Axtarış...',
  emptyStateMessage = 'Heç bir məlumat tapılmadı',
  createFormComponent,
  editFormComponent,
  detailsComponent
}: BaseListProps<T>) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Search handler with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  // Filter handler
  const handleFilterChange = useCallback((key: string, value: string) => {
    onFilterChange?.(key, value);
  }, [onFilterChange]);

  // Sort handler
  const handleSort = useCallback((field: string) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSortChange?.(field, newOrder);
  }, [sortField, sortOrder, onSortChange]);

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(item => item.id));
    }
  }, [selectedItems.length, data]);

  const handleSelectItem = useCallback((id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  // Error state
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          color: '#dc2626'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>⚠️ Xəta baş verdi</h3>
          <p style={{ margin: '0 0 12px 0' }}>{error}</p>
          <button
            onClick={onRefetch}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Toplam {meta.total} nəticə
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* View Mode Switcher */}
          {viewModes.length > 0 && (
            <div style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '4px'
            }}>
              {viewModes.map(mode => (
                <button
                  key={mode.key}
                  onClick={() => onViewModeChange?.(mode.key)}
                  style={{
                    background: currentViewMode === mode.key ? 'white' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: currentViewMode === mode.key ? '#1f2937' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          {/* Create Button */}
          {canCreate && onCreateClick && (
            <button
              onClick={onCreateClick}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>+</span>
              Yeni
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            flex: '1',
            minWidth: '300px',
            padding: '10px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />

        {/* Dynamic Filters */}
        {filters.map(filter => (
          <div key={filter.key} style={{ minWidth: '180px' }}>
            {filter.type === 'select' ? (
              <select
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">{filter.label}</option>
                {filter.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type}
                placeholder={filter.placeholder || filter.label}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {bulkActions && selectedItems.length > 0 && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px', color: '#1e40af' }}>
            {selectedItems.length} element seçildi
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedItems([])}
              style={{
                background: 'transparent',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1e40af'
              }}
            >
              Seçimi ləğv et
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '8px'
          }} />
          Yüklənir...
        </div>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '0 0 8px 0',
            color: '#374151'
          }}>
            {emptyStateMessage}
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Axtarış kriteriyalarınızı dəyişib yenidən cəhd edin
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                {bulkActions && (
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#374151',
                    width: '48px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={column.key}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#374151',
                      cursor: column.sortable ? 'pointer' : 'default',
                      width: column.width
                    }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {column.label}
                      {column.sortable && (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {sortField === column.key ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#374151',
                    width: '120px'
                  }}>
                    Əməliyyatlar
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                    background: selectedItems.includes(item.id) ? '#f0f9ff' : 'white'
                  }}
                >
                  {bulkActions && (
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td
                      key={column.key}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                    >
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {actions
                          .filter(action => !action.condition || action.condition(item, user))
                          .map(action => (
                            <button
                              key={action.key}
                              onClick={() => action.onClick(item)}
                              style={{
                                background: action.variant === 'danger' ? '#dc2626' : 
                                          action.variant === 'success' ? '#059669' :
                                          action.variant === 'primary' ? '#3b82f6' : '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={action.label}
                            >
                              {action.icon}
                              <span className="sr-only">{action.label}</span>
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && data.length > 0 && meta.last_page > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {meta.from}-{meta.to} / {meta.total} nəticə
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => onPageChange?.(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              style={{
                background: meta.current_page === 1 ? '#f3f4f6' : 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: meta.current_page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: meta.current_page === 1 ? '#9ca3af' : '#374151'
              }}
            >
              Əvvəlki
            </button>
            
            <span style={{ 
              fontSize: '14px', 
              color: '#374151',
              padding: '0 12px'
            }}>
              Səhifə {meta.current_page} / {meta.last_page}
            </span>
            
            <button
              onClick={() => onPageChange?.(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              style={{
                background: meta.current_page === meta.last_page ? '#f3f4f6' : 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: meta.current_page === meta.last_page ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: meta.current_page === meta.last_page ? '#9ca3af' : '#374151'
              }}
            >
              Növbəti
            </button>
          </div>
        </div>
      )}

      {/* Modal Components */}
      {createFormComponent}
      {editFormComponent}
      {detailsComponent}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BaseListComponent;