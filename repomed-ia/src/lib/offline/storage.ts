// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'RepoMedOffline'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const documentsStore = db.createObjectStore('documents', { keyPath: 'id' })
          documentsStore.createIndex('patientName', 'patientName', { unique: false })
          documentsStore.createIndex('doctorName', 'doctorName', { unique: false })
          documentsStore.createIndex('createdAt', 'createdAt', { unique: false })
          documentsStore.createIndex('synced', 'synced', { unique: false })
        }

        // Templates store
        if (!db.objectStoreNames.contains('templates')) {
          const templatesStore = db.createObjectStore('templates', { keyPath: 'id' })
          templatesStore.createIndex('name', 'name', { unique: false })
          templatesStore.createIndex('category', 'category', { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
          syncStore.createIndex('action', 'action', { unique: false })
          syncStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  async saveDocument(document: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite')
      const store = transaction.objectStore('documents')
      
      const documentWithOfflineFlag = {
        ...document,
        offlineCreated: true,
        synced: false,
        createdAt: new Date().toISOString(),
      }

      const request = store.put(documentWithOfflineFlag)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getDocuments(includeUnsynced = true): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly')
      const store = transaction.objectStore('documents')
      const request = store.getAll()
      
      request.onsuccess = () => {
        let docs = request.result
        if (!includeUnsynced) {
          docs = docs.filter(doc => doc.synced !== false)
        }
        resolve(docs)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getDocumentById(id: string): Promise<any | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly')
      const store = transaction.objectStore('documents')
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite')
      const store = transaction.objectStore('documents')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async markDocumentSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite')
      const store = transaction.objectStore('documents')
      
      // Get the document first
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const document = getRequest.result
        if (document) {
          document.synced = true
          document.syncedAt = new Date().toISOString()
          
          const updateRequest = store.put(document)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async saveTemplate(template: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['templates'], 'readwrite')
      const store = transaction.objectStore('templates')
      const request = store.put(template)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getTemplates(): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['templates'], 'readonly')
      const store = transaction.objectStore('templates')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addToSyncQueue(action: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      
      const queueItem = {
        id: `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        data,
        createdAt: new Date().toISOString(),
        attempts: 0,
      }

      const request = store.put(queueItem)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents', 'templates', 'syncQueue'], 'readwrite')
      
      const clearPromises = [
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('documents').clear()
          req.onsuccess = () => res()
          req.onerror = () => rej(req.error)
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('templates').clear()
          req.onsuccess = () => res()
          req.onerror = () => rej(req.error)
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('syncQueue').clear()
          req.onsuccess = () => res()
          req.onerror = () => rej(req.error)
        })
      ]

      Promise.all(clearPromises)
        .then(() => resolve())
        .catch(reject)
    })
  }
}

export const offlineStorage = new OfflineStorage()

// Network status utilities
export function isOnline(): boolean {
  return navigator.onLine
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Background sync registration
export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log('Background sync registered:', tag)
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }
}