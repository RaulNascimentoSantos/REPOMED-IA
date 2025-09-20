import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<{ id:number; type:'success'|'error'|'info'; message:string }[]>([]);
  const push = useCallback((type:'success'|'error'|'info', message:string) => setToasts(t => [...t, { id: Date.now(), type, message }]), []);
  const remove = useCallback((id:number) => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, push, remove };
}