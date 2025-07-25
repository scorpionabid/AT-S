// ====================
// ATİS Task Dashboard Pagination
// Pagination component for task lists
// ====================

import React from 'react';

interface TaskDashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export const TaskDashboardPagination: React.FC<TaskDashboardPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const startItem = ((currentPage - 1) * perPage) + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn-base btn-sm ${
            page === currentPage ? 'btn-primary' : 'btn-outline'
          }`}
        >
          {page}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        {totalItems} tapşırıqdan {startItem}-{endItem} göstərilir
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn-base btn-sm btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Əvvəlki
        </button>
        
        {/* First page */}
        {currentPage > 3 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="btn-base btn-sm btn-outline"
            >
              1
            </button>
            {currentPage > 4 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}
        
        {/* Page numbers */}
        {renderPageNumbers()}
        
        {/* Last page */}
        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="btn-base btn-sm btn-outline"
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn-base btn-sm btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Növbəti
        </button>
      </div>
      
      {/* Page info */}
      <div className="text-sm text-gray-500">
        Səhifə {currentPage} / {totalPages}
      </div>
    </div>
  );
};