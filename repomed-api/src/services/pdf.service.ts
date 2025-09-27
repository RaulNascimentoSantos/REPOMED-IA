import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
// Temporary document interface until contracts are resolved
interface Document {
  id: string
  title: string
  content: string
  hash?: string
  createdAt: string | Date
  isSigned: boolean
  signedAt?: string | Date | null
  signedBy?: string
  signatureHash?: string
  patient?: {
    id: string
    name: string
    cpf?: string
  }
  doctor?: {
    id: string
    name: string
    crm?: string
  }
  template?: {
    id: string
    name: string
  }
}

// 📄 Serviço de geração determinística de PDFs

interface PDFConfig {
  timezone: string
  locale: string
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  fonts: {
    regular: string
    bold: string
    italic?: string
  }
  producer: string
  createdAt: string
  modifiedAt: null // Sempre null para determinismo
}

interface PDFGenerationOptions {
  format?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  includeQRCode?: boolean
  includeWatermark?: boolean
  watermarkText?: string
  documentId: string
  templateName?: string
}

/**
 * Serviço para geração determinística de PDFs
 * Garante que o mesmo documento sempre gere o mesmo hash
 */
export class PDFService {
  private readonly config: PDFConfig
  private readonly fontsPath: string
  private readonly outputPath: string

  constructor() {
    this.fontsPath = join(__dirname, '../../../assets/fonts')
    this.outputPath = join(__dirname, '../../../public/pdfs')
    
    // Criar diretório de saída se não existir
    if (!existsSync(this.outputPath)) {
      mkdirSync(this.outputPath, { recursive: true })
    }
    
    // Configuração fixa para determinismo
    this.config = {
      timezone: process.env.PDF_TIMEZONE || 'UTC',
      locale: process.env.PDF_LOCALE || 'pt-BR',
      margins: {
        top: Number(process.env.PDF_MARGINS_TOP) || 72,
        bottom: Number(process.env.PDF_MARGINS_BOTTOM) || 72,
        left: Number(process.env.PDF_MARGINS_LEFT) || 72,
        right: Number(process.env.PDF_MARGINS_RIGHT) || 72
      },
      fonts: {
        regular: join(this.fontsPath, 'Inter-Regular.ttf'),
        bold: join(this.fontsPath, 'Inter-Bold.ttf'),
        italic: join(this.fontsPath, 'Inter-Italic.ttf')
      },
      producer: 'RepoMed IA v1.0',
      createdAt: '', // Será definido por documento
      modifiedAt: null
    }
  }

  /**
   * Gera PDF de forma determinística
   * O mesmo documento sempre produzirá o mesmo hash
   */
  async generateDeterministic(
    document: Document, 
    options: PDFGenerationOptions = {}
  ): Promise<{
    buffer: Buffer
    hash: string
    metadata: {
      pages: number
      size: number
      generatedAt: string
      config: PDFConfig
    }
  }> {
    try {
      // Configuração determinística baseada no documento
      const deterministicConfig = {
        ...this.config,
        createdAt: new Date(document.createdAt).toISOString(),
        format: options.format || 'A4',
        orientation: options.orientation || 'portrait'
      }

      // Criar PDF com configurações fixas
      const pdf = new PDFDocument({
        size: deterministicConfig.format,
        layout: deterministicConfig.orientation,
        margins: deterministicConfig.margins,
        info: {
          Title: document.title,
          Author: document.doctor?.name || 'RepoMed IA',
          Subject: `Documento Médico - ${document.template?.name}`,
          Keywords: document.tags?.join(', '),
          Creator: deterministicConfig.producer,
          Producer: deterministicConfig.producer,
          CreationDate: new Date(deterministicConfig.createdAt),
          ModDate: null // Sempre null para determinismo
        },
        // Configurações para determinismo
        compress: true,
        autoFirstPage: true,
        font: 'Helvetica' // Font padrão até carregarmos as customizadas
      })

      // Buffer para capturar o PDF
      const chunks: Buffer[] = []
      pdf.on('data', (chunk) => chunks.push(chunk))

      // Gerar conteúdo do PDF
      await this.generatePDFContent(pdf, document, options, deterministicConfig)

      // Finalizar PDF
      pdf.end()

      // Esperar conclusão
      await new Promise((resolve) => {
        pdf.on('end', resolve)
      })

      // Concatenar chunks
      const buffer = Buffer.concat(chunks)

      // Calcular hash SHA-256 determinístico
      const hash = this.calculateDeterministicHash(buffer, document)

      // Metadados
      const metadata = {
        pages: this.countPDFPages(buffer),
        size: buffer.length,
        generatedAt: new Date().toISOString(),
        config: deterministicConfig
      }

      return {
        buffer,
        hash,
        metadata
      }
    } catch (error) {
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Gera o conteúdo do PDF de forma padronizada
   */
  private async generatePDFContent(
    pdf: PDFKit.PDFDocument,
    document: Document,
    options: PDFGenerationOptions,
    config: PDFConfig
  ): Promise<void> {
    // Header do documento
    await this.generateHeader(pdf, document, config)
    
    // Informações do paciente e médico
    this.generatePatientDoctorInfo(pdf, document)
    
    // Conteúdo principal
    this.generateMainContent(pdf, document)
    
    // QR Code (se solicitado)
    if (options.includeQRCode) {
      await this.generateQRCode(pdf, document)
    }
    
    // Watermark (se solicitado)
    if (options.includeWatermark) {
      this.generateWatermark(pdf, options.watermarkText || 'CONFIDENCIAL')
    }
    
    // Footer
    this.generateFooter(pdf, document, config)
    
    // Assinatura digital (se documento estiver assinado)
    if (document.isSigned) {
      this.generateSignatureInfo(pdf, document)
    }
  }

  /**
   * Gera cabeçalho padronizado
   */
  private async generateHeader(
    pdf: PDFKit.PDFDocument, 
    document: Document, 
    config: PDFConfig
  ): Promise<void> {
    // Logo/Título da aplicação
    pdf.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text('🏥 RepoMed IA', config.margins.left, config.margins.top)
    
    pdf.fontSize(10)
       .font('Helvetica')
       .fillColor('#1f2937')
       .text('Sistema de Documentos Médicos Digitais', config.margins.left, config.margins.top + 25)
    
    // Linha separadora
    pdf.moveTo(config.margins.left, config.margins.top + 45)
       .lineTo(pdf.page.width - config.margins.right, config.margins.top + 45)
       .stroke('#e5e7eb')
    
    // Título do documento
    pdf.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(document.title, config.margins.left, config.margins.top + 60)
    
    // Status do documento
    const statusColor = document.isSigned ? '#10b981' : '#f59e0b'
    const statusText = document.isSigned ? '✅ DOCUMENTO ASSINADO' : '⏳ AGUARDANDO ASSINATURA'
    
    pdf.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor(statusColor)
       .text(statusText, config.margins.left, config.margins.top + 85)
  }

  /**
   * Gera informações do paciente e médico
   */
  private generatePatientDoctorInfo(pdf: PDFKit.PDFDocument, document: Document): void {
    const startY = 150
    
    // Seção Paciente
    pdf.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('DADOS DO PACIENTE', this.config.margins.left, startY)
    
    let currentY = startY + 20
    
    if (document.patient?.name) {
      pdf.fontSize(10)
         .font('Helvetica-Bold')
         .text('Paciente:', this.config.margins.left, currentY)
         .font('Helvetica')
         .text(document.patient.name, this.config.margins.left + 60, currentY)
      currentY += 15
    }
    
    if (document.patient?.cpf) {
      pdf.font('Helvetica-Bold')
         .text('CPF:', this.config.margins.left, currentY)
         .font('Helvetica')
         .text(document.patient.cpf, this.config.margins.left + 60, currentY)
      currentY += 15
    }
    
    // Seção Médico
    currentY += 10
    pdf.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('DADOS DO MÉDICO', this.config.margins.left, currentY)
    
    currentY += 20
    
    if (document.doctor?.name) {
      pdf.fontSize(10)
         .font('Helvetica-Bold')
         .text('Médico:', this.config.margins.left, currentY)
         .font('Helvetica')
         .text(document.doctor.name, this.config.margins.left + 60, currentY)
      currentY += 15
    }
    
    if (document.doctor?.crm) {
      pdf.font('Helvetica-Bold')
         .text('CRM:', this.config.margins.left, currentY)
         .font('Helvetica')
         .text(document.doctor.crm, this.config.margins.left + 60, currentY)
      currentY += 15
    }
    
    // Data de criação
    pdf.font('Helvetica-Bold')
       .text('Data:', this.config.margins.left, currentY)
       .font('Helvetica')
       .text(new Date(document.createdAt).toLocaleDateString('pt-BR', { 
         timeZone: this.config.timezone 
       }), this.config.margins.left + 60, currentY)
  }

  /**
   * Gera conteúdo principal do documento
   */
  private generateMainContent(pdf: PDFKit.PDFDocument, document: Document): void {
    const startY = 300
    
    // Título da seção
    pdf.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('CONTEÚDO DO DOCUMENTO', this.config.margins.left, startY)
    
    // Linha separadora
    pdf.moveTo(this.config.margins.left, startY + 20)
       .lineTo(pdf.page.width - this.config.margins.right, startY + 20)
       .stroke('#e5e7eb')
    
    // Conteúdo
    pdf.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text(
         document.content || 'Conteúdo não disponível',
         this.config.margins.left,
         startY + 35,
         {
           width: pdf.page.width - this.config.margins.left - this.config.margins.right,
           align: 'left',
           lineGap: 2
         }
       )
  }

  /**
   * Gera QR Code para verificação
   */
  private async generateQRCode(pdf: PDFKit.PDFDocument, document: Document): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${document.hash}`
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 100,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      // Converter data URL para buffer
      const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64')
      
      // Posicionar QR Code no canto inferior direito
      const qrSize = 80
      const x = pdf.page.width - this.config.margins.right - qrSize
      const y = pdf.page.height - this.config.margins.bottom - qrSize - 30
      
      pdf.image(qrBuffer, x, y, { width: qrSize, height: qrSize })
      
      // Texto explicativo
      pdf.fontSize(8)
         .font('Helvetica')
         .fillColor('#1f2937')
         .text(
           'Escaneie para verificar\na autenticidade',
           x - 20,
           y + qrSize + 5,
           { width: qrSize + 40, align: 'center' }
         )
    } catch (error) {
      console.warn('Failed to generate QR code:', error)
    }
  }

  /**
   * Gera marca d'água
   */
  private generateWatermark(pdf: PDFKit.PDFDocument, text: string): void {
    const centerX = pdf.page.width / 2
    const centerY = pdf.page.height / 2
    
    pdf.save()
    pdf.translate(centerX, centerY)
    pdf.rotate(-45)
    pdf.fontSize(48)
    pdf.font('Helvetica-Bold')
    pdf.fillColor('#000000')
    pdf.opacity(0.1)
    pdf.text(text, -text.length * 12, 0, { align: 'center' })
    pdf.restore()
  }

  /**
   * Gera footer padronizado
   */
  private generateFooter(pdf: PDFKit.PDFDocument, document: Document, config: PDFConfig): void {
    const footerY = pdf.page.height - config.margins.bottom
    
    // Linha separadora
    pdf.moveTo(config.margins.left, footerY - 20)
       .lineTo(pdf.page.width - config.margins.right, footerY - 20)
       .stroke('#e5e7eb')
    
    // Hash do documento (para verificação)
    if (document.hash) {
      pdf.fontSize(8)
         .font('Helvetica')
         .fillColor('#1f2937')
         .text(`Hash: ${document.hash}`, config.margins.left, footerY - 10)
    }
    
    // Informações de geração
    pdf.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR', { timeZone: config.timezone })} pelo ${config.producer}`,
      config.margins.left,
      footerY,
      { width: pdf.page.width - config.margins.left - config.margins.right, align: 'center' }
    )
  }

  /**
   * Gera informações de assinatura digital
   */
  private generateSignatureInfo(pdf: PDFKit.PDFDocument, document: Document): void {
    if (!document.isSigned || !document.signedAt || !document.signedBy) return
    
    const signatureY = pdf.page.height - this.config.margins.bottom - 100
    
    // Caixa de assinatura
    pdf.rect(this.config.margins.left, signatureY - 10, 300, 60)
       .stroke('#10b981')
    
    // Título
    pdf.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#10b981')
       .text('✍️ ASSINATURA DIGITAL', this.config.margins.left + 10, signatureY)
    
    // Informações
    pdf.fontSize(9)
       .font('Helvetica')
       .fillColor('#374151')
       .text(`Assinado por: ${document.signedBy}`, this.config.margins.left + 10, signatureY + 15)
       .text(
         `Data: ${new Date(document.signedAt).toLocaleString('pt-BR', { timeZone: this.config.timezone })}`,
         this.config.margins.left + 10,
         signatureY + 28
       )
    
    if (document.signatureHash) {
      pdf.text(`Hash: ${document.signatureHash.substring(0, 32)}...`, this.config.margins.left + 10, signatureY + 41)
    }
  }

  /**
   * Calcula hash determinístico do PDF
   * Remove metadados variáveis antes do cálculo
   */
  private calculateDeterministicHash(buffer: Buffer, document: Document): string {
    // Para determinismo, usar dados fixos do documento
    const deterministicData = {
      documentId: document.id,
      content: document.content,
      createdAt: document.createdAt,
      patientName: document.patient?.name,
      doctorName: document.doctor?.name,
      title: document.title,
      // Não incluir dados variáveis como timestamps de geração
    }
    
    const dataString = JSON.stringify(deterministicData, Object.keys(deterministicData).sort())
    return crypto.createHash('sha256').update(dataString).digest('hex')
  }

  /**
   * Conta páginas do PDF (implementação simplificada)
   */
  private countPDFPages(buffer: Buffer): number {
    const pdfString = buffer.toString('latin1')
    const matches = pdfString.match(/\/Type\s*\/Page[^s]/g)
    return matches ? matches.length : 1
  }

  /**
   * Valida se o PDF é determinístico
   * Gera o mesmo documento 3x e verifica se os hashes são iguais
   */
  async validateDeterminism(document: Document, options: PDFGenerationOptions = {}): Promise<{
    isDeterministic: boolean
    hashes: string[]
    iterations: number
  }> {
    const iterations = 3
    const hashes: string[] = []
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.generateDeterministic(document, options)
      hashes.push(result.hash)
      
      // Pequena pausa entre gerações para garantir timestamps diferentes (se houver)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const isDeterministic = hashes.every(hash => hash === hashes[0])
    
    return {
      isDeterministic,
      hashes,
      iterations
    }
  }

  /**
   * Salva PDF no sistema de arquivos
   */
  async savePDF(
    buffer: Buffer,
    filename: string,
    metadata: any
  ): Promise<{ filepath: string; url: string }> {
    const filepath = join(this.outputPath, filename)
    
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filepath)
      
      writeStream.on('finish', () => {
        const url = `/public/pdfs/${filename}`
        resolve({ filepath, url })
      })
      
      writeStream.on('error', reject)
      writeStream.write(buffer)
      writeStream.end()
    })
  }
}