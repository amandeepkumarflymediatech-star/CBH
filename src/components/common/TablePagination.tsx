'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = 'records',
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // If there are 0 or only 1 item and no items per page selector needed, don't show empty controls
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Smart page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 bg-white border-t border-slate-200 text-xs text-slate-600 ${className}`}
      style={{ borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}
    >
      {/* Items count & page size selector */}
      <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-start w-full sm:w-auto">
        <span className="font-medium text-slate-600">
          Showing <strong className="text-slate-900 font-bold">{startItem}</strong> - <strong className="text-slate-900 font-bold">{endItem}</strong> of <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-slate-400">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 rounded border border-slate-300 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-bold transition-colors ${
              currentPage === 1
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100'
            }`}
            title="Previous page"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Numbered Pills */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ell-${idx}`} className="px-1 text-slate-400 font-bold">
                    ...
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <button
                  key={`pg-${page}`}
                  type="button"
                  onClick={() => onPageChange(Number(page))}
                  className={`min-w-[28px] h-7 px-1.5 rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-bold transition-colors ${
              currentPage === totalPages
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100'
            }`}
            title="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
