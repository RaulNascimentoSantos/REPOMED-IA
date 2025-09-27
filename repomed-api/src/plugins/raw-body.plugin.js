// CORREÇÃO CRÍTICA 3: RAW BODY PLUGIN PARA WEBHOOKS
// Data: 31/08/2025 - Prioridade: P0

export default async function (fastify) {
  // Plugin customizado para raw body nas rotas de webhook
  fastify.addContentTypeParser('application/json', 
    { 
      parseAs: 'buffer',
      bodyLimit: 1048576 // 1MB limit for webhooks 
    }, 
    function (request, payload, done) {
      // Salvar raw body para verificação HMAC
      request.rawBody = payload
      
      // Também fazer parse do JSON para uso posterior
      try {
        const jsonPayload = JSON.parse(payload.toString())
        done(null, jsonPayload)
      } catch (err) {
        done(err, {})
      }
    }
  )
  
  // Adicionar suporte para outros content types comuns em webhooks
  fastify.addContentTypeParser('text/plain',
    { parseAs: 'buffer' },
    function (request, payload, done) {
      request.rawBody = payload
      done(null, payload.toString())
    }
  )
}