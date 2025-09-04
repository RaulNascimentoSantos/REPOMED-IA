import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'repomed-dev-secret-key';

// Mock signature store (in production use database)
const signatures = new Map();
const signatureRequests = new Map();

export function registerSignatureRoutes(fastify) {

  // Criar solicitação de assinatura
  fastify.post('/api/signatures/request', {
    schema: {
      tags: ['Signatures'],
      description: 'Criar solicitação de assinatura digital',
      body: {
        type: 'object',
        properties: {
          documentId: { type: 'string' },
          signerName: { type: 'string' },
          signerCrm: { type: 'string' },
          signerEmail: { type: 'string', format: 'email' },
          documentHash: { type: 'string' },
          expiresInHours: { type: 'number', minimum: 1, maximum: 168, default: 24 }
        },
        required: ['documentId', 'signerName', 'signerCrm', 'signerEmail', 'documentHash']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                requestId: { type: 'string' },
                documentId: { type: 'string' },
                signerName: { type: 'string' },
                signerCrm: { type: 'string' },
                status: { type: 'string' },
                expiresAt: { type: 'string' },
                signUrl: { type: 'string' },
                verificationToken: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { documentId, signerName, signerCrm, signerEmail, documentHash, expiresInHours = 24 } = request.body;

    // Gerar ID da solicitação
    const requestId = crypto.randomUUID();
    
    // Calcular expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Gerar token de verificação
    const verificationToken = jwt.sign(
      {
        requestId,
        documentId,
        signerCrm,
        documentHash,
        type: 'signature_request'
      },
      JWT_SECRET,
      { expiresIn: `${expiresInHours}h` }
    );

    // Criar solicitação de assinatura
    const signatureRequest = {
      requestId,
      documentId,
      signerName,
      signerCrm,
      signerEmail,
      documentHash,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      verificationToken,
      signUrl: `http://localhost:3000/sign/${requestId}`,
      attempts: 0,
      maxAttempts: 3
    };

    signatureRequests.set(requestId, signatureRequest);

    reply.code(201);
    return {
      success: true,
      data: {
        requestId,
        documentId,
        signerName,
        signerCrm,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        signUrl: `http://localhost:3000/sign/${requestId}`,
        verificationToken
      }
    };
  });

  // Obter detalhes da solicitação de assinatura
  fastify.get('/api/signatures/requests/:requestId', {
    schema: {
      tags: ['Signatures'],
      description: 'Obter detalhes de uma solicitação de assinatura',
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { requestId } = request.params;
    
    const signatureRequest = signatureRequests.get(requestId);
    
    if (!signatureRequest) {
      reply.code(404);
      return {
        success: false,
        error: 'Solicitação de assinatura não encontrada'
      };
    }

    // Verificar se expirou
    const now = new Date();
    const expiresAt = new Date(signatureRequest.expiresAt);
    
    if (now > expiresAt && signatureRequest.status === 'pending') {
      signatureRequest.status = 'expired';
      signatureRequests.set(requestId, signatureRequest);
    }

    return {
      success: true,
      data: {
        ...signatureRequest,
        verificationToken: undefined // Não expor o token na resposta
      }
    };
  });

  // Assinar documento
  fastify.post('/api/signatures/:requestId/sign', {
    schema: {
      tags: ['Signatures'],
      description: 'Assinar documento digitalmente',
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      },
      body: {
        type: 'object',
        properties: {
          verificationToken: { type: 'string' },
          signerPassword: { type: 'string', minLength: 6 },
          signatureMethod: { type: 'string', enum: ['password', 'certificate'], default: 'password' },
          clientInfo: {
            type: 'object',
            properties: {
              userAgent: { type: 'string' },
              ipAddress: { type: 'string' },
              timestamp: { type: 'string' }
            }
          }
        },
        required: ['verificationToken', 'signerPassword']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                signatureId: { type: 'string' },
                documentId: { type: 'string' },
                status: { type: 'string' },
                signedAt: { type: 'string' },
                signerName: { type: 'string' },
                signerCrm: { type: 'string' },
                signatureHash: { type: 'string' },
                certificateInfo: { type: 'object' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { requestId } = request.params;
    const { verificationToken, signerPassword, signatureMethod = 'password', clientInfo } = request.body;

    // Verificar se solicitação existe
    const signatureRequest = signatureRequests.get(requestId);
    
    if (!signatureRequest) {
      reply.code(404);
      return {
        success: false,
        error: 'Solicitação de assinatura não encontrada'
      };
    }

    // Verificar se ainda está válida
    const now = new Date();
    const expiresAt = new Date(signatureRequest.expiresAt);
    
    if (now > expiresAt) {
      signatureRequest.status = 'expired';
      signatureRequests.set(requestId, signatureRequest);
      
      reply.code(400);
      return {
        success: false,
        error: 'Solicitação de assinatura expirada'
      };
    }

    if (signatureRequest.status !== 'pending') {
      reply.code(400);
      return {
        success: false,
        error: 'Esta solicitação já foi processada'
      };
    }

    // Verificar tentativas
    if (signatureRequest.attempts >= signatureRequest.maxAttempts) {
      signatureRequest.status = 'blocked';
      signatureRequests.set(requestId, signatureRequest);
      
      reply.code(400);
      return {
        success: false,
        error: 'Número máximo de tentativas excedido'
      };
    }

    try {
      // Verificar token
      const decoded = jwt.verify(verificationToken, JWT_SECRET);
      
      if (decoded.requestId !== requestId) {
        throw new Error('Token inválido para esta solicitação');
      }

      // Simular validação de senha (em produção integrar com sistema de autenticação)
      if (signerPassword.length < 6) {
        signatureRequest.attempts += 1;
        signatureRequests.set(requestId, signatureRequest);
        
        reply.code(400);
        return {
          success: false,
          error: 'Senha muito simples. Mínimo 6 caracteres.'
        };
      }

      // Gerar assinatura digital
      const signatureId = crypto.randomUUID();
      const signedAt = new Date().toISOString();
      
      // Criar hash da assinatura
      const signatureData = {
        documentId: signatureRequest.documentId,
        documentHash: signatureRequest.documentHash,
        signerCrm: signatureRequest.signerCrm,
        signerName: signatureRequest.signerName,
        signedAt,
        signatureMethod
      };
      
      const signatureHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(signatureData))
        .digest('hex');

      // Informações do certificado (simulado)
      const certificateInfo = {
        issuer: 'RepoMed IA Certificate Authority',
        subject: `CN=${signatureRequest.signerName}, CRM=${signatureRequest.signerCrm}`,
        serialNumber: crypto.randomBytes(8).toString('hex'),
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
        algorithm: 'SHA-256 with RSA',
        keySize: 2048,
        fingerprint: crypto.randomBytes(16).toString('hex')
      };

      // Criar assinatura
      const signature = {
        signatureId,
        requestId,
        documentId: signatureRequest.documentId,
        signerName: signatureRequest.signerName,
        signerCrm: signatureRequest.signerCrm,
        signerEmail: signatureRequest.signerEmail,
        signedAt,
        signatureHash,
        signatureMethod,
        certificateInfo,
        clientInfo: {
          userAgent: clientInfo?.userAgent || 'Unknown',
          ipAddress: clientInfo?.ipAddress || request.ip,
          timestamp: clientInfo?.timestamp || signedAt
        },
        status: 'valid'
      };

      // Salvar assinatura
      signatures.set(signatureId, signature);

      // Atualizar solicitação
      signatureRequest.status = 'signed';
      signatureRequest.signatureId = signatureId;
      signatureRequest.signedAt = signedAt;
      signatureRequests.set(requestId, signatureRequest);

      return {
        success: true,
        data: {
          signatureId,
          documentId: signatureRequest.documentId,
          status: 'signed',
          signedAt,
          signerName: signatureRequest.signerName,
          signerCrm: signatureRequest.signerCrm,
          signatureHash,
          certificateInfo
        }
      };

    } catch (error) {
      signatureRequest.attempts += 1;
      signatureRequests.set(requestId, signatureRequest);
      
      reply.code(400);
      return {
        success: false,
        error: 'Token inválido ou erro na verificação'
      };
    }
  });

  // Verificar assinatura
  fastify.get('/api/signatures/:signatureId/verify', {
    schema: {
      tags: ['Signatures'],
      description: 'Verificar autenticidade de uma assinatura digital',
      params: {
        type: 'object',
        properties: {
          signatureId: { type: 'string' }
        },
        required: ['signatureId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                valid: { type: 'boolean' },
                signatureId: { type: 'string' },
                documentId: { type: 'string' },
                signerName: { type: 'string' },
                signerCrm: { type: 'string' },
                signedAt: { type: 'string' },
                status: { type: 'string' },
                certificateInfo: { type: 'object' },
                verificationDetails: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { signatureId } = request.params;
    
    const signature = signatures.get(signatureId);
    
    if (!signature) {
      return {
        success: true,
        data: {
          valid: false,
          error: 'Assinatura não encontrada',
          verificationDetails: {
            checkedAt: new Date().toISOString(),
            status: 'not_found'
          }
        }
      };
    }

    // Verificar se certificado ainda é válido
    const now = new Date();
    const validTo = new Date(signature.certificateInfo.validTo);
    const isExpired = now > validTo;

    // Verificar integridade do hash
    const signatureData = {
      documentId: signature.documentId,
      documentHash: signature.documentHash,
      signerCrm: signature.signerCrm,
      signerName: signature.signerName,
      signedAt: signature.signedAt,
      signatureMethod: signature.signatureMethod
    };
    
    const calculatedHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(signatureData))
      .digest('hex');

    const hashValid = calculatedHash === signature.signatureHash;
    const valid = !isExpired && hashValid && signature.status === 'valid';

    return {
      success: true,
      data: {
        valid,
        signatureId,
        documentId: signature.documentId,
        signerName: signature.signerName,
        signerCrm: signature.signerCrm,
        signedAt: signature.signedAt,
        status: signature.status,
        certificateInfo: signature.certificateInfo,
        verificationDetails: {
          checkedAt: new Date().toISOString(),
          hashValid,
          certificateExpired: isExpired,
          status: valid ? 'valid' : (isExpired ? 'expired' : 'invalid')
        }
      }
    };
  });

  // Listar assinaturas de um documento
  fastify.get('/api/documents/:documentId/signatures', {
    schema: {
      tags: ['Signatures'],
      description: 'Listar todas as assinaturas de um documento',
      params: {
        type: 'object',
        properties: {
          documentId: { type: 'string' }
        },
        required: ['documentId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { documentId } = request.params;
    
    const documentSignatures = Array.from(signatures.values())
      .filter(sig => sig.documentId === documentId)
      .sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt));

    return {
      success: true,
      data: documentSignatures.map(sig => ({
        signatureId: sig.signatureId,
        signerName: sig.signerName,
        signerCrm: sig.signerCrm,
        signedAt: sig.signedAt,
        status: sig.status,
        certificateInfo: {
          issuer: sig.certificateInfo.issuer,
          subject: sig.certificateInfo.subject,
          validTo: sig.certificateInfo.validTo
        }
      }))
    };
  });

  // Revogar assinatura
  fastify.post('/api/signatures/:signatureId/revoke', {
    schema: {
      tags: ['Signatures'],
      description: 'Revogar uma assinatura digital',
      params: {
        type: 'object',
        properties: {
          signatureId: { type: 'string' }
        },
        required: ['signatureId']
      },
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', enum: ['compromise', 'superseded', 'cessation', 'unspecified'] },
          revokedBy: { type: 'string' },
          revocationNote: { type: 'string' }
        },
        required: ['reason', 'revokedBy']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { signatureId } = request.params;
    const { reason, revokedBy, revocationNote } = request.body;
    
    const signature = signatures.get(signatureId);
    
    if (!signature) {
      reply.code(404);
      return {
        success: false,
        error: 'Assinatura não encontrada'
      };
    }

    // Atualizar assinatura
    signature.status = 'revoked';
    signature.revocation = {
      reason,
      revokedBy,
      revokedAt: new Date().toISOString(),
      note: revocationNote
    };

    signatures.set(signatureId, signature);

    return {
      success: true,
      message: 'Assinatura revogada com sucesso'
    };
  });
}