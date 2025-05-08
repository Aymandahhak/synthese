import React from 'react';
import { Button } from '@/components/responsable-formation/ui/button';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesShown = 5; // Maximum number of page buttons to show
    
    // Logic to show a smart range of pages
    if (totalPages <= maxPagesShown) {
      // If we have fewer pages than the max, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate the range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // If we're at the start, show more after
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // If we're at the end, show more before
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis before the range if needed
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add the range
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis after the range if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Handle ellipsis clicks
  const handleEllipsisClick = (direction) => {
    const nextPage = direction === 'forward' 
      ? Math.min(currentPage + 3, totalPages)
      : Math.max(currentPage - 3, 1);
    onPageChange(nextPage);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo;
      </Button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          // Render clickable ellipsis
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="sm"
              onClick={() => handleEllipsisClick(index > currentPage ? 'forward' : 'backward')}
            >
              ...
            </Button>
          );
        }
        
        // Render page number
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </Button>
    </div>
  );
};

export default Pagination; 