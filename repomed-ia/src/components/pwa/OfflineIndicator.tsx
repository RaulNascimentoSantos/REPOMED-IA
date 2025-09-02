'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react'
import { isOnline, onNetworkChange, registerBackgroundSync } from '@/lib/offline/storage'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [syncPending, setSyncPending] = useState(false)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    // Set initial online status
    setOnline(isOnline())

    // Listen for network changes
    const cleanup = onNetworkChange((isOnlineNow) => {
      setOnline(isOnlineNow)
      
      if (!isOnlineNow) {
        setShowOfflineMessage(true)
      } else {
        // When back online, trigger background sync
        registerBackgroundSync('sync-documents')
        setShowOfflineMessage(false)
        
        // Check for pending sync
        checkPendingSync()
      }
    })

    // Check for pending sync on load
    checkPendingSync()

    return cleanup
  }, [])

  const checkPendingSync = async () => {
    try {
      // Check if there are unsaved documents in IndexedDB
      const { offlineStorage } = await import('@/lib/offline/storage')
      await offlineStorage.init()
      const documents = await offlineStorage.getDocuments(false)
      const unsyncedDocs = documents.filter(doc => doc.synced === false)
      setSyncPending(unsyncedDocs.length > 0)
    } catch (error) {
      console.error('Error checking pending sync:', error)
    }
  }

  const handleSyncNow = async () => {
    try {
      await registerBackgroundSync('sync-documents')
      setSyncPending(false)
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  // Online status indicator (always show in top bar)
  return (
    <>
      {/* Online/Offline status in top bar */}
      <div className="flex items-center gap-2">
        {online ? (
          <div className="flex items-center gap-1 text-green-600">
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-medium">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">Offline</span>
          </div>
        )}
        
        {syncPending && online && (
          <Button
            onClick={handleSyncNow}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Sincronizar
          </Button>
        )}
      </div>

      {/* Offline message */}
      {showOfflineMessage && (
        <div className="fixed top-16 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96">
          <Card className="border-orange-200 bg-orange-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                    Modo Offline Ativado
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Você está trabalhando offline. Seus documentos serão salvos localmente e sincronizados quando a conexão for restabelecida.
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <WifiOff className="w-3 h-3" />
                    <span>Funcionalidade limitada disponível</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowOfflineMessage(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync pending notification */}
      {syncPending && online && (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
          <Card className="border-blue-200 bg-blue-50 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-xs text-gray-700">
                    Sincronizando documentos offline...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Hook for using offline state in components
export function useOfflineState() {
  const [online, setOnline] = useState(true)
  const [syncPending, setSyncPending] = useState(false)

  useEffect(() => {
    setOnline(isOnline())
    
    const cleanup = onNetworkChange((isOnlineNow) => {
      setOnline(isOnlineNow)
      
      if (isOnlineNow) {
        registerBackgroundSync('sync-documents')
      }
    })

    return cleanup
  }, [])

  const forcSync = async () => {
    if (online) {
      await registerBackgroundSync('sync-documents')
    }
  }

  return {
    online,
    syncPending,
    forceSync: forcSync,
  }
}