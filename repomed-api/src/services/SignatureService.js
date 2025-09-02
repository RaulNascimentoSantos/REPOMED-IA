const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

/**
 * Serviço de Assinatura Digital ICP-Brasil
 * Implementa validação de certificados A1/A3 e assinatura de documentos
 */
class SignatureService {
  constructor() {
    // Configurações de certificados ICP-Brasil
    this.icpConfig = {
      // URLs das Autoridades Certificadoras Brasileiras
      trustedCAs: [
        'AC_VALID_RFB_v5.crt',
        'AC_SERPRO_RFB_v1.crt', 
        'AC_CERTISIGN_RFB_v1.crt',
        'ICP_Brasil_v2.crt',
        'AC_PRODEMGE_RFB_v1.crt'
      ],
      // Política de assinatura para documentos médicos
      signaturePolicy: 'AD-RB',
      timestampUrl: 'http://ts.iti.br/ts',
    };

    // Cache de certificados validados
    this.validatedCertificates = new Map();
    
    // Configuração de assinatura
    this.signatureConfig = {
      algorithm: 'RS256',
      digestAlgorithm: 'sha256',
      encoding: 'base64'
    };
  }

  /**
   * Valida certificado ICP-Brasil A1/A3
   */
  async validateICPCertificate(certificateData) {
    try {
      // Parsear o certificado
      const cert = crypto.createPublicKey(certificateData);
      const certPem = cert.export({ format: 'pem', type: 'spki' });
      
      // Verificar estrutura do certificado
      const certInfo = this.parseCertificateInfo(certificateData);
      
      // Validações específicas ICP-Brasil
      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        certInfo: certInfo,
        icpCompliant: false,
        medicalValid: false
      };

      // 1. Verificar se é certificado ICP-Brasil
      if (!this.isICPBrasilCertificate(certInfo)) {
        validation.errors.push('Certificado não é ICP-Brasil válido');
        validation.isValid = false;
      } else {
        validation.icpCompliant = true;
      }

      // 2. Verificar validade temporal
      if (!this.isValidPeriod(certInfo.validFrom, certInfo.validTo)) {
        validation.errors.push('Certificado fora do período de validade');
        validation.isValid = false;
      }

      // 3. Verificar se é adequado para uso médico
      if (this.isMedicalCertificate(certInfo)) {
        validation.medicalValid = true;
      } else {
        validation.warnings.push('Certificado pode não ser adequado para documentos médicos');
      }

      // 4. Verificar lista de revogação (LCR)
      const revocationStatus = await this.checkRevocationStatus(certInfo.serialNumber);
      if (revocationStatus.revoked) {
        validation.errors.push('Certificado foi revogado');
        validation.isValid = false;
      }

      // Cache do resultado
      if (validation.isValid) {
        this.validatedCertificates.set(certInfo.serialNumber, {
          validation,
          validatedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000) // 1 hora
        });
      }

      return validation;
    } catch (error) {
      console.error('Erro na validação do certificado:', error);
      return {
        isValid: false,
        errors: ['Erro ao processar certificado: ' + error.message],
        warnings: [],
        certInfo: null,
        icpCompliant: false,
        medicalValid: false
      };
    }
  }

  /**
   * Assina documento médico com certificado ICP-Brasil
   */
  async signMedicalDocument(documentData, certificateData, privateKey, options = {}) {
    try {
      // Validar certificado primeiro
      const certValidation = await this.validateICPCertificate(certificateData);
      if (!certValidation.isValid) {
        throw new Error('Certificado inválido: ' + certValidation.errors.join(', '));
      }

      // Preparar dados para assinatura
      const signatureData = {
        documentId: options.documentId || uuidv4(),
        documentHash: this.calculateDocumentHash(documentData),
        timestamp: new Date().toISOString(),
        signerInfo: certValidation.certInfo,
        documentType: options.documentType || 'medical',
        metadata: {
          patientCpf: options.patientCpf,
          doctorCrm: options.doctorCrm,
          institutionCnpj: options.institutionCnpj,
          documentTemplate: options.template,
          ...options.metadata
        }
      };

      // Gerar assinatura digital
      const signature = await this.generateDigitalSignature(signatureData, privateKey);
      
      // Solicitar carimbo de tempo
      const timestamp = await this.requestTimestamp(signature);

      // Construir envelope de assinatura
      const signatureEnvelope = {
        version: '1.0',
        algorithm: this.signatureConfig.algorithm,
        signature: signature,
        timestamp: timestamp,
        certificate: this.encodeCertificate(certificateData),
        signatureData: signatureData,
        validationInfo: {
          icpCompliant: certValidation.icpCompliant,
          medicalValid: certValidation.medicalValid,
          signedAt: new Date().toISOString(),
          expiresAt: certValidation.certInfo.validTo
        }
      };

      // Log da assinatura para auditoria
      await this.logSignatureEvent(signatureEnvelope, 'document_signed');

      return {
        success: true,
        signatureId: signatureData.documentId,
        signature: signatureEnvelope,
        validUntil: certValidation.certInfo.validTo,
        hash: signatureData.documentHash
      };

    } catch (error) {
      console.error('Erro na assinatura do documento:', error);
      await this.logSignatureEvent({ error: error.message }, 'signature_failed');
      
      return {
        success: false,
        error: error.message,
        code: 'SIGNATURE_FAILED'
      };
    }
  }

  /**
   * Verifica assinatura digital de documento
   */
  async verifyDocumentSignature(documentData, signatureEnvelope) {
    try {
      const verification = {
        valid: false,
        errors: [],
        warnings: [],
        signerInfo: null,
        signedAt: null,
        expiresAt: null
      };

      // 1. Verificar integridade do envelope
      if (!this.validateSignatureEnvelope(signatureEnvelope)) {
        verification.errors.push('Envelope de assinatura inválido');
        return verification;
      }

      // 2. Verificar hash do documento
      const currentHash = this.calculateDocumentHash(documentData);
      if (currentHash !== signatureEnvelope.signatureData.documentHash) {
        verification.errors.push('Documento foi alterado após a assinatura');
        return verification;
      }

      // 3. Validar certificado
      const certificate = this.decodeCertificate(signatureEnvelope.certificate);
      const certValidation = await this.validateICPCertificate(certificate);
      
      if (!certValidation.isValid) {
        verification.errors.push(...certValidation.errors);
        return verification;
      }

      // 4. Verificar assinatura digital
      const signatureValid = await this.verifyDigitalSignature(
        signatureEnvelope.signatureData,
        signatureEnvelope.signature,
        certificate
      );

      if (!signatureValid) {
        verification.errors.push('Assinatura digital inválida');
        return verification;
      }

      // 5. Verificar carimbo de tempo
      const timestampValid = await this.verifyTimestamp(signatureEnvelope.timestamp);
      if (!timestampValid) {
        verification.warnings.push('Carimbo de tempo não pode ser verificado');
      }

      // 6. Verificar período de validade
      const now = new Date();
      const signedAt = new Date(signatureEnvelope.validationInfo.signedAt);
      const expiresAt = new Date(signatureEnvelope.validationInfo.expiresAt);

      if (now > expiresAt) {
        verification.warnings.push('Certificado expirado');
      }

      // Se chegou até aqui, assinatura é válida
      verification.valid = true;
      verification.signerInfo = certValidation.certInfo;
      verification.signedAt = signedAt;
      verification.expiresAt = expiresAt;

      // Log da verificação
      await this.logSignatureEvent({
        documentHash: currentHash,
        verificationResult: verification
      }, 'signature_verified');

      return verification;

    } catch (error) {
      console.error('Erro na verificação da assinatura:', error);
      return {
        valid: false,
        errors: ['Erro na verificação: ' + error.message],
        warnings: [],
        signerInfo: null,
        signedAt: null,
        expiresAt: null
      };
    }
  }

  /**
   * Gera QR Code para verificação da assinatura
   */
  async generateVerificationQRCode(signatureId, documentHash) {
    try {
      const verificationUrl = `${process.env.APP_URL}/verify/${signatureId}`;
      const qrData = {
        url: verificationUrl,
        hash: documentHash,
        timestamp: new Date().toISOString()
      };

      // Em produção, usar biblioteca de QR Code real
      const qrCodeData = Buffer.from(JSON.stringify(qrData)).toString('base64');
      
      return {
        qrCode: qrCodeData,
        verificationUrl: verificationUrl,
        hash: documentHash
      };
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return null;
    }
  }

  // Métodos auxiliares privados

  parseCertificateInfo(certificateData) {
    // Simular parsing de certificado X.509
    return {
      subject: 'CN=João Silva:12345678901, OU=CRM-SP, O=Conselho Regional de Medicina',
      issuer: 'CN=AC VALID RFB v5, OU=Secretaria da Receita Federal do Brasil - RFB',
      serialNumber: '1234567890ABCDEF',
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2027-01-01'),
      keyUsage: ['digitalSignature', 'nonRepudiation'],
      extendedKeyUsage: ['clientAuth', 'codeSigning']
    };
  }

  isICPBrasilCertificate(certInfo) {
    return certInfo.issuer.includes('RFB') || 
           certInfo.issuer.includes('ICP-Brasil') ||
           certInfo.issuer.includes('ITI');
  }

  isValidPeriod(validFrom, validTo) {
    const now = new Date();
    return now >= validFrom && now <= validTo;
  }

  isMedicalCertificate(certInfo) {
    return certInfo.subject.includes('CRM') ||
           certInfo.subject.includes('CFM') ||
           certInfo.extendedKeyUsage.includes('codeSigning');
  }

  async checkRevocationStatus(serialNumber) {
    // Simular consulta à Lista de Certificados Revogados
    return { revoked: false, reason: null };
  }

  calculateDocumentHash(documentData) {
    return crypto.createHash('sha256')
      .update(JSON.stringify(documentData))
      .digest('hex');
  }

  async generateDigitalSignature(data, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(data));
    sign.end();
    
    // Simular assinatura com chave privada
    return sign.sign(privateKey || 'mock-private-key', 'base64');
  }

  async requestTimestamp(signature) {
    // Simular requisição de carimbo de tempo
    return {
      timestamp: new Date().toISOString(),
      tsa: 'TSA ITI',
      hash: crypto.createHash('sha256').update(signature).digest('hex')
    };
  }

  encodeCertificate(certificateData) {
    return Buffer.from(certificateData).toString('base64');
  }

  decodeCertificate(encodedCert) {
    return Buffer.from(encodedCert, 'base64').toString();
  }

  validateSignatureEnvelope(envelope) {
    return envelope && 
           envelope.signature && 
           envelope.certificate && 
           envelope.signatureData &&
           envelope.validationInfo;
  }

  async verifyDigitalSignature(data, signature, certificate) {
    // Simular verificação da assinatura digital
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(JSON.stringify(data));
      verify.end();
      
      // Em produção, usar a chave pública do certificado
      return verify.verify(certificate || 'mock-public-key', signature, 'base64');
    } catch (error) {
      return false;
    }
  }

  async verifyTimestamp(timestamp) {
    // Simular verificação do carimbo de tempo
    return timestamp && timestamp.timestamp && timestamp.tsa;
  }

  async logSignatureEvent(data, eventType) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: eventType,
      data: data
    };
    
    // Em produção, salvar no banco de dados para auditoria
    console.log('Signature Event:', logEntry);
  }
}

module.exports = new SignatureService();