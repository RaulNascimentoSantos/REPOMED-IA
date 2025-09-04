import { FastifySchemaValidationError } from 'fastify/types/schema'
import { ZodSchema, ZodError } from 'zod'

// 🔍 Middleware para integração Fastify + Zod

/**
 * Compilador de validação Zod para Fastify
 * Substitui o validador padrão do Fastify pelo Zod
 */
export function zodValidatorCompiler({ schema }: { schema: ZodSchema }) {
  return function validate(data: unknown) {
    try {
      return { value: schema.parse(data) }
    } catch (error) {
      if (error instanceof ZodError) {
        // Converter ZodError para formato esperado pelo Fastify
        const validationError = {
          validation: error.issues.map(issue => ({
            instancePath: `/${issue.path.join('/')}`,
            schemaPath: `#/${issue.path.join('/')}`,
            keyword: issue.code,
            params: issue,
            message: issue.message
          })),
          validationContext: 'body'
        }
        return { error: validationError }
      }
      
      // Re-lançar outros erros
      throw error
    }
  }
}

/**
 * Serializer para respostas usando Zod
 * Garante que as respostas estejam no formato correto
 */
export function zodSerializerCompiler({ schema }: { schema: ZodSchema }) {
  return function serialize(data: unknown): string {
    try {
      const validated = schema.parse(data)
      return JSON.stringify(validated)
    } catch (error) {
      if (error instanceof ZodError) {
        // Log do erro de serialização
        console.error('Response serialization error:', {
          error: error.issues,
          data
        })
        
        // Em desenvolvimento, mostrar o erro
        if (process.env.NODE_ENV === 'development') {
          throw new Error(`Response serialization failed: ${error.message}`)
        }
        
        // Em produção, retornar erro genérico
        return JSON.stringify({
          success: false,
          error: {
            type: '/errors/internal-server-error',
            title: 'Internal Server Error',
            status: 500,
            detail: 'Response serialization failed',
            traceId: `serialize-${Date.now()}`
          }
        })
      }
      
      throw error
    }
  }
}

/**
 * Middleware para validação manual usando Zod
 * Útil quando não queremos usar o sistema de schema do Fastify
 */
export function validateSchema<T>(schema: ZodSchema<T>) {
  return async function validationMiddleware(data: unknown): Promise<T> {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof ZodError) {
        // O error handler pegará este erro e o formatará adequadamente
        throw error
      }
      throw error
    }
  }
}

/**
 * Utilitário para criar schemas Fastify a partir de schemas Zod
 */
export function createFastifySchema(schemas: {
  body?: ZodSchema
  querystring?: ZodSchema
  params?: ZodSchema
  headers?: ZodSchema
  response?: Record<number, ZodSchema>
}) {
  const fastifySchema: any = {}
  
  // Schemas de entrada
  if (schemas.body) {
    fastifySchema.body = schemas.body
  }
  
  if (schemas.querystring) {
    fastifySchema.querystring = schemas.querystring
  }
  
  if (schemas.params) {
    fastifySchema.params = schemas.params
  }
  
  if (schemas.headers) {
    fastifySchema.headers = schemas.headers
  }
  
  // Schemas de resposta
  if (schemas.response) {
    fastifySchema.response = schemas.response
  }
  
  return fastifySchema
}

/**
 * Configurar validação Zod no Fastify
 */
export function setupZodValidation(fastify: any) {
  // Definir compilador de validação
  fastify.setValidatorCompiler(zodValidatorCompiler)
  
  // Definir compilador de serialização (opcional)
  fastify.setSerializerCompiler(zodSerializerCompiler)
  
  // Hook para processar erros de validação
  fastify.setErrorHandler(async (error: any, request: any, reply: any) => {
    // Se for um erro de validação Zod, deixar o error handler principal processar
    if (error instanceof ZodError) {
      throw error
    }
    
    // Se for erro de validação do Fastify, converter para ZodError
    if (error.validation) {
      const zodError = new ZodError(
        error.validation.map((v: any) => ({
          code: 'custom',
          path: v.instancePath.split('/').filter((p: string) => p),
          message: v.message
        }))
      )
      throw zodError
    }
    
    // Outros erros passam para o próximo handler
    throw error
  })
}

/**
 * Decorator para routes que facilita o uso de validação Zod
 */
export function zodRoute<TBody = unknown, TQuery = unknown, TParams = unknown>(
  schemas: {
    body?: ZodSchema<TBody>
    query?: ZodSchema<TQuery>
    params?: ZodSchema<TParams>
  },
  handler: (request: {
    body: TBody
    query: TQuery
    params: TParams
  }) => Promise<any>
) {
  return {
    schema: createFastifySchema({
      body: schemas.body,
      querystring: schemas.query,
      params: schemas.params
    }),
    handler: async (request: any, reply: any) => {
      // O Fastify já validou os dados usando nosso compilador Zod
      // Então podemos ter certeza de que estão no formato correto
      return handler({
        body: request.body,
        query: request.query,
        params: request.params
      })
    }
  }
}

/**
 * Utilitário para validação manual de dados
 */
export async function validateData<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context: string = 'validation'
): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof ZodError) {
      // Adicionar contexto ao erro
      const errorWithContext = new ZodError(
        error.issues.map(issue => ({
          ...issue,
          path: [context, ...issue.path]
        }))
      )
      throw errorWithContext
    }
    throw error
  }
}