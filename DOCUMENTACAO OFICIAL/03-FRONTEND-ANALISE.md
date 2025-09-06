================================================================================
          ANÁLISE FRONTEND - REPOMED IA
================================================================================
Data: 2025-01-04
Análise Profunda Frontend v1.0
================================================================================

## 1. ESTRUTURA DO FRONTEND

### 1.1 Diretórios e Arquivos Principais
### Estrutura repomed-web/src:
```
repomed-web/src/App.jsx
repomed-web/src/App.tsx
repomed-web/src/app/redirects.tsx
repomed-web/src/app/router.tsx
repomed-web/src/AppSimple.jsx
repomed-web/src/components/ArrayField.jsx
repomed-web/src/components/CommandPalette.tsx
repomed-web/src/components/ErrorBoundary.jsx
repomed-web/src/components/ErrorBoundary.tsx
repomed-web/src/components/Header.jsx
repomed-web/src/components/Layout.jsx
repomed-web/src/components/Layout.tsx
repomed-web/src/components/LoadingScreen.tsx
repomed-web/src/components/LoadingSpinner.jsx
repomed-web/src/components/Navigation.jsx
repomed-web/src/components/notifications/NotificationsBell.tsx
repomed-web/src/components/OfflineIndicator.tsx
repomed-web/src/components/PageHeader.tsx
repomed-web/src/components/states/EmptyState.tsx
repomed-web/src/components/states/ErrorState.tsx
repomed-web/src/components/states/LoadingState.tsx
repomed-web/src/components/TemplateSelector.jsx
repomed-web/src/components/ui/Button.tsx
repomed-web/src/components/ui/Card.tsx
repomed-web/src/components/ui/Checkbox.tsx
repomed-web/src/components/ui/DataTable.tsx
repomed-web/src/components/ui/Dialog.tsx
repomed-web/src/components/ui/FormField.tsx
repomed-web/src/components/ui/Input.tsx
repomed-web/src/components/ui/Modal.tsx
repomed-web/src/components/ui/Select.tsx
repomed-web/src/components/ui/Textarea.tsx
repomed-web/src/components/ui/Toast.tsx
repomed-web/src/hooks/useAI.ts
repomed-web/src/hooks/useApi.js
repomed-web/src/hooks/useAuth.ts
repomed-web/src/hooks/useDebounce.ts
repomed-web/src/hooks/useHotkeys.ts
repomed-web/src/hooks/useSignature.ts
repomed-web/src/hooks/useToast.ts
repomed-web/src/lib/api.js
repomed-web/src/lib/api.ts
repomed-web/src/lib/queryClient.js
repomed-web/src/lib/queryClient.ts
repomed-web/src/lib/schemas/document.schema.ts
repomed-web/src/lib/schemas/patient.schema.ts
repomed-web/src/lib/schemas/physician.schema.ts
repomed-web/src/lib/schemas/prescription.schema.ts
repomed-web/src/lib/schemas/signature.schema.ts
repomed-web/src/lib/utils.ts
repomed-web/src/main.jsx
repomed-web/src/main.tsx
repomed-web/src/pages/Analytics.tsx
repomed-web/src/pages/AtestadoNew.tsx
repomed-web/src/pages/Atestados.tsx
repomed-web/src/pages/AuthLoginPage.jsx
repomed-web/src/pages/AuthRegisterPage.jsx
repomed-web/src/pages/CreateDocument.jsx
repomed-web/src/pages/CreateDocumentPage.jsx
repomed-web/src/pages/CreatePatientPage.jsx
repomed-web/src/pages/CreatePrescriptionPage.jsx
repomed-web/src/pages/Dashboard.tsx
repomed-web/src/pages/DocumentDetailPage.jsx
repomed-web/src/pages/Documents.jsx
repomed-web/src/pages/DocumentSigningPage.jsx
repomed-web/src/pages/DocumentsListPage.jsx
repomed-web/src/pages/DocumentsOptimizedPage.jsx
repomed-web/src/pages/DocumentsPage.jsx
repomed-web/src/pages/DocumentsUnified.jsx
repomed-web/src/pages/Exames.tsx
repomed-web/src/pages/ExamesResultados.tsx
repomed-web/src/pages/ExamesSolicitar.tsx
repomed-web/src/pages/Home.tsx
repomed-web/src/pages/HomePage.jsx
repomed-web/src/pages/LaudoNew.tsx
repomed-web/src/pages/Laudos.tsx
repomed-web/src/pages/MetricsPage.jsx
repomed-web/src/pages/PatientCreatePage.jsx
repomed-web/src/pages/PatientDetail.tsx
repomed-web/src/pages/PatientDetailPage.jsx
repomed-web/src/pages/PatientEdit.tsx
repomed-web/src/pages/PatientEditPage.jsx
repomed-web/src/pages/PatientHistory.tsx
repomed-web/src/pages/PatientNew.tsx
repomed-web/src/pages/Patients.tsx
repomed-web/src/pages/PatientsPage.jsx
repomed-web/src/pages/PrescriptionCreatePage.jsx
repomed-web/src/pages/Prescriptions.tsx
repomed-web/src/pages/PrescriptionViewPage.jsx
repomed-web/src/pages/Reports.tsx
repomed-web/src/pages/SharePage.jsx
repomed-web/src/pages/TemplateDetailPage.jsx
repomed-web/src/pages/TemplatesPage.jsx
repomed-web/src/pages/Test.jsx
repomed-web/src/pages/TestPage.jsx
repomed-web/src/pages/TestSimple.jsx
repomed-web/src/pages/VerifyPage.jsx
repomed-web/src/pages/WorkspaceSimple.jsx
repomed-web/src/router.tsx
repomed-web/src/routes/account/Profile.tsx
```


## 2. PÁGINAS E COMPONENTES

### 2.1 Páginas Principais Identificadas

#### Páginas de Autenticação:
- AuthLoginPage.jsx
- AuthRegisterPage.jsx

#### Páginas de Pacientes:
- Patients.tsx
- PatientNew.tsx
- PatientDetail.tsx
- PatientEdit.tsx
- PatientHistory.tsx

#### Páginas de Documentos:
- Documents.jsx
- CreateDocument.jsx
- DocumentDetailPage.jsx
- DocumentSigningPage.jsx

#### Páginas de Prescrições:
- Prescriptions.tsx
- PrescriptionCreatePage.jsx
- PrescriptionViewPage.jsx

#### Páginas de Atestados e Laudos:
- Atestados.tsx
- AtestadoNew.tsx
- Laudos.tsx
- LaudoNew.tsx

#### Páginas de Exames:
- Exames.tsx
- ExamesResultados.tsx
- ExamesSolicitar.tsx

#### Outras Páginas:
- Dashboard.tsx
- Home.tsx
- Analytics.tsx
- Reports.tsx
- MetricsPage.jsx
- TemplatesPage.jsx
