import { ProblemDetails } from '@repomed/contracts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init
  });
  if (!res.ok) {
    let problem: ProblemDetails | undefined;
    try { problem = await res.json(); } catch {}
    const error: any = new Error(problem?.detail || res.statusText);
    error.problem = problem; error.status = res.status;
    throw error;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return res.blob() as any as Promise<T>;
}

export const api = {
  get:  <T>(p: string) => request<T>(p),
  post: <T>(p: string, b?: unknown) => request<T>(p, { method: 'POST', body: JSON.stringify(b || {}) }),
  put:  <T>(p: string, b?: unknown) => request<T>(p, { method: 'PUT',  body: JSON.stringify(b || {}) }),
  del:  <T>(p: string) => request<T>(p, { method: 'DELETE' }),
  patch: <T>(p: string, b?: unknown) => request<T>(p, { method: 'PATCH', body: JSON.stringify(b || {}) }),
};