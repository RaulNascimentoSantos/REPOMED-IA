import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy loading de TODAS as 38+ páginas
const pages = {
  // Auth (2)
  AuthLogin: lazy(() => import('./pages/AuthLoginPage')),
  AuthRegister: lazy(() => import('./pages/AuthRegisterPage')),
  
  // Dashboard (2)
  Dashboard: lazy(() => import('./pages/Dashboard')),
  Home: lazy(() => import('./pages/HomePage')),
  
  // Patients (5)
  Patients: lazy(() => import('./pages/PatientsPage')),
  PatientDetail: lazy(() => import('./pages/PatientDetailPage')),
  PatientNew: lazy(() => import('./pages/PatientCreatePage')),
  PatientEdit: lazy(() => import('./pages/PatientEditPage')),
  PatientHistory: lazy(() => import('./pages/PatientHistory')),
  
  // Prescriptions (4)
  Prescriptions: lazy(() => import('./pages/Prescriptions')),
  PrescriptionNew: lazy(() => import('./pages/PrescriptionCreatePage')),
  PrescriptionEdit: lazy(() => import('./pages/PrescriptionEdit')),
  PrescriptionView: lazy(() => import('./pages/PrescriptionViewPage')),
  
  // Documents (3)
  Documents: lazy(() => import('./pages/DocumentsPage')),
  DocumentNew: lazy(() => import('./pages/CreateDocumentPage')),
  DocumentView: lazy(() => import('./pages/DocumentDetailPage')),
  
  // Templates (3)
  Templates: lazy(() => import('./pages/TemplatesPage')),
  TemplateNew: lazy(() => import('./pages/TemplateNew')),
  TemplateEdit: lazy(() => import('./pages/TemplateDetailPage')),
  
  // Certificates (4)
  Atestados: lazy(() => import('./pages/Atestados')),
  AtestadoNew: lazy(() => import('./pages/AtestadoNew')),
  Laudos: lazy(() => import('./pages/Laudos')),
  LaudoNew: lazy(() => import('./pages/LaudoNew')),
  
  // Exams (3)
  Exames: lazy(() => import('./pages/Exames')),
  ExamesSolicitar: lazy(() => import('./pages/ExamesSolicitar')),
  ExamesResultados: lazy(() => import('./pages/ExamesResultados')),
  
  // Analytics (3)
  Metrics: lazy(() => import('./pages/MetricsPage')),
  Reports: lazy(() => import('./pages/Reports')),
  Analytics: lazy(() => import('./pages/Analytics')),
  
  // Share (2)
  Share: lazy(() => import('./pages/SharePage')),
  SharedDocument: lazy(() => import('./pages/SharedDocument')),
  
  // Settings (4)
  Settings: lazy(() => import('./pages/Settings')),
  SettingsProfile: lazy(() => import('./pages/SettingsProfile')),
  SettingsClinic: lazy(() => import('./pages/SettingsClinic')),
  SettingsBilling: lazy(() => import('./pages/SettingsBilling')),
  
  // Admin (3)
  Users: lazy(() => import('./pages/Users')),
  Organizations: lazy(() => import('./pages/Organizations')),
  Billing: lazy(() => import('./pages/Billing')),
};

// Layout principal
const Layout = lazy(() => import('./components/Layout'));

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export function Router() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<pages.AuthLogin />} />
            <Route path="/register" element={<pages.AuthRegister />} />
            <Route path="/shared/:id" element={<pages.SharedDocument />} />
            
            {/* PROTECTED ROUTES */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<pages.Dashboard />} />
              <Route path="home" element={<pages.Home />} />
              
              {/* Patients */}
              <Route path="patients">
                <Route index element={<pages.Patients />} />
                <Route path="new" element={<pages.PatientNew />} />
                <Route path=":id" element={<pages.PatientDetail />} />
                <Route path=":id/edit" element={<pages.PatientEdit />} />
                <Route path=":id/history" element={<pages.PatientHistory />} />
              </Route>
              
              {/* Prescriptions */}
              <Route path="prescriptions">
                <Route index element={<pages.Prescriptions />} />
                <Route path="new" element={<pages.PrescriptionNew />} />
                <Route path=":id" element={<pages.PrescriptionView />} />
                <Route path=":id/edit" element={<pages.PrescriptionEdit />} />
              </Route>
              
              {/* Documents */}
              <Route path="documents">
                <Route index element={<pages.Documents />} />
                <Route path="new" element={<pages.DocumentNew />} />
                <Route path=":id" element={<pages.DocumentView />} />
              </Route>
              
              {/* Templates */}
              <Route path="templates">
                <Route index element={<pages.Templates />} />
                <Route path="new" element={<pages.TemplateNew />} />
                <Route path=":id/edit" element={<pages.TemplateEdit />} />
              </Route>
              
              {/* Certificates */}
              <Route path="atestados">
                <Route index element={<pages.Atestados />} />
                <Route path="new" element={<pages.AtestadoNew />} />
              </Route>
              
              <Route path="laudos">
                <Route index element={<pages.Laudos />} />
                <Route path="new" element={<pages.LaudoNew />} />
              </Route>
              
              {/* Exams */}
              <Route path="exames">
                <Route index element={<pages.Exames />} />
                <Route path="solicitar" element={<pages.ExamesSolicitar />} />
                <Route path="resultados" element={<pages.ExamesResultados />} />
              </Route>
              
              {/* Analytics */}
              <Route path="metrics" element={<pages.Metrics />} />
              <Route path="reports" element={<pages.Reports />} />
              <Route path="analytics" element={<pages.Analytics />} />
              
              {/* Share */}
              <Route path="share" element={<pages.Share />} />
              
              {/* Settings */}
              <Route path="settings">
                <Route index element={<pages.Settings />} />
                <Route path="profile" element={<pages.SettingsProfile />} />
                <Route path="clinic" element={<pages.SettingsClinic />} />
                <Route path="billing" element={<pages.SettingsBilling />} />
              </Route>
              
              {/* Admin */}
              <Route path="admin" element={<AdminRoute><Outlet /></AdminRoute>}>
                <Route path="users" element={<pages.Users />} />
                <Route path="organizations" element={<pages.Organizations />} />
                <Route path="billing" element={<pages.Billing />} />
              </Route>
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}