'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ApiService } from '@/lib/api';
import { Shield, CheckCircle, XCircle, Clock, FileText, QrCode, Eye, Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentSignatureProps {
  documentId: string;
  documentData?: any;
  onSignatureComplete?: (signature: any) => void;
}

interface SignatureStatus {
  isSigned: boolean;
  signature?: any;
  validation?: any;
  auditTrail?: any[];
}

export function DocumentSignature({ documentId, documentData, onSignatureComplete }: DocumentSignatureProps) {
  const [status, setStatus] = useState<SignatureStatus>({ isSigned: false });
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [certificate, setCertificate] = useState<string>('');

  useEffect(() => {
    if (documentId) {
      loadSignatureStatus();
      loadCertificate();
    }
  }, [documentId]);

  const loadSignatureStatus = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if document is signed
      const response = await ApiService.get(`/api/documents/${documentId}`) as any;
      
      if (response.isSigned) {
        setStatus({
          isSigned: true,
          signature: {
            hash: response.hash,
            signedAt: response.signedAt,
            qrCode: response.qrCode
          }
        });
      }
    } catch (err: any) {
      setError('Failed to load signature status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificate = async () => {
    try {
      const response = await ApiService.get('/api/certificate') as any;
      setCertificate(response.certificate);
    } catch (err: any) {
      console.error('Failed to load certificate:', err);
    }
  };

  const signDocument = async () => {
    try {
      setSigning(true);
      setError('');

      const response = await ApiService.post(`/api/documents/${documentId}/sign`, {
        documentData: documentData || {}
      }) as any;

      if (response.success) {
        setStatus({
          isSigned: true,
          signature: response.signature
        });
        
        if (onSignatureComplete) {
          onSignatureComplete(response.signature);
        }
        
        // Reload to get updated status
        await loadSignatureStatus();
      }
    } catch (err: any) {
      setError('Signature failed: ' + err.message);
    } finally {
      setSigning(false);
    }
  };

  const validateSignature = async () => {
    if (!status.signature || !certificate) return;

    try {
      setValidating(true);
      setError('');

      const response = await ApiService.post('/api/documents/validate-signature', {
        documentId,
        signature: status.signature.signature,
        certificate,
        documentData: documentData || {}
      }) as any;

      if (response.success) {
        setStatus(prev => ({
          ...prev,
          validation: response.validation
        }));
      }
    } catch (err: any) {
      setError('Validation failed: ' + err.message);
    } finally {
      setValidating(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/api/documents/${documentId}/audit`) as any;
      
      if (response.success) {
        setStatus(prev => ({
          ...prev,
          auditTrail: response.auditTrail
        }));
      }
    } catch (err: any) {
      setError('Failed to load audit trail: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;
    
    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repomed-certificate.pem';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Loading signature information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Signature Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Digital Signature</CardTitle>
          </div>
          <CardDescription>
            Secure document signing with PKI certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.isSigned ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Document Signed</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" style={{ color: 'var(--text-aaa-secondary)' }} />
                  <span style={{ color: 'var(--text-aaa-secondary)' }}>Not Signed</span>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              {!status.isSigned && (
                <Button
                  onClick={signDocument}
                  disabled={signing}
                  size="sm"
                >
                  {signing ? (
                    <>
                      <LoadingSpinner size={16} className="mr-2" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign Document
                    </>
                  )}
                </Button>
              )}
              
              {status.isSigned && (
                <>
                  <Button
                    variant="outline"
                    onClick={validateSignature}
                    disabled={validating}
                    size="sm"
                  >
                    {validating ? (
                      <>
                        <LoadingSpinner size={16} className="mr-2" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowQRCode(!showQRCode)}
                    size="sm"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Signature Details */}
          {status.signature && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Document Hash</label>
                <p className="text-xs font-mono bg-white p-2 rounded border mt-1 break-all">
                  {status.signature.hash}
                </p>
              </div>
              
              {status.signature.signedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Signed At</label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(status.signature.signedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {status.signature.verificationUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Verification URL</label>
                  <p className="text-xs text-blue-600 mt-1 break-all">
                    {status.signature.verificationUrl}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QR Code */}
          {showQRCode && status.signature?.qrCode && (
            <div className="text-center bg-white p-4 rounded-lg border">
              <img 
                src={status.signature.qrCode} 
                alt="Verification QR Code" 
                className="mx-auto mb-2"
                style={{ maxWidth: '200px' }}
              />
              <p className="text-sm text-gray-600">
                Scan to verify document authenticity
              </p>
            </div>
          )}

          {/* Validation Results */}
          {status.validation && (
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Signature Validation Results
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant={status.validation.isValid ? 'default' : 'destructive'}>
                    {status.validation.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  <Badge variant={status.validation.certificateValid ? 'default' : 'destructive'}>
                    Certificate: {status.validation.certificateValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Badge variant={status.validation.timestampValid ? 'default' : 'destructive'}>
                    Timestamp: {status.validation.timestampValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  <Badge variant={status.validation.hashMatch ? 'default' : 'destructive'}>
                    Hash: {status.validation.hashMatch ? 'Match' : 'Mismatch'}
                  </Badge>
                </div>
              </div>

              {status.validation.signerInfo && (
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium mb-2">Signer Information</h5>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {status.validation.signerInfo.commonName}</p>
                    <p><strong>Organization:</strong> {status.validation.signerInfo.organization}</p>
                    <p><strong>Email:</strong> {status.validation.signerInfo.email}</p>
                  </div>
                </div>
              )}

              {status.validation.validationErrors.length > 0 && (
                <div className="bg-red-50 p-3 rounded">
                  <h5 className="font-medium text-red-800 mb-2">Validation Errors</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    {status.validation.validationErrors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                This document uses RepoMed IA's digital certificate authority for secure signing.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadCertificate}
                disabled={!certificate}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              
              <Button
                variant="outline"
                onClick={loadAuditTrail}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Audit Trail
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      {status.auditTrail && status.auditTrail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>
              Complete history of document events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status.auditTrail.map((log: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-xs" style={{ color: 'var(--text-aaa-secondary)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Actor:</strong> {log.actorName} ({log.actorEmail})</p>
                    {log.ipAddress && <p><strong>IP:</strong> {log.ipAddress}</p>}
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">Details</summary>
                        <pre className="text-xs bg-white p-2 mt-1 rounded border overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DocumentSignature;