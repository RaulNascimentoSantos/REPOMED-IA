================================================================================
          ANÁLISE LOGS E ERROS - REPOMED IA
================================================================================
Data: 2025-01-04
Análise de Logs e Erros v1.0
================================================================================

## 1. ARQUIVOS DE LOG DISPONÍVEIS

### 1.1 Logs do Backend
### Arquivos de log encontrados:
```
./node_modules/.pnpm/is-arrayish@0.3.2/node_modules/is-arrayish/yarn-error.log
./repomed-api/backend-errors.log
./repomed-ia/node_modules/is-arrayish/yarn-error.log
./repomed-web/frontend-errors.log
```


## 2. ANÁLISE DOS LOGS DE ERRO

### 2.1 Backend Errors Log (repomed-api/backend-errors.log)
```
    Object literal may only specify known properties, and 'password' does not exist in type '{ documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }'.
  Overload 2 of 2, '(values: { documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }[]): PgInsertBase<...>', gave the following error.
    Object literal may only specify known properties, and 'documentId' does not exist in type '{ documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }[]'.
src/server.ts(680,65): error TS2339: Property 'authenticate' does not exist on type 'FastifyInstance<Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault> & PromiseLike<...>'.
src/server.ts(689,7): error TS2451: Cannot redeclare block-scoped variable 'start'.
src/server.ts(718,7): error TS2451: Cannot redeclare block-scoped variable 'fastify'.
src/server.ts(724,7): error TS2451: Cannot redeclare block-scoped variable 'registerPlugins'.
src/server.ts(778,10): error TS2393: Duplicate function implementation.
src/server.ts(782,10): error TS2393: Duplicate function implementation.
src/server.ts(786,16): error TS2393: Duplicate function implementation.
src/server.ts(791,7): error TS2451: Cannot redeclare block-scoped variable 'JWT_SECRET'.
src/server.ts(822,7): error TS2451: Cannot redeclare block-scoped variable 'registerRoutes'.
src/server.ts(918,53): error TS2339: Property 'authenticate' does not exist on type 'FastifyInstance<Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, FastifyTypeProviderDefault> & PromiseLike<...>'.
src/server.ts(919,20): error TS2339: Property 'user' does not exist on type 'FastifyRequest<RouteGenericInterface, Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ... 4 more ..., ResolveFastifyRequestType<...>>'.
src/server.ts(1144,61): error TS2345: Argument of type '{ id: string; title: string; content: string; hash: string | null; createdAt: Date; isSigned: boolean | null; signedAt: Date | null; signedBy: string | null; signatureHash: string | null; patient: { ...; }; doctor: { ...; }; }' is not assignable to parameter of type 'Document'.
  Types of property 'hash' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.
      Type 'null' is not assignable to type 'string | undefined'.
src/server.ts(1157,51): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'undefined'.
src/server.ts(1191,44): error TS2769: No overload matches this call.
  Overload 1 of 2, '(value: { documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }): PgInsertBase<...>', gave the following error.
    Object literal may only specify known properties, and 'password' does not exist in type '{ documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }'.
  Overload 2 of 2, '(values: { documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }[]): PgInsertBase<...>', gave the following error.
    Object literal may only specify known properties, and 'documentId' does not exist in type '{ documentId: string | SQL<unknown> | Placeholder<string, any>; token: string | SQL<unknown> | Placeholder<string, any>; expiresAt: SQL<unknown> | Date | Placeholder<...>; id?: string | ... 2 more ... | undefined; createdAt?: SQL<...> | ... 2 more ... | undefined; accessCount?: number | ... 2 more ... | undefined; }[]'.
src/server.ts(1223,7): error TS2451: Cannot redeclare block-scoped variable 'start'.
src/services/cache.service.ts(50,22): error TS2769: No overload matches this call.
  Overload 1 of 8, '(options: RedisOptions): Redis', gave the following error.
    Object literal may only specify known properties, and 'retryDelayOnFailover' does not exist in type 'RedisOptions'.
  Overload 2 of 8, '(port: number): Redis', gave the following error.
    Argument of type '{ host: string; port: number; password: string | undefined; db: number; maxRetriesPerRequest: number; retryDelayOnFailover: number; enableReadyCheck: boolean; lazyConnect: boolean; keepAlive: number; connectTimeout: number; commandTimeout: number; family: number; maxLoadingTimeout: number; }' is not assignable to parameter of type 'number'.
  Overload 3 of 8, '(path: string): Redis', gave the following error.
    Argument of type '{ host: string; port: number; password: string | undefined; db: number; maxRetriesPerRequest: number; retryDelayOnFailover: number; enableReadyCheck: boolean; lazyConnect: boolean; keepAlive: number; connectTimeout: number; commandTimeout: number; family: number; maxLoadingTimeout: number; }' is not assignable to parameter of type 'string'.
src/services/MetricsCollector.ts(65,35): error TS2345: Argument of type 'MetricsCollectorDependencies' is not assignable to parameter of type '{ database: any; cache: any; }'.
  Property 'database' is optional in type 'MetricsCollectorDependencies' but required in type '{ database: any; cache: any; }'.
src/services/MetricsCollector.ts(88,16): error TS18046: 'error' is of type 'unknown'.
src/services/MetricsCollector.ts(159,71): error TS18046: 'error' is of type 'unknown'.
src/services/pdf.service.ts(109,5): error TS2741: Property 'documentId' is missing in type '{}' but required in type 'PDFGenerationOptions'.
src/services/pdf.service.ts(138,30): error TS2339: Property 'tags' does not exist on type 'Document'.
src/services/pdf.service.ts(142,11): error TS2322: Type 'null' is not assignable to type 'Date | undefined'.
src/services/pdf.service.ts(518,49): error TS2741: Property 'documentId' is missing in type '{}' but required in type 'PDFGenerationOptions'.
src/services/performance.service.ts(91,18): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/services/performance.service.ts(91,21): error TS7006: Parameter 'b' implicitly has an 'any' type.
src/services/performance.service.ts(152,9): error TS2322: Type '"default"' is not assignable to type '"medium" | "short" | "long"'.
npm error Lifecycle script `build` failed with error:
npm error code 2
npm error path C:\Users\Raul\Desktop\WORKSPACE\RepoMed IA\repomed-api
npm error workspace repomed-api@1.0.0
npm error location C:\Users\Raul\Desktop\WORKSPACE\RepoMed IA\repomed-api
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c tsc
```


### 2.2 Frontend Errors Log (repomed-web/frontend-errors.log)
```
[2mdist/[22m[36massets/js/Profile-KyLK_XBr.js                 [39m[1m[2m  0.98 kB[22m[1m[22m[2m │ gzip:  0.49 kB[22m
[2mdist/[22m[36massets/js/Settings-CMGQq5z2.js                [39m[1m[2m  1.33 kB[22m[1m[22m[2m │ gzip:  0.59 kB[22m
[2mdist/[22m[36massets/js/TestSimple-DZjatHDx.js              [39m[1m[2m  1.39 kB[22m[1m[22m[2m │ gzip:  0.66 kB[22m
[2mdist/[22m[36massets/js/TemplateDetail-CL-7q9yQ.js          [39m[1m[2m  2.12 kB[22m[1m[22m[2m │ gzip:  0.97 kB[22m
[2mdist/[22m[36massets/js/TestPage-BzITSdMr.js                [39m[1m[2m  2.60 kB[22m[1m[22m[2m │ gzip:  1.04 kB[22m
[2mdist/[22m[36massets/js/CreateTemplate-oWBWNXvw.js          [39m[1m[2m  3.07 kB[22m[1m[22m[2m │ gzip:  1.34 kB[22m
[2mdist/[22m[36massets/js/Workspace-BAbn45zL.js               [39m[1m[2m  4.49 kB[22m[1m[22m[2m │ gzip:  1.11 kB[22m
[2mdist/[22m[36massets/js/DocumentsPage-Dubh9SA4.js           [39m[1m[2m  5.69 kB[22m[1m[22m[2m │ gzip:  1.50 kB[22m
[2mdist/[22m[36massets/js/UploadPage-CBf0-lck.js              [39m[1m[2m  5.76 kB[22m[1m[22m[2m │ gzip:  2.20 kB[22m
[2mdist/[22m[36massets/js/AuthRegisterPage-DCOP1H1V.js        [39m[1m[2m  6.47 kB[22m[1m[22m[2m │ gzip:  1.82 kB[22m
[2mdist/[22m[36massets/js/HomePage-Dyi8CH9O.js                [39m[1m[2m  7.16 kB[22m[1m[22m[2m │ gzip:  1.97 kB[22m
[2mdist/[22m[36massets/js/DocumentDetailPage-DkSmwRJ1.js      [39m[1m[2m  7.35 kB[22m[1m[22m[2m │ gzip:  2.11 kB[22m
[2mdist/[22m[36massets/js/SharePage-DFH05D4i.js               [39m[1m[2m  8.17 kB[22m[1m[22m[2m │ gzip:  2.63 kB[22m
[2mdist/[22m[36massets/js/DocumentSigningPage-BTvQ66CG.js     [39m[1m[2m  9.15 kB[22m[1m[22m[2m │ gzip:  2.62 kB[22m
[2mdist/[22m[36massets/js/PrescriptionCreatePage-Djcr-eBg.js  [39m[1m[2m 10.83 kB[22m[1m[22m[2m │ gzip:  3.22 kB[22m
[2mdist/[22m[36massets/js/MetricsPage-BIZYDllM.js             [39m[1m[2m 10.93 kB[22m[1m[22m[2m │ gzip:  2.80 kB[22m
[2mdist/[22m[36massets/js/PrescriptionViewPage-Dc1C7-vX.js    [39m[1m[2m 11.02 kB[22m[1m[22m[2m │ gzip:  3.03 kB[22m
[2mdist/[22m[36massets/js/PatientCreatePage-CRTZGQlF.js       [39m[1m[2m 11.07 kB[22m[1m[22m[2m │ gzip:  3.01 kB[22m
[2mdist/[22m[36massets/js/Test-Ctivf0gu.js                    [39m[1m[2m 11.21 kB[22m[1m[22m[2m │ gzip:  3.11 kB[22m
[2mdist/[22m[36massets/js/VerifyPage-DFVpqXUo.js              [39m[1m[2m 11.35 kB[22m[1m[22m[2m │ gzip:  2.82 kB[22m
[2mdist/[22m[36massets/js/CreateDocumentPage-DKbzgqh6.js      [39m[1m[2m 11.70 kB[22m[1m[22m[2m │ gzip:  3.30 kB[22m
[2mdist/[22m[36massets/js/TemplatesPage-CFpi-1QT.js           [39m[1m[2m 12.32 kB[22m[1m[22m[2m │ gzip:  3.12 kB[22m
[2mdist/[22m[36massets/js/PatientsPage-CnE2IbOJ.js            [39m[1m[2m 12.71 kB[22m[1m[22m[2m │ gzip:  3.64 kB[22m
[2mdist/[22m[36massets/js/PatientEditPage-CBfn0kA2.js         [39m[1m[2m 13.05 kB[22m[1m[22m[2m │ gzip:  3.44 kB[22m
[2mdist/[22m[36massets/js/PatientDetailPage-DvJMHYS4.js       [39m[1m[2m 13.74 kB[22m[1m[22m[2m │ gzip:  2.70 kB[22m
[2mdist/[22m[36massets/js/index-SNvvnAX0.js                   [39m[1m[2m 38.51 kB[22m[1m[22m[2m │ gzip: 11.62 kB[22m
[2mdist/[22m[36massets/js/validation-C2HDzc02.js              [39m[1m[2m107.46 kB[22m[1m[22m[2m │ gzip: 26.40 kB[22m
[2mdist/[22m[36massets/js/vendor-B8UdlW4a.js                  [39m[1m[2m124.69 kB[22m[1m[22m[2m │ gzip: 42.86 kB[22m
[2mdist/[22m[36massets/js/react-vendor-Buubnjuw.js            [39m[1m[2m196.00 kB[22m[1m[22m[2m │ gzip: 63.07 kB[22m
[32m✓ built in 2.38s[39m
```
