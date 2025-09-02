// CORREÇÃO CRÍTICA 4: OFFLINE ROBUSTO COM CRIPTOGRAFIA LOCAL
// Data: 31/08/2025 - Prioridade: P0

import { openDB } from 'idb'

class SecureOfflineStorage {
  constructor() {
    this.db = null
    this.encryptionKey = null
    this.DB_NAME = 'repomed-secure'
    this.DB_VERSION = 1
  }
  
  async initialize(tenantId) {
    try {
      // Derivar chave única por tenant/sessão
      this.encryptionKey = await this.deriveKey(tenantId)
      
      // Abrir banco com estrutura segura
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Store para documentos offline
          if (!db.objectStoreNames.contains('documents')) {
            const store = db.createObjectStore('documents', { 
              keyPath: 'id',
              autoIncrement: false 
            })
            store.createIndex('status', 'status')
            store.createIndex('expiresAt', 'expiresAt')
          }
          
          // Store para fila de sincronização
          if (!db.objectStoreNames.contains('syncQueue')) {
            const queue = db.createObjectStore('syncQueue', {
              keyPath: 'id',
              autoIncrement: true
            })
            queue.createIndex('status', 'status')
            queue.createIndex('retryAt', 'retryAt')
          }
          
          // Store para metadados (não sensível)
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' })
          }
        }
      })
      
      // Limpar dados expirados ao inicializar
      await this.cleanupExpiredData()
      
      console.log('✅ Secure offline storage initialized')
    } catch (error) {
      console.error('❌ Failed to initialize secure storage:', error)
      throw error
    }
  }
  
  async deriveKey(tenantId) {
    try {
      // Usar PBKDF2 para derivar chave do tenant + salt único
      const encoder = new TextEncoder()
      
      // Recuperar ou gerar salt
      let salt = localStorage.getItem('repomed-salt')
      if (salt) {
        salt = new Uint8Array(atob(salt).split('').map(c => c.charCodeAt(0)))
      } else {
        salt = crypto.getRandomValues(new Uint8Array(16))
        localStorage.setItem('repomed-salt', btoa(String.fromCharCode(...salt)))
      }
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(tenantId + window.location.origin),
        'PBKDF2',
        false,
        ['deriveKey']
      )
      
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
    } catch (error) {
      console.error('Key derivation failed:', error)
      throw new Error('Failed to derive encryption key')
    }
  }
  
  async encryptData(data) {
    try {
      const encoder = new TextEncoder()
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encoder.encode(JSON.stringify(data))
      )
      
      return { encrypted, iv }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }
  
  async decryptData(encrypted, iv) {
    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encrypted
      )
      
      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(decrypted))
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }
  
  async saveDocument(doc, ttl = 7 * 24 * 60 * 60 * 1000) {
    try {
      if (!this.db || !this.encryptionKey) {
        throw new Error('Storage not initialized')
      }
      
      // Criptografar dados sensíveis
      const { encrypted, iv } = await this.encryptData({
        ...doc,
        savedAt: Date.now()
      })
      
      // Salvar com metadados não sensíveis
      const tx = this.db.transaction('documents', 'readwrite')
      await tx.store.put({
        id: doc.id,
        encryptedData: encrypted,
        iv: Array.from(iv),
        status: doc.status || 'draft',
        expiresAt: Date.now() + ttl,
        templateType: doc.templateType, // Metadado não sensível
        createdAt: doc.createdAt
      })
      
      await tx.done
      console.log(`📱 Document ${doc.id} saved offline (encrypted)`)
    } catch (error) {
      console.error('Failed to save document offline:', error)
      throw error
    }
  }
  
  async getDocument(id) {
    try {
      if (!this.db || !this.encryptionKey) {
        throw new Error('Storage not initialized')
      }
      
      const tx = this.db.transaction('documents', 'readonly')
      const encrypted = await tx.store.get(id)
      
      if (!encrypted) return null
      
      // Verificar expiração
      if (encrypted.expiresAt < Date.now()) {
        await this.deleteDocument(id)
        return null
      }
      
      // Descriptografar
      return this.decryptData(
        encrypted.encryptedData,
        new Uint8Array(encrypted.iv)
      )
    } catch (error) {
      console.error('Failed to get document offline:', error)
      return null
    }
  }
  
  async deleteDocument(id) {
    try {
      if (!this.db) return
      
      const tx = this.db.transaction('documents', 'readwrite')
      await tx.store.delete(id)
      await tx.done
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }
  
  async queueForSync(action) {
    try {
      if (!this.db || !this.encryptionKey) {
        throw new Error('Storage not initialized')
      }
      
      const encryptedAction = await this.encryptData(action)
      
      const tx = this.db.transaction('syncQueue', 'readwrite')
      
      await tx.store.add({
        action: {
          encrypted: encryptedAction.encrypted,
          iv: Array.from(encryptedAction.iv)
        },
        status: 'pending',
        attempts: 0,
        retryAt: Date.now(),
        idempotencyKey: crypto.randomUUID(),
        createdAt: Date.now()
      })
      
      await tx.done
      
      // Registrar sync em background
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready
          await registration.sync.register('sync-medical-data')
        } catch (error) {
          console.warn('Background sync not available:', error)
          // Fallback: tentar sync imediatamente
          setTimeout(() => this.processSyncQueue(), 1000)
        }
      }
      
      console.log('📤 Action queued for sync')
    } catch (error) {
      console.error('Failed to queue action:', error)
      throw error
    }
  }
  
  async processSyncQueue() {
    try {
      if (!this.db || !this.encryptionKey) {
        console.warn('Cannot process sync queue: storage not initialized')
        return
      }
      
      const tx = this.db.transaction('syncQueue', 'readwrite')
      const queue = await tx.store.index('status').getAll('pending')
      
      let processed = 0
      
      for (const item of queue) {
        if (item.retryAt > Date.now()) continue
        
        try {
          // Descriptografar ação
          const action = await this.decryptData(
            item.action.encrypted,
            new Uint8Array(item.action.iv)
          )
          
          // Enviar com idempotência
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Idempotency-Key': item.idempotencyKey,
              'X-Tenant-Id': localStorage.getItem('tenantId') || 'default'
            },
            body: JSON.stringify(action)
          })
          
          if (response.ok) {
            await tx.store.delete(item.id)
            processed++
          } else if (response.status === 409) {
            // Conflito - resolver
            const conflict = await response.json()
            await this.resolveConflict(item, conflict)
            await tx.store.delete(item.id)
          } else {
            // Retry com backoff exponencial
            item.attempts++
            item.retryAt = Date.now() + Math.min(
              1000 * Math.pow(2, item.attempts) + Math.random() * 1000,
              300000 // Max 5 min
            )
            
            if (item.attempts > 5) {
              item.status = 'failed'
              console.error(`Sync failed permanently for item ${item.id}`)
            }
            
            await tx.store.put(item)
          }
        } catch (error) {
          console.error('Sync error for item:', item.id, error)
          item.attempts++
          item.status = item.attempts > 5 ? 'failed' : 'pending'
          await tx.store.put(item)
        }
      }
      
      await tx.done
      
      if (processed > 0) {
        console.log(`✅ Synced ${processed} items successfully`)
      }
    } catch (error) {
      console.error('Sync queue processing failed:', error)
    }
  }
  
  async resolveConflict(localItem, serverConflict) {
    // Last-Write-Wins com prioridade para servidor em campos críticos
    const resolved = {
      ...localItem,
      ...serverConflict,
      // Campos que cliente pode sobrescrever
      notes: localItem.updatedAt > serverConflict.updatedAt 
        ? localItem.notes 
        : serverConflict.notes,
      // Campos que servidor sempre vence
      signatureStatus: serverConflict.signatureStatus,
      icpSignature: serverConflict.icpSignature,
      // Metadados de resolução
      conflictResolved: true,
      resolutionStrategy: 'lww-hybrid',
      resolvedAt: Date.now()
    }
    
    console.log('🔄 Conflict resolved using LWW strategy')
    
    // Reenviar resolvido
    await this.queueForSync(resolved)
  }
  
  async cleanupExpiredData() {
    try {
      if (!this.db) return
      
      const tx = this.db.transaction(['documents', 'syncQueue'], 'readwrite')
      
      // Limpar documentos expirados
      const docs = await tx.objectStore('documents').getAll()
      const now = Date.now()
      let expired = 0
      
      for (const doc of docs) {
        if (doc.expiresAt && doc.expiresAt < now) {
          await tx.objectStore('documents').delete(doc.id)
          expired++
        }
      }
      
      // Limpar fila de sync antiga (>30 dias)
      const queue = await tx.objectStore('syncQueue').getAll()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
      let oldItems = 0
      
      for (const item of queue) {
        if (item.createdAt < thirtyDaysAgo) {
          await tx.objectStore('syncQueue').delete(item.id)
          oldItems++
        }
      }
      
      await tx.done
      
      if (expired > 0 || oldItems > 0) {
        console.log(`🧹 Cleanup: ${expired} expired docs, ${oldItems} old sync items`)
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }
  
  async clearAll() {
    try {
      if (!this.db) return
      
      // Limpar tudo (logout/troca de tenant)
      const tx = this.db.transaction(['documents', 'syncQueue', 'metadata'], 'readwrite')
      await tx.objectStore('documents').clear()
      await tx.objectStore('syncQueue').clear()
      await tx.objectStore('metadata').clear()
      await tx.done
      
      // Limpar salt também
      localStorage.removeItem('repomed-salt')
      
      console.log('🧹 All offline data cleared')
    } catch (error) {
      console.error('Failed to clear offline data:', error)
    }
  }
  
  async getStats() {
    try {
      if (!this.db) return { documents: 0, syncQueue: 0 }
      
      const tx = this.db.transaction(['documents', 'syncQueue'], 'readonly')
      const [documents, syncQueue] = await Promise.all([
        tx.objectStore('documents').count(),
        tx.objectStore('syncQueue').count()
      ])
      
      return { documents, syncQueue }
    } catch (error) {
      console.error('Failed to get offline stats:', error)
      return { documents: 0, syncQueue: 0 }
    }
  }
}

export default SecureOfflineStorage