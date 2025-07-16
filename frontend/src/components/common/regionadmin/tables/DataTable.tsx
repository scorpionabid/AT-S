import React from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onRowClick?: (row: any) => void;
  selectedRows?: string[];
  onRowSelect?: (rowId: string) => void;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Məlumat yoxdur',
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  selectedRows = [],
  onRowSelect,
  className = ''
}) => {
  const handleSort = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const renderCellContent = (column: Column, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className={`data-table-wrapper ${className}`}>
        <div className="data-table-loading">
          <div className="loading-spinner" />
          <p>Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table-wrapper ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {onRowSelect && (
              <th className="select-column">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      data.forEach(row => onRowSelect(row.id));
                    } else {
                      selectedRows.forEach(id => onRowSelect(id));
                    }
                  }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  ${column.sortable ? 'sortable' : ''}
                  ${sortColumn === column.key ? 'sorted' : ''}
                  ${sortColumn === column.key ? sortDirection : ''}
                `}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <span className="column-label">{column.label}</span>
                {column.sortable && (
                  <span className="sort-indicator">
                    {sortColumn === column.key ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      '↕'
                    )}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length + (onRowSelect ? 1 : 0)} 
                className="empty-message"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`
                  ${onRowClick ? 'clickable' : ''}
                  ${selectedRows.includes(row.id) ? 'selected' : ''}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {onRowSelect && (
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onRowSelect(row.id);
                      }}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className={`column-${column.key}`}>
                    {renderCellContent(column, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;