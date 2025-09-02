import { createTRPCRouter } from '@/lib/trpc/server'
import { templatesRouter } from './routers/templates'
import { documentsRouter } from './routers/documents'

export const appRouter = createTRPCRouter({
  templates: templatesRouter,
  documents: documentsRouter,
})

export type AppRouter = typeof appRouter