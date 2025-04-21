import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Maximum number of page buttons to show
  const maxPageButtons = 5;
  
  // Calculate range of visible page buttons
  const getPageRange = () => {
    if (totalPages <= maxPageButtons) {
      // If total pages are less than max buttons, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate start and end positions
    let start = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
    let end = start + maxPageButtons - 1;
    
    // Adjust if end exceeds totalPages
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxPageButtons + 1, 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  const pageRange = getPageRange();
  
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // If there are no pages, don't render the component
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav role="navigation" aria-label="Pagination Navigation" className="pagination-container">
      <div className="pagination">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="pagination-button prev-button"
          aria-label="Previous page"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="button-text">Previous</span>
        </button>
        
        <div className="page-numbers">
          {/* Show first page if not in range */}
          {pageRange[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="pagination-button page-number"
                aria-label="Go to page 1"
              >
                1
              </button>
              {pageRange[0] > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}
          
          {/* Show page numbers */}
          {pageRange.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`pagination-button page-number ${page === currentPage ? 'active' : ''}`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          
          {/* Show last page if not in range */}
          {pageRange[pageRange.length - 1] < totalPages && (
            <>
              {pageRange[pageRange.length - 1] < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="pagination-button page-number"
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="pagination-button next-button"
          aria-label="Next page"
        >
          <span className="button-text">Next</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      <style jsx>{`
        .pagination-container {
          margin-top: 24px;
          margin-bottom: 24px;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .pagination-button {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 8px;
          background-color: white;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pagination-button:hover:not(:disabled) {
          border-color: #0070f3;
          color: #0070f3;
        }
        
        .pagination-button:disabled {
          color: #d9d9d9;
          cursor: not-allowed;
        }
        
        .pagination-button.active {
          background-color: #0070f3;
          color: white;
          border-color: #0070f3;
        }
        
        .prev-button, .next-button {
          padding: 0 12px;
          gap: 6px;
        }
        
        .page-numbers {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .pagination-ellipsis {
          margin: 0 4px;
          color: #999;
        }
        
        .pagination-info {
          text-align: center;
          margin-top: 12px;
          font-size: 0.9rem;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .button-text {
            display: none;
          }
          
          .prev-button, .next-button {
            padding: 0 8px;
          }
          
          .pagination-button {
            min-width: 32px;
            height: 32px;
            font-size: 0.85rem;
          }
          
          /* On mobile, limit number of visible pages */
          .page-numbers .page-number:not(.active) {
            display: none;
          }
          
          /* But always show first and last when they appear */
          .page-numbers .page-number:first-child,
          .page-numbers .page-number:last-child {
            display: flex;
          }
          
          /* And always show the active page */
          .page-numbers .page-number.active {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};

export default Pagination;