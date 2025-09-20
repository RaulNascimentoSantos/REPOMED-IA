import * as React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox: React.FC<Props> = (props) => (
  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" {...props} />
);