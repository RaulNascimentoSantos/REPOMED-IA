import * as React from 'react';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({className='', children, ...props}) => (
  <select className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 ${className}`} {...props}>
    {children}
  </select>
);