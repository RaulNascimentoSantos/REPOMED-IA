// CORREÇÃO CRÍTICA 2: CSP PRODUCTION-READY COM NONCE POR REQUEST
// Data: 31/08/2025 - Prioridade: P0

import helmet from '@fastify/helmet'
import crypto from 'crypto'

export async function securityPlugin(fastify) {
  // Gerar nonce único por request
  fastify.decorateRequest('cspNonce', null)
  
  fastify.addHook('onRequest', async (req, reply) => {
    // Nonce para scripts inline (se necessário)
    const nonce = crypto.randomBytes(16).toString('base64')
    req.cspNonce = nonce
    reply.header('X-CSP-Nonce', nonce) // Para debug
  })
  
  // Headers de segurança medical-grade
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: (req) => {
          const sources = ["'self'"]
          
          // Em dev, permitir unsafe-inline
          if (process.env.NODE_ENV === 'development') {
            sources.push("'unsafe-inline'")
          } else {
            // Em prod, usar nonce
            const nonce = req.cspNonce
            if (nonce) {
              sources.push(`'nonce-${nonce}'`)
            }
          }
          
          return sources
        },
        styleSrc: () => {
          // CSS pode usar unsafe-inline se não tiver JS inline
          const sources = ["'self'"]
          
          if (process.env.NODE_ENV === 'production') {
            // Em prod, preferir classes CSS
            sources.push("'unsafe-inline'") // Apenas para CSS
          } else {
            sources.push("'unsafe-inline'")
          }
          
          return sources
        },
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          process.env.API_URL || "'self'",
          "https://api.repomed.health",
          "wss://api.repomed.health"
        ],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined,
        blockAllMixedContent: process.env.NODE_ENV === 'production' ? [] : undefined
      },
      reportOnly: false // Mudar para true inicialmente em prod
    },
    crossOriginEmbedderPolicy: {
      policy: process.env.ENABLE_COEP === 'false' ? 'unsafe-none' : 'require-corp'
    },
    crossOriginOpenerPolicy: {
      policy: 'same-origin'
    },
    crossOriginResourcePolicy: {
      policy: 'same-origin'
    },
    originAgentCluster: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xFrameOptions: { action: 'deny' },
    xPermittedCrossDomainPolicies: false,
    xPoweredBy: false,
    xXssProtection: false // Deprecated, CSP é melhor
  })
  
  // Headers adicionais para PHI
  fastify.addHook('onSend', async (req, reply, payload) => {
    // Rotas com dados sensíveis
    const sensitiveRoutes = [
      '/api/clinical',
      '/api/patients',
      '/api/documents',
      '/api/prescriptions'
    ]
    
    if (sensitiveRoutes.some(route => req.url.startsWith(route))) {
      reply.headers({
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      })
    }
    
    // Permissions Policy restritiva
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
      'magnetometer=(), gyroscope=(), accelerometer=(), midi=(), ' +
      'encrypted-media=(), autoplay=(), picture-in-picture=(), ' +
      'screen-wake-lock=(), xr-spatial-tracking=()'
    )
    
    return payload
  })
}

// Para Next.js/React com SSR
export function generateCSPMeta(nonce) {
  const isDev = process.env.NODE_ENV === 'development'
  
  return `
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; 
                   script-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}; 
                   style-src 'self' 'unsafe-inline'; 
                   img-src 'self' data: blob: https:; 
                   connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};">
  `
}

export default securityPlugin