import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Icon, IconName } from '../common/Icon';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { ContextMenu } from '../common/ContextMenu';

interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: any, index: number) => React.ReactNode;
  mobileHidden?: boolean;
  priority?: 'high' | 'medium' | 'low'; // For responsive hiding
}

interface TableAction {
  id: string;
  label: string;
  icon?: IconName;
  onClick: (record: any) => void;
  disabled?: (record: any) => boolean;
  destructive?: boolean;
}

interface ResponsiveTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  loading?: boolean;
  emptyText?: string;
  selectable?: boolean;
  selectedRows?: any[];
  onSelectionChange?: (selectedRows: any[]) => void;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
  rowKey?: string;
}

interface ViewToggleProps {
  value: 'table' | 'cards';
  onChange: (value: 'table' | 'cards') => void;
  options: Array<{
    value: 'table' | 'cards';
    icon: IconName;
    label: string;
  }>;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, options }) => {
  return (
    <div className="view-toggle">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={classNames(
            'view-toggle__button',
            {
              'view-toggle__button--active': value === option.value,
            }
          )}
          aria-label={option.label}
        >
          <Icon name={option.icon} size={18} />
          <span className="view-toggle__label">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

// Mobile Card View for table data
const MobileCardView: React.FC<{
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  rowKey: string;
  loading: boolean;
  emptyText: string;
}> = ({ data, columns, actions, rowKey, loading, emptyText }) => {
  const primaryColumns = columns.filter(col => col.priority === 'high');
  const secondaryColumns = columns.filter(col => col.priority === 'medium');

  if (loading) {
    return (
      <div className="mobile-cards">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="mobile-card mobile-card--skeleton">
            <CardContent>
              <div className="mobile-card__skeleton">
                <div className="skeleton skeleton--line skeleton--line-3-4"></div>
                <div className="skeleton skeleton--line skeleton--line-1-2"></div>
                <div className="skeleton skeleton--line skeleton--line-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mobile-cards__empty">
        <Icon name="file-text" size={48} className="mobile-cards__empty-icon" />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="mobile-cards">
      {data.map((record, index) => (
        <Card key={record[rowKey] || index} className="mobile-card" hoverable>
          <CardContent>
            <div className="mobile-card__content">
              {/* Primary info */}
              <div className="mobile-card__primary">
                {primaryColumns.map((column) => (
                  <div key={column.key} className="mobile-card__field">
                    <span className="mobile-card__value mobile-card__value--primary">
                      {column.render 
                        ? column.render(record[column.key], record, index)
                        : record[column.key]
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Secondary info */}
              {secondaryColumns.length > 0 && (
                <div className="mobile-card__secondary">
                  {secondaryColumns.map((column) => (
                    <div key={column.key} className="mobile-card__field">
                      <span className="mobile-card__label">{column.title}:</span>
                      <span className="mobile-card__value">
                        {column.render 
                          ? column.render(record[column.key], record, index)
                          : record[column.key]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="mobile-card__actions">
                  {actions.slice(0, 2).map((action) => (
                    <Button
                      key={action.id}
                      variant={action.destructive ? 'danger' : 'outline'}
                      size="sm"
                      leftIcon={action.icon}
                      onClick={() => action.onClick(record)}
                      disabled={action.disabled?.(record)}
                    >
                      {action.label}
                    </Button>
                  ))}
                  {actions.length > 2 && (
                    <ContextMenu
                      items={actions.slice(2).map(action => ({
                        id: action.id,
                        label: action.label,
                        icon: action.icon,
                        disabled: action.disabled?.(record),
                        destructive: action.destructive,
                        onClick: () => action.onClick(record),
                      }))}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Icon name="more-horizontal" size={16} />
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Desktop Table View
const DesktopTableView: React.FC<{
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  rowKey: string;
  loading: boolean;
  emptyText: string;
  selectable: boolean;
  selectedRows: any[];
  onSelectionChange?: (selectedRows: any[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}> = ({ 
  data, 
  columns, 
  actions, 
  rowKey, 
  loading, 
  emptyText,
  selectable,
  selectedRows,
  onSelectionChange,
  onSort
}) => {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: TableColumn) => {
    if (!column.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortColumn === column.key && sortDirection === 'asc') {
      direction = 'desc';
    }

    setSortColumn(column.key);
    setSortDirection(direction);
    onSort?.(column.key, direction);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data);
    }
  };

  const handleSelectRow = (record: any) => {
    if (!onSelectionChange) return;

    const isSelected = selectedRows.some(row => row[rowKey] === record[rowKey]);
    if (isSelected) {
      onSelectionChange(selectedRows.filter(row => row[rowKey] !== record[rowKey]));
    } else {
      onSelectionChange([...selectedRows, record]);
    }
  };

  if (loading) {
    return (
      <div className="desktop-table">
        <div className="desktop-table__skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="desktop-table__skeleton-row">
              {columns.map((column) => (
                <div key={column.key} className="skeleton skeleton--line"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-table">
      <table className="desktop-table__table">
        <thead>
          <tr>
            {selectable && (
              <th className="desktop-table__header-cell desktop-table__header-cell--checkbox">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="desktop-table__checkbox"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={classNames(
                  'desktop-table__header-cell',
                  {
                    'desktop-table__header-cell--sortable': column.sortable,
                    'desktop-table__header-cell--sorted': sortColumn === column.key,
                  }
                )}
                style={{ width: column.width, textAlign: column.align }}
                onClick={() => handleSort(column)}
              >
                <div className="desktop-table__header-content">
                  <span>{column.title}</span>
                  {column.sortable && (
                    <div className="desktop-table__sort-icons">
                      <Icon
                        name="chevron-up"
                        size={12}
                        className={classNames(
                          'desktop-table__sort-icon',
                          {
                            'desktop-table__sort-icon--active':
                              sortColumn === column.key && sortDirection === 'asc',
                          }
                        )}
                      />
                      <Icon
                        name="chevron-down"
                        size={12}
                        className={classNames(
                          'desktop-table__sort-icon',
                          {
                            'desktop-table__sort-icon--active':
                              sortColumn === column.key && sortDirection === 'desc',
                          }
                        )}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="desktop-table__header-cell desktop-table__header-cell--actions">
                Əməliyyatlar
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length + 
                  (selectable ? 1 : 0) + 
                  (actions && actions.length > 0 ? 1 : 0)
                }
                className="desktop-table__empty-cell"
              >
                <div className="desktop-table__empty">
                  <Icon name="file-text" size={48} />
                  <p>{emptyText}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((record, index) => {
              const isSelected = selectedRows.some(row => row[rowKey] === record[rowKey]);
              return (
                <tr
                  key={record[rowKey] || index}
                  className={classNames(
                    'desktop-table__row',
                    {
                      'desktop-table__row--selected': isSelected,
                    }
                  )}
                >
                  {selectable && (
                    <td className="desktop-table__cell desktop-table__cell--checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(record)}
                        className="desktop-table__checkbox"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="desktop-table__cell"
                      style={{ textAlign: column.align }}
                    >
                      {column.render
                        ? column.render(record[column.key], record, index)
                        : record[column.key]}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="desktop-table__cell desktop-table__cell--actions">
                      <div className="desktop-table__actions">
                        {actions.slice(0, 3).map((action) => (
                          <button
                            key={action.id}
                            onClick={() => action.onClick(record)}
                            disabled={action.disabled?.(record)}
                            className={classNames(
                              'desktop-table__action-button',
                              {
                                'desktop-table__action-button--destructive': action.destructive,
                              }
                            )}
                            title={action.label}
                          >
                            {action.icon && <Icon name={action.icon} size={16} />}
                          </button>
                        ))}
                        {actions.length > 3 && (
                          <ContextMenu
                            items={actions.slice(3).map(action => ({
                              id: action.id,
                              label: action.label,
                              icon: action.icon,
                              disabled: action.disabled?.(record),
                              destructive: action.destructive,
                              onClick: () => action.onClick(record),
                            }))}
                            trigger={
                              <button className="desktop-table__action-button">
                                <Icon name="more-horizontal" size={16} />
                              </button>
                            }
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

// Main Responsive Table Component
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  actions = [],
  loading = false,
  emptyText = 'Məlumat yoxdur',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  pagination,
  onSort,
  className = '',
  rowKey = 'id',
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && viewMode === 'table') {
        setViewMode('cards');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  return (
    <div className={classNames('responsive-table', className)}>
      {/* Table Controls */}
      <div className="responsive-table__controls">
        <div className="responsive-table__info">
          {pagination && (
            <span className="responsive-table__count">
              {data.length} nəticə (səhifə {pagination.current})
            </span>
          )}
        </div>

        {!isMobile && (
          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'table', icon: 'menu', label: 'Cədvəl' },
              { value: 'cards', icon: 'grid', label: 'Kartlar' },
            ]}
          />
        )}
      </div>

      {/* Table Content */}
      {viewMode === 'table' && !isMobile ? (
        <DesktopTableView
          data={data}
          columns={columns}
          actions={actions}
          rowKey={rowKey}
          loading={loading}
          emptyText={emptyText}
          selectable={selectable}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          onSort={onSort}
        />
      ) : (
        <MobileCardView
          data={data}
          columns={columns}
          actions={actions}
          rowKey={rowKey}
          loading={loading}
          emptyText={emptyText}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.total > pagination.pageSize && (
        <div className="responsive-table__pagination">
          <Button
            variant="outline"
            size="sm"
            leftIcon="chevron-left"
            disabled={pagination.current === 1}
            onClick={() => pagination.onChange(pagination.current - 1)}
          >
            Əvvəlki
          </Button>
          
          <span className="responsive-table__page-info">
            {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            rightIcon="chevron-right"
            disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
            onClick={() => pagination.onChange(pagination.current + 1)}
          >
            Növbəti
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;