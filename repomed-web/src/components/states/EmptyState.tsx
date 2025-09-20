import * as React from 'react';

export function EmptyState({message='Nada encontrado', cta}:{message?:string; cta?:React.ReactNode}){
  return <div className="p-6 text-slate-500">{message}{cta ? <div className="mt-3">{cta}</div> : null}</div>;
}