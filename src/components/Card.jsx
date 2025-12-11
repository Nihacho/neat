import React from 'react';
import clsx from 'clsx';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300',
        hover && 'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx('p-6 border-b border-gray-100', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>{children}</h3>;
}

export function CardContent({ children, className }) {
  return <div className={clsx('p-6', className)}>{children}</div>;
}
