// CORREÇÃO CRÍTICA 5: WEBHOOKS IDEMPOTENTES COM ANTI-REPLAY
// Data: 31/08/2025 - Prioridade: P0

import crypto from 'crypto'

export class WebhookSecurity {
  constructor() {
    // Mock Redis para desenvolvimento - usar Redis real em produção
    this.cache = new Map()
    
    // Limpar cache antigo a cada 24h
    setInterval(() => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000
      for (const [key, data] of this.cache.entries()) {
        if (data.timestamp < dayAgo) {
          this.cache.delete(key)
        }
      }
    }, 60 * 60 * 1000) // Check every hour
  }
  
  generateSignature(payload, secret) {
    const timestamp = Date.now()
    const message = `${timestamp}.${JSON.stringify(payload)}`
    const signature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex')
    
    return `t=${timestamp},v1=${signature}`
  }
  
  async verifyWebhook(payload, signature, secret) {
    try {
      // Parse signature header
      const elements = signature.split(',')
      const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1]
      const sig = elements.find(e => e.startsWith('v1='))?.split('=')[1]
      
      if (!timestamp || !sig) {
        return { valid: false, reason: 'Invalid signature format' }
      }
      
      // Verificar timestamp (máx 5 minutos)
      const age = Date.now() - parseInt(timestamp)
      if (age > 5 * 60 * 1000) {
        return { valid: false, reason: 'Timestamp too old' }
      }
      
      if (age < -30000) { // 30 segundos no futuro
        return { valid: false, reason: 'Timestamp in future' }
      }
      
      // Verificar assinatura
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex')
      
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        return { valid: false, reason: 'Invalid signature' }
      }
      
      // Verificar idempotência (prevenir replay)
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`${timestamp}.${sig}`)
        .digest('hex')
      
      const exists = this.cache.get(`webhook:${idempotencyKey}`)
      if (exists) {
        return { valid: false, reason: 'Duplicate webhook (replay attack?)' }
      }
      
      // Marcar como processado
      this.cache.set(`webhook:${idempotencyKey}`, {
        processedAt: Date.now(),
        signature: sig.substring(0, 8) + '...',
        timestamp: parseInt(timestamp)
      })
      
      return { valid: true }
      
    } catch (error) {
      console.error('Webhook verification error:', error)
      return { valid: false, reason: 'Verification failed' }
    }
  }
  
  async logWebhookAttempt(request, result) {
    const logData = {
      timestamp: new Date().toISOString(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      path: request.url,
      valid: result.valid,
      reason: result.reason,
      headers: {
        'x-webhook-signature': request.headers['x-webhook-signature'] ? 'present' : 'missing',
        'x-idempotency-key': request.headers['x-idempotency-key'] ? 'present' : 'missing',
        'content-type': request.headers['content-type']
      }
    }
    
    if (result.valid) {
      console.log('✅ Valid webhook received:', logData)
    } else {
      console.warn('⚠️ Invalid webhook attempt:', logData)
    }
  }
}

// Middleware para webhooks
export async function webhookMiddleware(request, reply) {
  const signature = request.headers['x-webhook-signature']
  const idempotencyKey = request.headers['x-idempotency-key']
  
  if (!signature) {
    return reply.status(401).send({ 
      error: 'Missing signature',
      code: 'MISSING_SIGNATURE'
    })
  }
  
  const security = new WebhookSecurity()
  const verification = await security.verifyWebhook(
    JSON.stringify(request.body),
    signature,
    process.env.WEBHOOK_SECRET || 'dev-secret-key'
  )
  
  // Log da tentativa
  await security.logWebhookAttempt(request, verification)
  
  if (!verification.valid) {
    return reply.status(401).send({ 
      error: 'Invalid webhook',
      reason: verification.reason,
      code: 'WEBHOOK_VERIFICATION_FAILED'
    })
  }
  
  // Adicionar ao contexto
  request.webhookVerified = true
  request.idempotencyKey = idempotencyKey
  request.webhookTimestamp = new Date().toISOString()
}

// Rate limiting específico para webhooks
export function webhookRateLimit() {
  const attempts = new Map()
  
  return async (request, reply) => {
    const ip = request.ip
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minuto
    const maxAttempts = 10 // Máx 10 tentativas por minuto
    
    // Limpar tentativas antigas
    const windowStart = now - windowMs
    if (attempts.has(ip)) {
      const ipAttempts = attempts.get(ip).filter(time => time > windowStart)
      attempts.set(ip, ipAttempts)
    }
    
    const ipAttempts = attempts.get(ip) || []
    
    if (ipAttempts.length >= maxAttempts) {
      return reply.status(429).send({
        error: 'Too many webhook attempts',
        retryAfter: Math.ceil(windowMs / 1000),
        code: 'WEBHOOK_RATE_LIMITED'
      })
    }
    
    // Registrar tentativa
    ipAttempts.push(now)
    attempts.set(ip, ipAttempts)
  }
}