import { WebhookSecurity } from './webhook-security.js'

export async function webhookController(fastify) {
  const security = new WebhookSecurity()
  
  // Webhook endpoint com raw body
  fastify.post(
    '/api/webhooks/clinical',
    {
      config: {
        rawBody: true // CRÍTICO: Habilitar raw body
      },
      schema: {
        headers: {
          type: 'object',
          properties: {
            'x-webhook-signature': { type: 'string' },
            'x-webhook-timestamp': { type: 'string' },
            'x-idempotency-key': { type: 'string' }
          },
          required: ['x-webhook-signature']
        }
      }
    },
    async (request, reply) => {
      // Usar raw body para verificação HMAC
      const rawPayload = request.rawBody
      
      if (!rawPayload) {
        return reply.code(400).send({
          error: 'Raw body required for webhook verification'
        })
      }
      
      const signature = request.headers['x-webhook-signature']
      const idempotencyKey = request.headers['x-idempotency-key']
      
      // Verificar assinatura HMAC com raw body
      const verification = await security.verifyWebhook(
        rawPayload, // USAR RAW, NÃO PARSED
        signature,
        process.env.WEBHOOK_SECRET || 'default-webhook-secret'
      )
      
      if (!verification.valid) {
        request.log.warn({
          event: 'webhook_verification_failed',
          reason: verification.reason,
          signature: signature?.substring(0, 10) + '...',
          ip: request.ip
        })
        
        return reply.code(401).send({
          error: 'Invalid webhook signature',
          reason: verification.reason
        })
      }
      
      // Verificar idempotência (simplificado sem Redis)
      if (idempotencyKey) {
        // TODO: Implementar cache Redis para idempotência
        request.log.info({ idempotencyKey }, 'Processing webhook with idempotency key')
      }
      
      // Processar webhook (agora pode usar o body parsed)
      const body = request.body
      
      // Log audit
      request.log.info({
        action: 'webhook_received',
        type: body.type,
        tenantId: body.tenantId,
        metadata: {
          idempotencyKey,
          verified: true
        }
      })
      
      // Processar por tipo
      switch (body.type) {
        case 'document.signed':
          // await handleDocumentSigned(body)
          break
        case 'prescription.validated':
          // await handlePrescriptionValidated(body)
          break
        default:
          request.log.info({ type: body.type }, 'Unknown webhook type')
      }
      
      return reply.code(200).send({ 
        success: true,
        processedAt: new Date().toISOString()
      })
    }
  )
}