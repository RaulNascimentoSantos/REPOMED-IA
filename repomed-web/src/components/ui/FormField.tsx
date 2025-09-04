import * as React from 'react';
import { FieldError } from 'react-hook-form';

type Props = { label: string; htmlFor: string; children: React.ReactNode; error?: FieldError; hint?: string; };

export function FormField({label, htmlFor, children, error, hint}: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error.message}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}