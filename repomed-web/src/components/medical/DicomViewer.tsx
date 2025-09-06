'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Info,
  Eye,
  Layers,
  Ruler,
  Circle,
  Square,
  ArrowRight,
  Contrast,
  Sun,
  Volume2,
  Activity,
  Scan,
  Image as ImageIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface DicomImage {
  id: string
  filename: string
  patientName: string
  studyDate: string
  modality: string
  seriesDescription: string
  imageNumber: number
  windowCenter: number
  windowWidth: number
  pixelData?: Uint16Array
  width: number
  height: number
  url: string
}

interface ViewportSettings {
  zoom: number
  pan: { x: number; y: number }
  rotation: number
  windowCenter: number
  windowWidth: number
  invert: boolean
  interpolation: 'nearest' | 'linear' | 'cubic'
}

interface MeasurementTool {
  type: 'length' | 'angle' | 'rectangle' | 'ellipse' | 'arrow'
  active: boolean
  measurements: Measurement[]
}

interface Measurement {
  id: string
  type: string
  points: { x: number; y: number }[]
  value?: number
  unit?: string
  label?: string
}

// Mock DICOM data for demonstration
const mockDicomImages: DicomImage[] = [
  {
    id: 'dicom_001',
    filename: 'chest_xray_001.dcm',
    patientName: 'Silva, João',
    studyDate: '2024-01-15',
    modality: 'CR',
    seriesDescription: 'Chest X-Ray PA',
    imageNumber: 1,
    windowCenter: 512,
    windowWidth: 1024,
    width: 512,
    height: 512,
    url: '/placeholder-dicom-chest.jpg'
  },
  {
    id: 'dicom_002',
    filename: 'brain_mri_001.dcm',
    patientName: 'Santos, Maria',
    studyDate: '2024-01-16',
    modality: 'MR',
    seriesDescription: 'Brain T1 Axial',
    imageNumber: 1,
    windowCenter: 300,
    windowWidth: 600,
    width: 256,
    height: 256,
    url: '/placeholder-dicom-brain.jpg'
  },
  {
    id: 'dicom_003',
    filename: 'ct_abdomen_001.dcm',
    patientName: 'Oliveira, Carlos',
    studyDate: '2024-01-17',
    modality: 'CT',
    seriesDescription: 'Abdomen CT Axial',
    imageNumber: 1,
    windowCenter: 50,
    windowWidth: 400,
    width: 512,
    height: 512,
    url: '/placeholder-dicom-ct.jpg'
  }
]

export function DicomViewer() {
  const [images, setImages] = useState<DicomImage[]>(mockDicomImages)
  const [currentImage, setCurrentImage] = useState<DicomImage | null>(images[0] || null)
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0,
    windowCenter: 512,
    windowWidth: 1024,
    invert: false,
    interpolation: 'linear'
  })
  const [measurementTool, setMeasurementTool] = useState<MeasurementTool>({
    type: 'length',
    active: false,
    measurements: []
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [is3DMode, setIs3DMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // Initialize viewport when current image changes
  useEffect(() => {
    if (currentImage) {
      setViewportSettings(prev => ({
        ...prev,
        windowCenter: currentImage.windowCenter,
        windowWidth: currentImage.windowWidth
      }))
    }
  }, [currentImage])

  // Canvas rendering effect
  useEffect(() => {
    if (currentImage && canvasRef.current) {
      renderDicomImage()
    }
  }, [currentImage, viewportSettings, measurementTool.measurements])

  const renderDicomImage = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !currentImage) return

    canvas.width = currentImage.width
    canvas.height = currentImage.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(viewportSettings.zoom, viewportSettings.zoom)
    ctx.rotate((viewportSettings.rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2 + viewportSettings.pan.x, -canvas.height / 2 + viewportSettings.pan.y)

    // Create mock image visualization
    ctx.fillStyle = viewportSettings.invert ? '#ffffff' : '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Simulate DICOM data visualization with gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, 
      canvas.height / 2, 
      0,
      canvas.width / 2, 
      canvas.height / 2, 
      canvas.width / 3
    )
    
    const intensity = Math.min(Math.max((viewportSettings.windowCenter / viewportSettings.windowWidth), 0), 1)
    
    if (viewportSettings.invert) {
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`)
      gradient.addColorStop(0.5, `rgba(128, 128, 128, ${intensity * 0.7})`)
      gradient.addColorStop(1, `rgba(255, 255, 255, ${intensity * 0.5})`)
    } else {
      gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`)
      gradient.addColorStop(0.5, `rgba(128, 128, 128, ${intensity * 0.7})`)
      gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.5})`)
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add anatomical shapes based on modality
    renderAnatomicalStructures(ctx, currentImage.modality, canvas.width, canvas.height)

    ctx.restore()

    // Render measurements on top
    renderMeasurements(ctx)
  }, [currentImage, viewportSettings, measurementTool.measurements])

  const renderAnatomicalStructures = (ctx: CanvasRenderingContext2D, modality: string, width: number, height: number) => {
    ctx.save()
    
    switch (modality) {
      case 'CR': // Chest X-Ray
        // Ribcage simulation
        ctx.strokeStyle = viewportSettings.invert ? '#333333' : '#cccccc'
        ctx.lineWidth = 2
        for (let i = 0; i < 8; i++) {
          const y = (height * 0.3) + (i * height * 0.08)
          ctx.beginPath()
          ctx.moveTo(width * 0.2, y)
          ctx.quadraticCurveTo(width * 0.5, y - height * 0.02, width * 0.8, y)
          ctx.stroke()
        }
        // Heart silhouette
        ctx.fillStyle = viewportSettings.invert ? '#666666' : '#999999'
        ctx.beginPath()
        ctx.ellipse(width * 0.4, height * 0.6, width * 0.15, height * 0.2, 0, 0, 2 * Math.PI)
        ctx.fill()
        break

      case 'MR': // Brain MRI
        // Brain outline
        ctx.strokeStyle = viewportSettings.invert ? '#444444' : '#bbbbbb'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(width / 2, height / 2, width * 0.35, height * 0.4, 0, 0, 2 * Math.PI)
        ctx.stroke()
        
        // Brain structures
        ctx.fillStyle = viewportSettings.invert ? '#555555' : '#aaaaaa'
        ctx.beginPath()
        ctx.ellipse(width * 0.3, height * 0.4, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(width * 0.7, height * 0.4, width * 0.08, height * 0.1, 0, 0, 2 * Math.PI)
        ctx.fill()
        break

      case 'CT': // CT Scan
        // Body outline
        ctx.strokeStyle = viewportSettings.invert ? '#333333' : '#dddddd'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(width / 2, height / 2, width * 0.4, height * 0.45, 0, 0, 2 * Math.PI)
        ctx.stroke()
        
        // Organs simulation
        ctx.fillStyle = viewportSettings.invert ? '#777777' : '#888888'
        for (let i = 0; i < 5; i++) {
          const x = width * (0.3 + Math.random() * 0.4)
          const y = height * (0.3 + Math.random() * 0.4)
          ctx.beginPath()
          ctx.ellipse(x, y, width * 0.05, height * 0.05, 0, 0, 2 * Math.PI)
          ctx.fill()
        }
        break
    }
    
    ctx.restore()
  }

  const renderMeasurements = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.strokeStyle = '#00ff00'
    ctx.fillStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.font = '14px Arial'

    measurementTool.measurements.forEach(measurement => {
      switch (measurement.type) {
        case 'length':
          if (measurement.points.length >= 2) {
            const [p1, p2] = measurement.points
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            
            const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
            ctx.fillText(`${distance.toFixed(1)}px`, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
          }
          break
        
        case 'rectangle':
          if (measurement.points.length >= 2) {
            const [p1, p2] = measurement.points
            const width = p2.x - p1.x
            const height = p2.y - p1.y
            ctx.strokeRect(p1.x, p1.y, width, height)
            ctx.fillText(`${Math.abs(width * height).toFixed(0)}px²`, p1.x, p1.y - 10)
          }
          break

        case 'ellipse':
          if (measurement.points.length >= 2) {
            const [p1, p2] = measurement.points
            const radiusX = Math.abs(p2.x - p1.x) / 2
            const radiusY = Math.abs(p2.y - p1.y) / 2
            const centerX = (p1.x + p2.x) / 2
            const centerY = (p1.y + p2.y) / 2
            
            ctx.beginPath()
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
            ctx.stroke()
            
            const area = Math.PI * radiusX * radiusY
            ctx.fillText(`${area.toFixed(0)}px²`, centerX, centerY)
          }
          break
      }
    })

    ctx.restore()
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!measurementTool.active || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newMeasurement: Measurement = {
      id: `measurement_${Date.now()}`,
      type: measurementTool.type,
      points: [{ x, y }],
    }

    setMeasurementTool(prev => ({
      ...prev,
      measurements: [...prev.measurements, newMeasurement]
    }))
  }

  const handleWindowingChange = (property: 'windowCenter' | 'windowWidth', value: number) => {
    setViewportSettings(prev => ({
      ...prev,
      [property]: value
    }))
  }

  const handleZoom = (delta: number) => {
    setViewportSettings(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom + delta))
    }))
  }

  const handleRotation = (degrees: number) => {
    setViewportSettings(prev => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360
    }))
  }

  const resetViewport = () => {
    setViewportSettings({
      zoom: 1,
      pan: { x: 0, y: 0 },
      rotation: 0,
      windowCenter: currentImage?.windowCenter || 512,
      windowWidth: currentImage?.windowWidth || 1024,
      invert: false,
      interpolation: 'linear'
    })
  }

  const exportImage = () => {
    if (!canvasRef.current) return
    
    const link = document.createElement('a')
    link.download = `${currentImage?.filename || 'dicom_image'}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    
    toast.success('Imagem exportada com sucesso')
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Visualizador DICOM
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Renderização 2D/3D avançada com ferramentas de medição
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {currentImage?.modality || 'DICOM'}
          </Badge>
          <Badge variant="outline">
            Cornerstone.js
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Image Series Panel */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Séries de Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    currentImage?.id === image.id
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setCurrentImage(image)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{image.patientName}</p>
                      <p className="text-xs text-gray-500">{image.seriesDescription}</p>
                      <p className="text-xs text-gray-400">{image.studyDate}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {image.modality}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              
              <Separator className="my-4" />
              
              <Button size="sm" variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Carregar DICOM
              </Button>
            </CardContent>
          </Card>

          {/* Patient Information */}
          {currentImage && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <span className="font-medium">Paciente:</span>
                  <p>{currentImage.patientName}</p>
                </div>
                <div>
                  <span className="font-medium">Modalidade:</span>
                  <p>{currentImage.modality}</p>
                </div>
                <div>
                  <span className="font-medium">Data do Estudo:</span>
                  <p>{currentImage.studyDate}</p>
                </div>
                <div>
                  <span className="font-medium">Série:</span>
                  <p>{currentImage.seriesDescription}</p>
                </div>
                <div>
                  <span className="font-medium">Dimensões:</span>
                  <p>{currentImage.width} x {currentImage.height}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Viewer */}
        <div className="col-span-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  {currentImage?.seriesDescription || 'Visualizador'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportImage}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    size="sm"
                    variant={viewportSettings.zoom > 1 ? "default" : "ghost"}
                    onClick={() => handleZoom(0.1)}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleZoom(-0.1)}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRotation(-90)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRotation(90)}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    size="sm"
                    variant={measurementTool.active && measurementTool.type === 'length' ? "default" : "ghost"}
                    onClick={() => setMeasurementTool(prev => ({ 
                      ...prev, 
                      type: 'length', 
                      active: !prev.active || prev.type !== 'length' 
                    }))}
                  >
                    <Ruler className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={measurementTool.active && measurementTool.type === 'rectangle' ? "default" : "ghost"}
                    onClick={() => setMeasurementTool(prev => ({ 
                      ...prev, 
                      type: 'rectangle', 
                      active: !prev.active || prev.type !== 'rectangle' 
                    }))}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={measurementTool.active && measurementTool.type === 'ellipse' ? "default" : "ghost"}
                    onClick={() => setMeasurementTool(prev => ({ 
                      ...prev, 
                      type: 'ellipse', 
                      active: !prev.active || prev.type !== 'ellipse' 
                    }))}
                  >
                    <Circle className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewportSettings(prev => ({ ...prev, invert: !prev.invert }))}
                >
                  <Contrast className="w-4 h-4" />
                </Button>

                <Button size="sm" variant="outline" onClick={resetViewport}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain cursor-crosshair"
                  onClick={handleCanvasClick}
                  style={{
                    imageRendering: viewportSettings.interpolation === 'nearest' ? 'pixelated' : 'auto'
                  }}
                />
                
                {/* Overlay Information */}
                <div className="absolute top-4 left-4 text-white text-xs space-y-1 bg-black/50 rounded p-2">
                  <p>Zoom: {Math.round(viewportSettings.zoom * 100)}%</p>
                  <p>WC/WW: {viewportSettings.windowCenter}/{viewportSettings.windowWidth}</p>
                  <p>Rotation: {viewportSettings.rotation}°</p>
                  {measurementTool.active && (
                    <p className="text-green-400">
                      {measurementTool.type.toUpperCase()} ativo
                    </p>
                  )}
                </div>
                
                <div className="absolute top-4 right-4 text-white text-xs bg-black/50 rounded p-2">
                  <p>{currentImage?.patientName}</p>
                  <p>{currentImage?.studyDate}</p>
                  <p>#{currentImage?.imageNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Panel */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Windowing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Window Center</label>
                <Slider
                  value={[viewportSettings.windowCenter]}
                  onValueChange={(value) => handleWindowingChange('windowCenter', value[0])}
                  max={4095}
                  min={0}
                  step={1}
                  className="mt-2"
                />
                <span className="text-xs text-gray-500">{viewportSettings.windowCenter}</span>
              </div>
              
              <div>
                <label className="text-sm font-medium">Window Width</label>
                <Slider
                  value={[viewportSettings.windowWidth]}
                  onValueChange={(value) => handleWindowingChange('windowWidth', value[0])}
                  max={4095}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <span className="text-xs text-gray-500">{viewportSettings.windowWidth}</span>
              </div>

              <div>
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  value={[viewportSettings.zoom]}
                  onValueChange={(value) => setViewportSettings(prev => ({ ...prev, zoom: value[0] }))}
                  max={5}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
                <span className="text-xs text-gray-500">{Math.round(viewportSettings.zoom * 100)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4" />
                Medições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {measurementTool.measurements.map((measurement, index) => (
                  <div key={measurement.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>{measurement.type} #{index + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setMeasurementTool(prev => ({
                        ...prev,
                        measurements: prev.measurements.filter(m => m.id !== measurement.id)
                      }))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {measurementTool.measurements.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Nenhuma medição ativa
                  </p>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setMeasurementTool(prev => ({ ...prev, measurements: [] }))}
                  disabled={measurementTool.measurements.length === 0}
                >
                  Limpar Todas
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4" />
                Análise IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button size="sm" className="w-full" variant="outline">
                  <Brain className="w-4 h-4 mr-2" />
                  Detecção Automática
                </Button>
                <Button size="sm" className="w-full" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Análise Cardíaca
                </Button>
                <Button size="sm" className="w-full" variant="outline">
                  <Scan className="w-4 h-4 mr-2" />
                  Segmentação
                </Button>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    IA detectou 3 estruturas anatômicas com 94% de confiança
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}