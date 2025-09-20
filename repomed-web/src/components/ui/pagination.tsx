'use client';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPages?: number;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPages = 5,
  className 
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfShow = Math.floor(showPages / 2);
    
    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, currentPage + halfShow);
    
    // Adjust if we're near the beginning or end
    if (end - start + 1 < showPages) {
      if (start === 1) {
        end = Math.min(totalPages, start + showPages - 1);
      } else {
        start = Math.max(1, end - showPages + 1);
      }
    }
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('ellipsis-start');
    }
    
    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('ellipsis-end');
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={cn('flex items-center justify-center space-x-1', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>
      
      {visiblePages.map((page, index) => {
        if (typeof page === 'string') {
          return (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              disabled
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          );
        }
        
        return (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-[40px]',
              page === currentPage && 'bg-blue-600 text-white'
            )}
          >
            {page}
          </button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}