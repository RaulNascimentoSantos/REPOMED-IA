import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { formatMedicalDocument } from '@/lib/medical/document-utils'

export interface DocumentData {
  id: string
  templateId: string
  patientName: string
  data: Record<string, any>
  hash: string
  template: any
}

export class PDFGenerator {
  private doc: jsPDF
  private currentY: number = 20
  private pageWidth: number = 210
  private pageHeight: number = 297
  private margin: number = 20

  constructor() {
    this.doc = new jsPDF()
  }

  async generateMedicalDocument(documentData: DocumentData): Promise<Uint8Array> {
    this.doc = new jsPDF()
    this.currentY = 20

    // Header com logo e informações da clínica
    await this.addHeader(documentData)
    
    // Título do documento
    this.addTitle(documentData.template.name)
    
    // Conteúdo do documento
    const formattedContent = formatMedicalDocument(documentData.template, documentData.data)
    this.addContent(formattedContent)
    
    // QR Code para verificação
    await this.addQRCode(documentData.hash)
    
    // Rodapé com informações de verificação
    this.addFooter(documentData)

    return this.doc.output('arraybuffer') as Uint8Array
  }

  private async addHeader(documentData: DocumentData) {
    const doctorName = documentData.data.doctorName || 'Dr(a). Nome do Médico'
    const crm = documentData.data.crm || 'CRM/UF XXXXX'
    const specialty = documentData.data.specialty || 'Especialidade'

    // Cabeçalho do médico
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(doctorName, this.margin, this.currentY)
    
    this.currentY += 8
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(crm, this.margin, this.currentY)
    
    this.currentY += 6
    this.doc.text(specialty, this.margin, this.currentY)
    
    this.currentY += 15
    
    // Linha separadora
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  private addTitle(title: string) {
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    
    // Centralizar o título
    const titleWidth = this.doc.getStringUnitWidth(title) * 18 / this.doc.internal.scaleFactor
    const titleX = (this.pageWidth - titleWidth) / 2
    
    this.doc.text(title, titleX, this.currentY)
    this.currentY += 20
  }

  private addContent(content: string) {
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    
    // Quebrar o texto em linhas que cabem na página
    const lines = this.doc.splitTextToSize(content, this.pageWidth - (2 * this.margin))
    
    lines.forEach((line: string) => {
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage()
        this.currentY = 20
      }
      
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 6
    })
    
    this.currentY += 10
  }

  private async addQRCode(hash: string) {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${hash}`
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 80,
        margin: 1
      })
      
      // Posicionar QR code no canto inferior direito
      const qrSize = 25
      const qrX = this.pageWidth - this.margin - qrSize
      const qrY = this.pageHeight - 40
      
      this.doc.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize)
      
      // Texto explicativo do QR code
      this.doc.setFontSize(8)
      this.doc.text('Verificação digital', qrX, qrY - 2)
      
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
    }
  }

  private addFooter(documentData: DocumentData) {
    const footerY = this.pageHeight - 20
    
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'italic')
    
    // Data de emissão
    const issueDate = new Date().toLocaleDateString('pt-BR')
    this.doc.text(`Emitido em: ${issueDate}`, this.margin, footerY)
    
    // Hash do documento (primeiros 16 caracteres)
    const shortHash = documentData.hash.substring(0, 16)
    this.doc.text(`ID: ${shortHash}`, this.margin, footerY + 4)
    
    // URL de verificação
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'}/verify/${documentData.hash}`
    this.doc.text(`Verificar em: ${verificationUrl}`, this.margin, footerY + 8)
    
    // Aviso sobre autenticidade
    const authenticityText = 'Este documento possui assinatura digital. Verifique sua autenticidade através do QR Code ou URL acima.'
    const wrappedText = this.doc.splitTextToSize(authenticityText, this.pageWidth - (2 * this.margin))
    
    let textY = footerY + 12
    wrappedText.forEach((line: string) => {
      this.doc.text(line, this.margin, textY)
      textY += 3
    })
  }
}

// Função utilitária para gerar PDF
export async function generateDocumentPDF(documentData: DocumentData): Promise<Uint8Array> {
  const generator = new PDFGenerator()
  return await generator.generateMedicalDocument(documentData)
}