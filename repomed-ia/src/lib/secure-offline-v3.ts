import { openDB, IDBPDatabase } from 'idb'

export class SecureOfflineStorage {
  private db: IDBPDatabase
  private encryptionKey: CryptoKey
  private readonly DB_NAME = 'repomed-secure-v3'
  private readonly DB_VERSION = 3
  private readonly SALT_KEY = 'repomed:salt:v3'
  private readonly SESSION_KEY = 'repomed:session:key'
  
  async initialize(tenantId: string, sessionKey?: string) {
    // Derivar chave com salt persistente + session key opcional
    this.encryptionKey = await this.deriveKey(tenantId, sessionKey)
    
    // Abrir banco
    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion) {
        // Migração incremental
        if (oldVersion < 1) {
          const docStore = db.createObjectStore('documents', {
            keyPath: 'id'
          })
          docStore.createIndex('status', 'status')
          docStore.createIndex('expiresAt', 'expiresAt')
          docStore.createIndex('tenantId', 'tenantId')
        }
        
        if (oldVersion < 2) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true
          })
          syncStore.createIndex('status', 'status')
          syncStore.createIndex('retryAt', 'retryAt')
          syncStore.createIndex('tenantId', 'tenantId')
        }
        
        if (oldVersion < 3) {
          // Metadata não sensível
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
    
    // Limpar dados expirados
    await this.cleanupExpiredData()
    
    // Agendar limpeza periódica
    this.scheduleCleanup()
  }
  
  private async deriveKey(
    tenantId: string, 
    sessionKey?: string
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    
    // Recuperar ou gerar salt persistente
    let salt: Uint8Array
    const storedSalt = localStorage.getItem(this.SALT_KEY)
    
    if (storedSalt) {
      // Decodificar salt existente
      try {
        salt = Uint8Array.from(
          atob(storedSalt),
          c => c.charCodeAt(0)
        )
      } catch {
        // Salt corrompido, gerar novo
        salt = crypto.getRandomValues(new Uint8Array(32))
        localStorage.setItem(
          this.SALT_KEY,
          btoa(String.fromCharCode(...salt))
        )
      }
    } else {
      // Primeiro uso, gerar salt
      salt = crypto.getRandomValues(new Uint8Array(32))
      localStorage.setItem(
        this.SALT_KEY,
        btoa(String.fromCharCode(...salt))
      )
    }
    
    // Combinar tenant + session + origin para material
    const keyMaterial = `${tenantId}:${sessionKey || 'default'}:${location.origin}`
    
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keyMaterial),
      'PBKDF2',
      false,
      ['deriveKey']
    )
    
    // Derivar chave AES-GCM 256 bits
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100_000, // OWASP recommendation
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false, // Não exportável
      ['encrypt', 'decrypt']
    )
  }
  
  async encryptData(data: any): Promise<{
    encrypted: ArrayBuffer
    iv: Uint8Array
    timestamp: number
  }> {
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12)) // GCM needs 96 bits
    
    const plaintext = encoder.encode(JSON.stringify({
      data,
      timestamp: Date.now(),
      version: 1
    }))
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.encryptionKey,
      plaintext
    )
    
    return {
      encrypted,
      iv,
      timestamp: Date.now()
    }
  }
  
  async decryptData(
    encrypted: ArrayBuffer,
    iv: Uint8Array
  ): Promise<any> {
    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        this.encryptionKey,
        encrypted
      )
      
      const decoder = new TextDecoder()
      const parsed = JSON.parse(decoder.decode(decrypted))
      
      return parsed.data
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }
  
  async saveDocument(
    doc: any,
    options: {
      ttl?: number
      priority?: 'low' | 'normal' | 'high'
    } = {}
  ) {
    const ttl = options.ttl || 7 * 24 * 60 * 60 * 1000 // 7 dias default
    
    // Criptografar dados sensíveis
    const { encrypted, iv, timestamp } = await this.encryptData(doc)
    
    // Salvar com metadados
    const tx = this.db.transaction('documents', 'readwrite')
    
    await tx.store.put({
      id: doc.id,
      tenantId: doc.tenantId,
      encryptedData: encrypted,
      iv: Array.from(iv), // Converter para array para IndexedDB
      status: doc.status || 'draft',
      priority: options.priority || 'normal',
      expiresAt: Date.now() + ttl,
      createdAt: timestamp,
      updatedAt: Date.now(),
      // Metadados não sensíveis para busca
      templateType: doc.templateType,
      hasSignature: !!doc.signatureId
    })
    
    await tx.done
  }
  
  async getDocument(id: string): Promise<any> {
    const tx = this.db.transaction('documents', 'readonly')
    const record = await tx.store.get(id)
    
    if (!record) return null
    
    // Verificar expiração
    if (record.expiresAt < Date.now()) {
      await this.deleteDocument(id)
      return null
    }
    
    // Descriptografar
    try {
      return await this.decryptData(
        record.encryptedData,
        new Uint8Array(record.iv)
      )
    } catch (error) {
      console.error(`Failed to decrypt document ${id}:`, error)
      // Remover documento corrompido
      await this.deleteDocument(id)
      return null
    }
  }
  
  async deleteDocument(id: string) {
    const tx = this.db.transaction('documents', 'readwrite')
    await tx.store.delete(id)
    await tx.done
  }
  
  private scheduleCleanup() {
    // Limpar a cada hora
    setInterval(() => {
      this.cleanupExpiredData().catch(console.error)
    }, 60 * 60 * 1000)
  }
  
  async cleanupExpiredData() {
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    
    // Limpar documentos expirados
    const docTx = this.db.transaction('documents', 'readwrite')
    const expiredDocs = await docTx.store.index('expiresAt').getAllKeys(
      IDBKeyRange.upperBound(now)
    )
    
    for (const key of expiredDocs) {
      await docTx.store.delete(key)
    }
    await docTx.done
    
    // Limpar fila de sync antiga
    const syncTx = this.db.transaction('syncQueue', 'readwrite')
    const oldSync = await syncTx.store.getAll()
    
    for (const item of oldSync) {
      if (item.createdAt < thirtyDaysAgo && item.status === 'failed') {
        await syncTx.store.delete(item.id)
      }
    }
    await syncTx.done
  }
  
  async clearAll() {
    // Limpar tudo (logout)
    const tx = this.db.transaction(
      ['documents', 'syncQueue', 'metadata'],
      'readwrite'
    )
    
    await Promise.all([
      tx.objectStore('documents').clear(),
      tx.objectStore('syncQueue').clear(),
      tx.objectStore('metadata').clear()
    ])
    
    await tx.done
    
    // Limpar salt também (forçar nova derivação)
    localStorage.removeItem(this.SALT_KEY)
    localStorage.removeItem(this.SESSION_KEY)
  }
}