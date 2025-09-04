import * as React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { redirects, RedirectRoute } from './redirects';

// ====== EAGER IMPORTS (Small, critical components) ======
import Login from '../routes/auth/Login';
import ErrorBoundary from '../routes/ErrorBoundary';
import NotFound from '../routes/NotFound';

// ====== LAZY IMPORTS (Heavy components) ======
// Auth
const AuthRegisterPage = React.lazy(() => import('../pages/AuthRegisterPage'));

// Main
const Workspace = React.lazy(() => import('../routes/Workspace'));
const HomePage = React.lazy(() => import('../pages/HomePage'));

// Patients
const PatientsPage = React.lazy(() => import('../pages/PatientsPage'));
const PatientCreatePage = React.lazy(() => import('../pages/PatientCreatePage'));
const PatientDetailPage = React.lazy(() => import('../pages/PatientDetailPage'));
const PatientEditPage = React.lazy(() => import('../pages/PatientEditPage'));

// Templates
const TemplatesPage = React.lazy(() => import('../pages/TemplatesPage'));
const TemplateDetail = React.lazy(() => import('../routes/templates/TemplateDetail'));
const CreateTemplate = React.lazy(() => import('../routes/templates/CreateTemplate'));

// Prescriptions
const PrescriptionCreatePage = React.lazy(() => import('../pages/PrescriptionCreatePage'));
const PrescriptionViewPage = React.lazy(() => import('../pages/PrescriptionViewPage'));

// Documents
const DocumentsPage = React.lazy(() => import('../pages/DocumentsPage'));
const DocumentDetailPage = React.lazy(() => import('../pages/DocumentDetailPage'));
const DocumentSigningPage = React.lazy(() => import('../pages/DocumentSigningPage'));
const CreateDocumentPage = React.lazy(() => import('../pages/CreateDocumentPage'));

// Sharing & Verification
const SharePage = React.lazy(() => import('../pages/SharePage'));
const VerifyPage = React.lazy(() => import('../pages/VerifyPage'));

// Metrics & Analytics
const MetricsPage = React.lazy(() => import('../pages/MetricsPage'));
const Reports = React.lazy(() => import('../routes/reports'));
const Analytics = React.lazy(() => import('../routes/analytics'));

// Account
const Profile = React.lazy(() => import('../routes/account/Profile'));
const Settings = React.lazy(() => import('../routes/account/Settings'));

// Upload
const UploadPage = React.lazy(() => import('../routes/upload/UploadPage'));

// Test Pages
const Test = React.lazy(() => import('../pages/Test'));
const TestSimple = React.lazy(() => import('../pages/TestSimple'));
const TestPage = React.lazy(() => import('../pages/TestPage'));

// Loading component for lazy loaded routes
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Suspense wrapper for lazy components
const Lazy = ({children}:{children:React.ReactNode}) => (
  <React.Suspense fallback={<Loading />}>
    {children}
  </React.Suspense>
);

function Protected({children}:{children:React.ReactNode}){ 
  const { isAuthenticated } = useAuth(); 
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />; 
}

const router = createBrowserRouter([
  // ====== MAIN DASHBOARD ======
  { path: '/', element: <Protected><Lazy><Workspace/></Lazy></Protected>, errorElement: <ErrorBoundary/> },
  { path: '/home', element: <Protected><Lazy><HomePage/></Lazy></Protected> },
  
  // ====== AUTH ======
  { path: '/auth/login', element: <Login/> },
  { path: '/auth/register', element: <Lazy><AuthRegisterPage/></Lazy> },
  
  // ====== PATIENTS - Complete CRUD ======
  { path: '/patients', element: <Protected><Lazy><PatientsPage/></Lazy></Protected> },
  { path: '/patients/create', element: <Protected><Lazy><PatientCreatePage/></Lazy></Protected> },
  { path: '/patients/:id', element: <Protected><Lazy><PatientDetailPage/></Lazy></Protected> },
  { path: '/patients/:id/edit', element: <Protected><Lazy><PatientEditPage/></Lazy></Protected> },
  
  // ====== PRESCRIPTIONS ======
  { path: '/prescription/create', element: <Protected><Lazy><PrescriptionCreatePage/></Lazy></Protected> },
  { path: '/prescription/:id', element: <Protected><Lazy><PrescriptionViewPage/></Lazy></Protected> },
  
  // ====== TEMPLATES ======
  { path: '/templates', element: <Protected><Lazy><TemplatesPage/></Lazy></Protected> },
  { path: '/templates/create', element: <Protected><Lazy><CreateTemplate/></Lazy></Protected> },
  { path: '/templates/:id', element: <Protected><Lazy><TemplateDetail/></Lazy></Protected> },
  
  // ====== DOCUMENTS - Canonical Routes ======
  { path: '/documents', element: <Protected><Lazy><DocumentsPage/></Lazy></Protected> },
  { path: '/documents/new', element: <Protected><Lazy><CreateDocumentPage/></Lazy></Protected> },
  { path: '/documents/:id', element: <Protected><Lazy><DocumentDetailPage/></Lazy></Protected> },
  { path: '/documents/:id/sign', element: <Protected><Lazy><DocumentSigningPage/></Lazy></Protected> },
  
  // ====== REDIRECTS for Legacy Routes ======
  { path: '/documents-new', element: <RedirectRoute to="/documents" /> },
  { path: '/documents-list', element: <RedirectRoute to="/documents" /> },
  { path: '/documents-optimized', element: <RedirectRoute to="/documents" /> },
  { path: '/documents/create', element: <RedirectRoute to="/documents/new" /> },
  
  // ====== SHARING & VERIFICATION (Public) ======
  { path: '/share/:id', element: <Lazy><SharePage/></Lazy> },
  { path: '/verify/:hash', element: <Lazy><VerifyPage/></Lazy> },
  
  // ====== METRICS & ANALYTICS ======
  { path: '/metrics', element: <Protected><Lazy><MetricsPage/></Lazy></Protected> },
  { path: '/reports', element: <Protected><Lazy><Reports/></Lazy></Protected> },
  { path: '/analytics', element: <Protected><Lazy><Analytics/></Lazy></Protected> },
  
  // ====== ACCOUNT ======
  { path: '/account/profile', element: <Protected><Lazy><Profile/></Lazy></Protected> },
  { path: '/account/settings', element: <Protected><Lazy><Settings/></Lazy></Protected> },
  
  // ====== UPLOAD ======
  { path: '/upload', element: <Protected><Lazy><UploadPage /></Lazy></Protected> },
  
  // ====== TEST PAGES ======
  { path: '/test', element: <Protected><Lazy><Test/></Lazy></Protected> },
  { path: '/test-simple', element: <Protected><Lazy><TestSimple/></Lazy></Protected> },
  { path: '/test-page', element: <Protected><Lazy><TestPage/></Lazy></Protected> },
  
  // ====== ERROR ======
  { path: '*', element: <NotFound/> }
]);

export default function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}