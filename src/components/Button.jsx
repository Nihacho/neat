import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

//Me quiero matar

// Hola 
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  disabled,
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-red-900 to-red-800 text-white hover:from-red-800 hover:to-red-700 focus:ring-red-900/30 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-600 focus:ring-red-800/30 shadow-md hover:shadow-lg',
    outline: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30 shadow-md hover:shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
