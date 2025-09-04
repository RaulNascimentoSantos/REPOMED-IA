import * as React from 'react';

type Col<T> = { key: keyof T; header: string; render?: (row:T)=>React.ReactNode; className?: string };

export function DataTable<T extends {id:string}>({data, columns}:{data:T[]; columns:Col<T>[]}){
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/60">
          <tr>{columns.map(c => <th key={String(c.key)} className="px-4 py-2 text-left font-medium">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
              {columns.map(c => <td key={String(c.key)} className={`px-4 py-2 ${c.className||''}`}>{c.render?c.render(row):String(row[c.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}