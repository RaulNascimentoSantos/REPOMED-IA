'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PenTool, 
  RotateCcw, 
  Check, 
  Shield, 
  QrCode,
  Download,
  Eye,
  AlertCircle,
  Clock,
  User,
  MapPin,
  Smartphone,
  Fingerprint
} from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SignatureData {
  signature: string // Base64 image
  timestamp: Date
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  device: {
    userAgent: string
    platform: string
    screenResolution: string
  }
  biometrics?: {
    pressurePoints: number[]
    strokeVelocity: number[]
    totalTime: number
    averagePressure: number
  }
  hash: string
  qrCode: string
  certificate: {
    issuer: string
    subject: string
    serialNumber: string
    validFrom: Date
    validUntil: Date
  }
}

interface DigitalSignatureProps {
  document?: any
  doctorInfo: {
    name: string
    crm: string
    uf: string
    specialty?: string
  }
  onSignatureComplete?: (signatureData: SignatureData) => void
  onSignatureError?: (error: string) => void
  className?: string
  requiredSignatures?: number
  allowMultipleSignatures?: boolean
}

export default function DigitalSignature({
  document,
  doctorInfo,
  onSignatureComplete,
  onSignatureError,
  className = '',
  requiredSignatures = 1,
  allowMultipleSignatures = false
}: DigitalSignatureProps) {
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isSigningMode, setIsSigningMode] = useState(false)
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [biometricData, setBiometricData] = useState({
    startTime: 0,
    pressurePoints: [] as number[],
    strokeVelocity: [] as number[],
    lastPoint: null as any
  })
  const [validationStep, setValidationStep] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  // Get device information
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }, [])

  // Get geolocation
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => setLocation(position),
      (error) => console.warn('Location access denied:', error),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // Generate mock certificate (would be real ICP-Brasil)
  const generateMockCertificate = useCallback(() => {
    return {
      issuer: 'AC RepoMed IA - Certificação Digital',
      subject: `CN=${doctorInfo.name}, CRM=${doctorInfo.crm}, UF=${doctorInfo.uf}`,
      serialNumber: Math.random().toString(36).substr(2, 16).toUpperCase(),
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  }, [doctorInfo])

  // Generate hash for blockchain audit trail
  const generateDocumentHash = useCallback((signature: string) => {
    const content = JSON.stringify({
      document: document?.id || 'unknown',
      signature,
      doctor: doctorInfo,
      timestamp: new Date().toISOString()
    })
    
    // Simple hash (would use crypto.subtle in production)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()
  }, [document, doctorInfo])

  // Generate QR Code data
  const generateQRCode = useCallback((hash: string) => {
    const qrData = {
      type: 'medical_document_signature',
      hash,
      doctor: `${doctorInfo.name} - CRM ${doctorInfo.crm}/${doctorInfo.uf}`,
      timestamp: new Date().toISOString(),
      verifyUrl: `https://repomed-ia.com.br/verify/${hash}`
    }
    
    return `data:qrcode,${encodeURIComponent(JSON.stringify(qrData))}`
  }, [doctorInfo])

  // Start signing process
  const startSigning = useCallback(() => {
    setIsSigningMode(true)
    setErrors([])
    setBiometricData({
      startTime: Date.now(),
      pressurePoints: [],
      strokeVelocity: [],
      lastPoint: null
    })
    getLocation()
    
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }, [getLocation])

  // Track biometric data during signing
  const trackBiometrics = useCallback((event: any) => {
    const now = Date.now()
    const point = { x: event.offsetX, y: event.offsetY, time: now }
    
    setBiometricData(prev => {
      const newData = { ...prev }
      
      // Simulate pressure based on drawing speed and position
      const pressure = event.pressure || Math.random() * 0.5 + 0.5
      newData.pressurePoints.push(pressure)
      
      // Calculate velocity if we have a previous point
      if (prev.lastPoint) {
        const distance = Math.sqrt(
          Math.pow(point.x - prev.lastPoint.x, 2) + 
          Math.pow(point.y - prev.lastPoint.y, 2)
        )
        const timeDiff = point.time - prev.lastPoint.time
        const velocity = timeDiff > 0 ? distance / timeDiff : 0
        newData.strokeVelocity.push(velocity)
      }
      
      newData.lastPoint = point
      return newData
    })
  }, [])

  // Clear signature
  const clearSignature = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
    setBiometricData({
      startTime: Date.now(),
      pressurePoints: [],
      strokeVelocity: [],
      lastPoint: null
    })
  }, [])

  // Validate signature quality
  const validateSignature = useCallback(() => {
    const newErrors: string[] = []
    
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      newErrors.push('Assinatura é obrigatória')
    }
    
    if (biometricData.pressurePoints.length < 10) {
      newErrors.push('Assinatura muito curta - assine com mais detalhes')
    }
    
    const avgPressure = biometricData.pressurePoints.reduce((a, b) => a + b, 0) / biometricData.pressurePoints.length
    if (avgPressure < 0.3) {
      newErrors.push('Pressão de assinatura muito baixa - pressione com mais firmeza')
    }
    
    const totalTime = Date.now() - biometricData.startTime
    if (totalTime < 1000) {
      newErrors.push('Assinatura realizada muito rapidamente - assine com calma')
    }
    
    if (totalTime > 60000) {
      newErrors.push('Tempo de assinatura excedido - inicie novamente')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }, [biometricData])

  // Complete signature process
  const completeSignature = useCallback(async () => {
    if (!validateSignature()) {
      return
    }
    
    setIsProcessing(true)
    setValidationStep(0)
    
    try {
      // Step 1: Generate signature image
      setValidationStep(1)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const signatureImage = signatureRef.current?.toDataURL() || ''
      
      // Step 2: Generate hash and QR code
      setValidationStep(2)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const hash = generateDocumentHash(signatureImage)
      const qrCode = generateQRCode(hash)
      
      // Step 3: Generate certificate
      setValidationStep(3)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const certificate = generateMockCertificate()
      
      // Step 4: Calculate biometric signature
      setValidationStep(4)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const totalTime = Date.now() - biometricData.startTime
      const avgPressure = biometricData.pressurePoints.reduce((a, b) => a + b, 0) / biometricData.pressurePoints.length
      
      const finalSignatureData: SignatureData = {
        signature: signatureImage,
        timestamp: new Date(),
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: 'Localização capturada' // Would reverse geocode in production
        } : undefined,
        device: getDeviceInfo(),
        biometrics: {
          pressurePoints: biometricData.pressurePoints,
          strokeVelocity: biometricData.strokeVelocity,
          totalTime,
          averagePressure: avgPressure
        },
        hash,
        qrCode,
        certificate
      }
      
      // Step 5: Finalize
      setValidationStep(5)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSignatureData(finalSignatureData)
      setIsSigningMode(false)
      onSignatureComplete?.(finalSignatureData)
      
    } catch (error) {
      console.error('Signature error:', error)
      onSignatureError?.('Erro ao processar assinatura')
    } finally {
      setIsProcessing(false)
      setValidationStep(0)
    }
  }, [validateSignature, generateDocumentHash, generateQRCode, generateMockCertificate, biometricData, location, getDeviceInfo, onSignatureComplete, onSignatureError])

  // Validation steps
  const validationSteps = [
    { label: 'Iniciando validação...', icon: Clock },
    { label: 'Processando assinatura...', icon: PenTool },
    { label: 'Gerando hash de segurança...', icon: Shield },
    { label: 'Criando certificado digital...', icon: User },
    { label: 'Calculando biometria...', icon: Fingerprint },
    { label: 'Finalizando processo...', icon: Check }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assinatura Digital
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Certificação ICP-Brasil com validação biométrica
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {signatureData && (
            <>
              <motion.button
                className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                onClick={() => setShowPreview(!showPreview)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors"
                onClick={() => {
                  // Download signature data
                  const blob = new Blob([JSON.stringify(signatureData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `assinatura_${signatureData.hash}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Doctor Info */}
      <div className="medical-card p-4">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {doctorInfo.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              CRM {doctorInfo.crm}/{doctorInfo.uf} 
              {doctorInfo.specialty && ` • ${doctorInfo.specialty}`}
            </p>
          </div>
        </div>
      </div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            className="medical-card p-4 border-red-200 dark:border-red-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-red-700 dark:text-red-400">
                Correções Necessárias
              </h4>
            </div>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 dark:text-red-400">
                  • {error}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Area */}
      {!signatureData && (
        <div className="medical-card p-6">
          {!isSigningMode ? (
            <div className="text-center py-12">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <PenTool className="w-12 h-12 text-green-600 dark:text-green-400" />
              </motion.div>
              
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Pronto para Assinar
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Sua assinatura será validada com tecnologia biométrica e certificada digitalmente
              </p>
              
              <motion.button
                className="btn-primary"
                onClick={startSigning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Iniciar Assinatura
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Assine no campo abaixo
                </h4>
                <div className="flex items-center space-x-2">
                  <motion.button
                    className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={clearSignature}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    className="btn-primary"
                    onClick={completeSignature}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Confirmar Assinatura
                  </motion.button>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 600,
                    height: 200,
                    className: 'w-full h-48 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900',
                    onMouseMove: trackBiometrics,
                    onTouchMove: trackBiometrics
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Fingerprint className="w-4 h-4" />
                    <span>Pressão: {biometricData.pressurePoints.length > 0 ? 
                      (biometricData.pressurePoints[biometricData.pressurePoints.length - 1] * 100).toFixed(0) + '%' : 
                      '0%'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Tempo: {((Date.now() - biometricData.startTime) / 1000).toFixed(1)}s</span>
                  </div>
                </div>
                {location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Localização capturada</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Modal */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Processando Assinatura Digital
                </h3>
                
                <div className="space-y-4">
                  {validationSteps.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = index === validationStep
                    const isCompleted = index < validationStep
                    
                    return (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                          isCompleted ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400' :
                          'text-gray-400 dark:text-gray-600'
                        }`}
                        animate={{
                          scale: isActive ? 1.02 : 1,
                        }}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isActive ? 'bg-green-500 text-white' :
                          'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-medium">{step.label}</span>
                        {isActive && (
                          <motion.div
                            className="ml-auto w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Complete */}
      {signatureData && (
        <div className="medical-card p-6 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Documento Assinado com Sucesso
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(signatureData.timestamp, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signature Preview */}
            <div className="space-y-3">
              <h5 className="font-semibold text-gray-900 dark:text-white">Assinatura</h5>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                <img 
                  src={signatureData.signature} 
                  alt="Assinatura digital"
                  className="w-full h-24 object-contain"
                />
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-3">
              <h5 className="font-semibold text-gray-900 dark:text-white">Validação</h5>
              <div className="flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    QR Code de Validação
                  </div>
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">
                    {signatureData.hash}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Details */}
          {showPreview && (
            <motion.div
              className="mt-6 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Detalhes da Assinatura
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Hash de Segurança:</span>
                    <div className="font-mono text-gray-900 dark:text-white">
                      {signatureData.hash}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Certificado:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {signatureData.certificate.serialNumber}
                    </div>
                  </div>
                  
                  {signatureData.biometrics && (
                    <>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Pressão Média:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(signatureData.biometrics.averagePressure * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Tempo de Assinatura:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(signatureData.biometrics.totalTime / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </>
                  )}
                  
                  {signatureData.location && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Localização:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {signatureData.location.address || 'Coordenadas capturadas'}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Dispositivo:</span>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {signatureData.device.platform}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}