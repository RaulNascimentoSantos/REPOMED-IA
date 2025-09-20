import * as React from 'react';

type Toast = { id: number; type: 'success'|'error'|'info'; message: string };

export function ToastContainer({toasts, onClose}:{toasts:Toast[]; onClose:(id:number)=>void}){
  return (
    <div className="fixed bottom-4 right-4 space-y-2" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className="rounded-2xl bg-slate-900/90 px-4 py-3 text-white shadow">
          <div className="flex items-start gap-3">
            <span className="mt-0.5">{t.type==='success'?'✅':t.type==='error'?'⛔':'ℹ️'}</span>
            <p>{t.message}</p>
            <button onClick={()=>onClose(t.id)} className="ml-3 opacity-75 hover:opacity-100">fechar</button>
          </div>
        </div>
      ))}
    </div>
  )
}