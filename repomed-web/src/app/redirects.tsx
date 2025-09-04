import { Navigate } from 'react-router-dom';

export const redirects = [
  { from: '/documents-new', to: '/documents' },
  { from: '/documents-list', to: '/documents' },
  { from: '/documents-optimized', to: '/documents' },
  // Qualquer */new legado → /documents/new
  { from: '/documents/create', to: '/documents/new' },
];

export function RedirectRoute({ to }: { to: string }) {
  return <Navigate to={to} replace />;
}