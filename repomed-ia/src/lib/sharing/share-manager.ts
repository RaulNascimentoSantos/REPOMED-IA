import { db } from '@/lib/db'
import { shares, documents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateShareToken } from '@/lib/medical/document-utils'

export interface ShareConfig {
  documentId: string
  expiresInDays?: number
  password?: string
  allowDownload?: boolean
  maxViews?: number
}

export interface ShareLink {
  id: string
  token: string
  url: string
  expiresAt: Date
  isActive: boolean
}

export class ShareManager {
  async createShareLink(config: ShareConfig): Promise<ShareLink> {
    const token = generateShareToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (config.expiresInDays || 7))

    const [share] = await db.insert(shares).values({
      documentId: config.documentId,
      token,
      expiresAt,
      password: config.password,
      allowDownload: config.allowDownload ?? true,
      maxViews: config.maxViews,
      viewCount: 0,
      isActive: true,
    }).returning()

    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${token}`

    return {
      id: share.id,
      token: share.token,
      url,
      expiresAt: share.expiresAt,
      isActive: share.isActive,
    }
  }

  async getShareInfo(token: string) {
    const [share] = await db
      .select({
        share: shares,
        document: documents,
      })
      .from(shares)
      .innerJoin(documents, eq(shares.documentId, documents.id))
      .where(eq(shares.token, token))
      .limit(1)

    if (!share) {
      throw new Error('Link de compartilhamento não encontrado')
    }

    // Verificar se ainda está ativo
    if (!share.share.isActive) {
      throw new Error('Link de compartilhamento foi desativado')
    }

    // Verificar expiração
    if (share.share.expiresAt < new Date()) {
      // Desativar automaticamente
      await this.deactivateShare(token)
      throw new Error('Link de compartilhamento expirado')
    }

    // Verificar limite de visualizações
    if (share.share.maxViews && share.share.viewCount >= share.share.maxViews) {
      await this.deactivateShare(token)
      throw new Error('Limite de visualizações atingido')
    }

    return share
  }

  async recordView(token: string, password?: string): Promise<void> {
    const share = await this.getShareInfo(token)

    // Verificar senha se necessário
    if (share.share.password && share.share.password !== password) {
      throw new Error('Senha incorreta')
    }

    // Incrementar contador de visualizações
    await db
      .update(shares)
      .set({
        viewCount: share.share.viewCount + 1,
        lastViewedAt: new Date(),
      })
      .where(eq(shares.token, token))
  }

  async deactivateShare(token: string): Promise<void> {
    await db
      .update(shares)
      .set({ isActive: false })
      .where(eq(shares.token, token))
  }

  async getShareStats(documentId: string) {
    const shareList = await db
      .select()
      .from(shares)
      .where(eq(shares.documentId, documentId))

    const activeShares = shareList.filter(share => 
      share.isActive && share.expiresAt > new Date()
    )

    const totalViews = shareList.reduce((sum, share) => sum + share.viewCount, 0)

    return {
      totalShares: shareList.length,
      activeShares: activeShares.length,
      totalViews,
      shares: shareList.map(share => ({
        id: share.id,
        token: share.token,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
        viewCount: share.viewCount,
        isActive: share.isActive,
        hasPassword: !!share.password,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${share.token}`,
      })),
    }
  }

  async cleanupExpiredShares(): Promise<number> {
    const result = await db
      .update(shares)
      .set({ isActive: false })
      .where(
        and(
          eq(shares.isActive, true),
          // expiresAt < now()
        )
      )

    return result.rowCount || 0
  }
}

export const shareManager = new ShareManager()