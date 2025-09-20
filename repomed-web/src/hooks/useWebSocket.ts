import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  id?: string;
}

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
  lastError: string | null;
}

export function useWebSocket(config: WebSocketConfig) {
  const {
    url,
    protocols,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onError,
    onMessage
  } = config;

  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0,
    lastError: null
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<WebSocketMessage[]>([]);

  const connect = useCallback(() => {
    if (state.isConnected || state.isConnecting) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, lastError: null }));

    try {
      const socket = new WebSocket(url, protocols);

      socket.onopen = (event) => {
        console.log('WebSocket connected:', url);
        setState(prev => ({
          ...prev,
          socket,
          isConnected: true,
          isConnecting: false,
          reconnectCount: 0,
          lastError: null
        }));

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            socket.send(JSON.stringify(message));
          }
        }

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({
                type: 'ping',
                payload: {},
                timestamp: new Date().toISOString()
              }));
            }
          }, heartbeatInterval);
        }

        onOpen?.(event);
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle pong response
          if (message.type === 'pong') {
            return;
          }

          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);

        setState(prev => ({
          ...prev,
          socket: null,
          isConnected: false,
          isConnecting: false
        }));

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        onClose?.(event);

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && state.reconnectCount < maxReconnectAttempts) {
          setState(prev => ({ ...prev, reconnectCount: prev.reconnectCount + 1 }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setState(prev => ({
          ...prev,
          lastError: 'Connection error',
          isConnecting: false
        }));
        onError?.(event);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        isConnecting: false
      }));
    }
  }, [url, protocols, onOpen, onClose, onError, onMessage, reconnectInterval, maxReconnectAttempts, heartbeatInterval, state.isConnected, state.isConnecting, state.reconnectCount]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (state.socket) {
      state.socket.close(1000, 'Manual disconnect');
    }

    setState(prev => ({
      ...prev,
      socket: null,
      isConnected: false,
      isConnecting: false,
      reconnectCount: 0
    }));
  }, [state.socket]);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (state.isConnected && state.socket) {
      state.socket.send(JSON.stringify(fullMessage));
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(fullMessage);
    }
  }, [state.isConnected, state.socket]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectCount: state.reconnectCount,
    lastError: state.lastError,
    connect,
    disconnect,
    sendMessage
  };
}

// Specialized hook for Kanban real-time updates
export function useKanbanWebSocket() {
  const { addNotification } = useNotifications();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'task_moved':
        setLastUpdate(`Task "${message.payload.title}" moved by ${message.payload.user}`);
        addNotification({
          type: 'info',
          title: '🔄 Kanban atualizado',
          message: `${message.payload.user} moveu "${message.payload.title}"`,
          duration: 3000
        });
        break;

      case 'task_added':
        setLastUpdate(`New task "${message.payload.title}" added by ${message.payload.user}`);
        addNotification({
          type: 'success',
          title: '➕ Nova tarefa',
          message: `${message.payload.user} adicionou "${message.payload.title}"`,
          duration: 3000
        });
        break;

      case 'task_deleted':
        setLastUpdate(`Task "${message.payload.title}" deleted by ${message.payload.user}`);
        addNotification({
          type: 'warning',
          title: '🗑️ Tarefa removida',
          message: `${message.payload.user} removeu "${message.payload.title}"`,
          duration: 3000
        });
        break;

      case 'pipeline_started':
        addNotification({
          type: 'info',
          title: '🚀 Pipeline iniciado',
          message: `Pipeline para "${message.payload.taskTitle}" foi iniciado`,
          duration: 4000
        });
        break;

      case 'pipeline_completed':
        addNotification({
          type: message.payload.success ? 'success' : 'error',
          title: message.payload.success ? '✅ Pipeline concluído' : '❌ Pipeline falhou',
          message: `Pipeline para "${message.payload.taskTitle}" ${message.payload.success ? 'concluído' : 'falhou'}`,
          duration: message.payload.success ? 4000 : 6000
        });
        break;

      case 'users_update':
        setConnectedUsers(message.payload.users || []);
        break;

      case 'system_notification':
        addNotification({
          type: message.payload.type || 'info',
          title: message.payload.title,
          message: message.payload.message,
          duration: message.payload.duration || 5000
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, [addNotification]);

  const handleOpen = useCallback(() => {
    addNotification({
      type: 'success',
      title: '🔗 Conectado',
      message: 'Conectado ao sistema de atualizações em tempo real',
      duration: 3000
    });
  }, [addNotification]);

  const handleClose = useCallback(() => {
    addNotification({
      type: 'warning',
      title: '🔌 Desconectado',
      message: 'Conexão perdida. Tentando reconectar...',
      duration: 4000
    });
  }, [addNotification]);

  const handleError = useCallback(() => {
    addNotification({
      type: 'error',
      title: '❌ Erro de conexão',
      message: 'Erro na conexão WebSocket. Verifique sua rede.',
      duration: 5000
    });
  }, [addNotification]);

  // Get WebSocket URL from environment or fallback
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8082/ws/kanban';

  const websocket = useWebSocket({
    url: wsUrl,
    onOpen: handleOpen,
    onClose: handleClose,
    onError: handleError,
    onMessage: handleMessage,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000
  });

  const broadcastTaskMove = useCallback((taskId: string, taskTitle: string, fromStatus: string, toStatus: string, user: string) => {
    websocket.sendMessage({
      type: 'task_moved',
      payload: {
        taskId,
        title: taskTitle,
        fromStatus,
        toStatus,
        user,
        timestamp: new Date().toISOString()
      }
    });
  }, [websocket]);

  const broadcastTaskAdd = useCallback((taskId: string, taskTitle: string, user: string) => {
    websocket.sendMessage({
      type: 'task_added',
      payload: {
        taskId,
        title: taskTitle,
        user,
        timestamp: new Date().toISOString()
      }
    });
  }, [websocket]);

  const broadcastTaskDelete = useCallback((taskId: string, taskTitle: string, user: string) => {
    websocket.sendMessage({
      type: 'task_deleted',
      payload: {
        taskId,
        title: taskTitle,
        user,
        timestamp: new Date().toISOString()
      }
    });
  }, [websocket]);

  return {
    ...websocket,
    lastUpdate,
    connectedUsers,
    broadcastTaskMove,
    broadcastTaskAdd,
    broadcastTaskDelete
  };
}