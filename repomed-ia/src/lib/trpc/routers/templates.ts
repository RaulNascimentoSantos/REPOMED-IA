import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server'
import { templates } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const templatesRouter = createTRPCRouter({
  // Listar todos os templates ativos
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(templates).where(eq(templates.isActive, true))
  }),

  // Buscar template por ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.select().from(templates).where(eq(templates.id, input))
      return result[0] || null
    }),

  // Criar novo template
  create: publicProcedure
    .input(z.object({
      name: z.string().min(3).max(255),
      specialty: z.string().min(2).max(100),
      description: z.string().optional(),
      contentJson: z.any(),
      fieldsSchema: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(templates).values({
        ...input,
        updatedAt: new Date(),
      }).returning()
      
      return result[0]
    }),

  // Atualizar template
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255).optional(),
      specialty: z.string().min(2).max(100).optional(),
      description: z.string().optional(),
      contentJson: z.any().optional(),
      fieldsSchema: z.any().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      const result = await ctx.db.update(templates)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(templates.id, id))
        .returning()
      
      return result[0]
    }),

  // Soft delete template
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.update(templates)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(templates.id, input))
        .returning()
      
      return result[0]
    }),
})