import * as React from 'react';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({className='', children, ...props}) => (
  <select className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 ${className}`} {...props}>
    {children}
  </select>
);

// Additional select components for compatibility
export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', children, ...props}) => (
  <div className={`w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-700 ${className}`} {...props}>
    {children}
  </div>
);

export const SelectValue: React.FC<React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }> = ({className='', placeholder, children, ...props}) => (
  <span className={`text-slate-700 dark:text-slate-300 ${className}`} {...props}>
    {children || placeholder}
  </span>
);

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({className='', children, ...props}) => (
  <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-950 ${className}`} {...props}>
    {children}
  </div>
);

export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({className='', children, value, ...props}) => (
  <div className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-800 dark:focus:bg-slate-800 ${className}`} {...props}>
    {children}
  </div>
);