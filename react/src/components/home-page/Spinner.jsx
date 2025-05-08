import React from 'react';

/**
 * Spinner component for loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const spinnerClass = `animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size] || sizeClasses.md} ${className}`;

  return (
    <div className="flex justify-center items-center">
      <div className={spinnerClass} role="status" aria-label="Loading">
        <span className="sr-only">Chargement...</span>
      </div>
    </div>
  );
};

export default Spinner; 