import * as forge from 'node-forge';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

export interface DigitalSignatureResult {
  signature: string;
  hash: string;
  timestamp: Date;
  certificate: string;
  qrCode: string;
  verificationUrl: string;
}

export interface SignatureValidation {
  isValid: boolean;
  certificateValid: boolean;
  timestampValid: boolean;
  hashMatch: boolean;
  signerInfo?: {
    commonName: string;
    organization: string;
    country: string;
    email: string;
  };
  validationErrors: string[];
}

export class DigitalSignatureService {
  private static instance: DigitalSignatureService;
  private keyPair!: forge.pki.KeyPair;
  private certificate!: forge.pki.Certificate;

  private constructor() {
    this.initializeCertificate();
  }

  static getInstance(): DigitalSignatureService {
    if (!DigitalSignatureService.instance) {
      DigitalSignatureService.instance = new DigitalSignatureService();
    }
    return DigitalSignatureService.instance;
  }

  private initializeCertificate() {
    // Generate RSA key pair (2048-bit)
    this.keyPair = forge.pki.rsa.generateKeyPair(2048);
    
    // Create certificate
    this.certificate = forge.pki.createCertificate();
    this.certificate.publicKey = this.keyPair.publicKey;
    this.certificate.serialNumber = '01';
    this.certificate.validity.notBefore = new Date();
    this.certificate.validity.notAfter = new Date();
    this.certificate.validity.notAfter.setFullYear(this.certificate.validity.notBefore.getFullYear() + 5);

    const attrs = [{
      name: 'commonName',
      value: 'RepoMed IA Digital Certificate'
    }, {
      name: 'countryName',
      value: 'BR'
    }, {
      shortName: 'ST',
      value: 'São Paulo'
    }, {
      name: 'localityName',
      value: 'São Paulo'
    }, {
      name: 'organizationName',
      value: 'RepoMed IA'
    }, {
      shortName: 'OU',
      value: 'Medical Digital Signatures'
    }, {
      name: 'emailAddress',
      value: 'certificates@repomed.ia'
    }];

    this.certificate.setSubject(attrs);
    this.certificate.setIssuer(attrs);

    // Add extensions
    this.certificate.setExtensions([{
      name: 'basicConstraints',
      cA: false
    }, {
      name: 'keyUsage',
      keyCertSign: false,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: false,
      dataEncipherment: false
    }, {
      name: 'extKeyUsage',
      serverAuth: false,
      clientAuth: false,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    }, {
      name: 'nsCertType',
      client: false,
      server: false,
      email: true,
      objsign: true,
      sslCA: false,
      emailCA: false,
      objCA: false
    }]);

    // Self-sign certificate
    this.certificate.sign(this.keyPair.privateKey as any, forge.md.sha256.create());
  }

  async signDocument(documentData: any, userId: string): Promise<DigitalSignatureResult> {
    try {
      // Create document hash
      const documentString = JSON.stringify(documentData);
      const hash = crypto.createHash('sha256').update(documentString).digest('hex');
      
      // Create signature data
      const timestamp = new Date();
      const signatureData = {
        documentHash: hash,
        timestamp: timestamp.toISOString(),
        userId,
        documentId: documentData.id || crypto.randomUUID(),
        version: '1.0'
      };

      // Sign the data
      const md = forge.md.sha256.create();
      md.update(JSON.stringify(signatureData), 'utf8');
      const signature = (this.keyPair.privateKey as any).sign(md);
      const signatureBase64 = forge.util.encode64(signature);

      // Get certificate in PEM format
      const certificatePem = forge.pki.certificateToPem(this.certificate);

      // Create verification URL
      const verificationUrl = `${process.env.API_URL || 'http://localhost:8081'}/api/verify/${documentData.id}`;

      // Generate QR Code
      const qrData = {
        url: verificationUrl,
        hash,
        timestamp: timestamp.toISOString(),
        signature: signatureBase64
      };
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

      return {
        signature: signatureBase64,
        hash,
        timestamp,
        certificate: certificatePem,
        qrCode,
        verificationUrl
      };
    } catch (error: any) {
      throw new Error(`Digital signature failed: ${error.message}`);
    }
  }

  async validateSignature(
    documentData: any, 
    signature: string, 
    certificate: string
  ): Promise<SignatureValidation> {
    const validation: SignatureValidation = {
      isValid: false,
      certificateValid: false,
      timestampValid: false,
      hashMatch: false,
      validationErrors: []
    };

    try {
      // Parse certificate
      let cert: forge.pki.Certificate;
      try {
        cert = forge.pki.certificateFromPem(certificate);
        validation.certificateValid = true;
      } catch (error) {
        validation.validationErrors.push('Invalid certificate format');
        return validation;
      }

      // Extract signer info
      validation.signerInfo = {
        commonName: this.getAttributeValue(cert.subject.attributes, 'commonName') || '',
        organization: this.getAttributeValue(cert.subject.attributes, 'organizationName') || '',
        country: this.getAttributeValue(cert.subject.attributes, 'countryName') || '',
        email: this.getAttributeValue(cert.subject.attributes, 'emailAddress') || ''
      };

      // Check certificate validity period
      const now = new Date();
      if (now < cert.validity.notBefore || now > cert.validity.notAfter) {
        validation.validationErrors.push('Certificate has expired or is not yet valid');
      } else {
        validation.timestampValid = true;
      }

      // Verify document hash
      const documentString = JSON.stringify(documentData);
      const expectedHash = crypto.createHash('sha256').update(documentString).digest('hex');
      
      if (documentData.hash && documentData.hash === expectedHash) {
        validation.hashMatch = true;
      } else {
        validation.validationErrors.push('Document hash mismatch - document may have been modified');
      }

      // Verify signature
      try {
        const md = forge.md.sha256.create();
        md.update(JSON.stringify({
          documentHash: expectedHash,
          timestamp: documentData.timestamp || new Date().toISOString(),
          userId: documentData.userId,
          documentId: documentData.id,
          version: '1.0'
        }), 'utf8');

        const signatureBuffer = forge.util.decode64(signature);
        const verified = (cert.publicKey as any).verify(md.digest().bytes(), signatureBuffer);
        
        if (!verified) {
          validation.validationErrors.push('Signature verification failed');
        }
      } catch (error: any) {
        validation.validationErrors.push(`Signature verification error: ${error.message}`);
      }

      // Set overall validity
      validation.isValid = validation.certificateValid && 
                          validation.timestampValid && 
                          validation.hashMatch && 
                          validation.validationErrors.length === 0;

      return validation;
    } catch (error: any) {
      validation.validationErrors.push(`Validation error: ${error.message}`);
      return validation;
    }
  }

  private getAttributeValue(attributes: any[], name: string): string | undefined {
    const attribute = attributes.find(attr => attr.name === name || attr.shortName === name);
    return attribute ? attribute.value : undefined;
  }

  getCertificatePem(): string {
    return forge.pki.certificateToPem(this.certificate);
  }

  async generateTimestamp(data: string): Promise<string> {
    const timestamp = new Date().toISOString();
    const md = forge.md.sha256.create();
    md.update(data + timestamp, 'utf8');
    const signature = (this.keyPair.privateKey as any).sign(md);
    
    return JSON.stringify({
      timestamp,
      signature: forge.util.encode64(signature),
      data: forge.util.encode64(data)
    });
  }
}