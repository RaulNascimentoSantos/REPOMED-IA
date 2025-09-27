import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class KanbanWebSocketServer {
  constructor(server, logger) {
    this.logger = logger;
    this.clients = new Map();
    this.rooms = new Map(); // Para diferentes boards/projects
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      startTime: new Date()
    };

    // Criar WebSocket server
    this.wss = new WebSocketServer({
      server,
      path: '/ws/kanban'
    });

    this.setupWebSocketHandlers();
    this.startHeartbeat();

    logger.info('WebSocket server initialized on /ws/kanban');
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, request) => {
      const clientId = uuidv4();
      const userAgent = request.headers['user-agent'] || 'Unknown';
      const ip = request.socket.remoteAddress;

      this.logger.info(`WebSocket client connected: ${clientId} from ${ip}`);

      // Configurar cliente
      const client = {
        id: clientId,
        socket: ws,
        ip,
        userAgent,
        connectedAt: new Date(),
        lastPing: new Date(),
        room: 'default', // board/project room
        user: null, // will be set after authentication
        isAlive: true
      };

      this.clients.set(clientId, client);
      this.stats.totalConnections++;
      this.stats.activeConnections++;

      // Handlers para este cliente
      ws.on('message', (data) => {
        this.handleMessage(client, data);
      });

      ws.on('close', (code, reason) => {
        this.handleDisconnection(client, code, reason);
      });

      ws.on('error', (error) => {
        this.logger.error(`WebSocket error for client ${clientId}:`, error);
        this.handleDisconnection(client, 1006, 'Error');
      });

      // Pong handler para heartbeat
      ws.on('pong', () => {
        client.isAlive = true;
        client.lastPing = new Date();
      });

      // Enviar mensagem de boas-vindas
      this.sendToClient(client, {
        type: 'connection_established',
        payload: {
          clientId,
          serverTime: new Date().toISOString(),
          room: client.room
        }
      });

      // Notificar outros clientes na mesma room
      this.broadcastToRoom(client.room, {
        type: 'user_connected',
        payload: {
          userId: clientId,
          timestamp: new Date().toISOString()
        }
      }, clientId);

      this.updateRoomUsers(client.room);
    });

    this.wss.on('error', (error) => {
      this.logger.error('WebSocket Server error:', error);
    });
  }

  handleMessage(client, data) {
    this.stats.messagesReceived++;

    try {
      const message = JSON.parse(data);

      // Log da mensagem (apenas tipo por segurança)
      this.logger.info(`WebSocket message from ${client.id}: ${message.type}`);

      switch (message.type) {
        case 'ping':
          this.sendToClient(client, {
            type: 'pong',
            payload: {
              timestamp: new Date().toISOString()
            }
          });
          break;

        case 'join_room':
          this.handleJoinRoom(client, message.payload);
          break;

        case 'authenticate':
          this.handleAuthentication(client, message.payload);
          break;

        case 'task_moved':
          this.handleTaskMoved(client, message.payload);
          break;

        case 'task_added':
          this.handleTaskAdded(client, message.payload);
          break;

        case 'task_deleted':
          this.handleTaskDeleted(client, message.payload);
          break;

        case 'task_updated':
          this.handleTaskUpdated(client, message.payload);
          break;

        case 'board_sync':
          this.handleBoardSync(client, message.payload);
          break;

        default:
          this.logger.warn(`Unknown message type from ${client.id}: ${message.type}`);
      }
    } catch (error) {
      this.logger.error(`Error parsing WebSocket message from ${client.id}:`, error);
      this.sendToClient(client, {
        type: 'error',
        payload: {
          message: 'Invalid message format'
        }
      });
    }
  }

  handleDisconnection(client, code, reason) {
    this.logger.info(`WebSocket client disconnected: ${client.id} (${code}: ${reason})`);

    // Remover cliente
    this.clients.delete(client.id);
    this.stats.activeConnections--;

    // Notificar outros clientes na mesma room
    this.broadcastToRoom(client.room, {
      type: 'user_disconnected',
      payload: {
        userId: client.id,
        timestamp: new Date().toISOString()
      }
    });

    this.updateRoomUsers(client.room);
  }

  handleJoinRoom(client, payload) {
    const { room } = payload;

    if (!room || typeof room !== 'string') {
      return this.sendToClient(client, {
        type: 'error',
        payload: { message: 'Invalid room name' }
      });
    }

    // Sair da room atual
    this.broadcastToRoom(client.room, {
      type: 'user_left',
      payload: {
        userId: client.id,
        room: client.room,
        timestamp: new Date().toISOString()
      }
    }, client.id);

    // Entrar na nova room
    client.room = room;

    this.sendToClient(client, {
      type: 'room_joined',
      payload: {
        room,
        timestamp: new Date().toISOString()
      }
    });

    // Notificar outros na nova room
    this.broadcastToRoom(room, {
      type: 'user_joined',
      payload: {
        userId: client.id,
        room,
        timestamp: new Date().toISOString()
      }
    }, client.id);

    this.updateRoomUsers(room);
  }

  handleAuthentication(client, payload) {
    const { user, token } = payload;

    // TODO: Validar token JWT aqui
    // Por agora, aceitar qualquer usuário
    client.user = user;

    this.sendToClient(client, {
      type: 'authenticated',
      payload: {
        user,
        timestamp: new Date().toISOString()
      }
    });

    this.updateRoomUsers(client.room);
  }

  handleTaskMoved(client, payload) {
    const message = {
      type: 'task_moved',
      payload: {
        ...payload,
        user: client.user || client.id,
        timestamp: new Date().toISOString()
      }
    };

    // Broadcast para toda a room exceto o sender
    this.broadcastToRoom(client.room, message, client.id);
  }

  handleTaskAdded(client, payload) {
    const message = {
      type: 'task_added',
      payload: {
        ...payload,
        user: client.user || client.id,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcastToRoom(client.room, message, client.id);
  }

  handleTaskDeleted(client, payload) {
    const message = {
      type: 'task_deleted',
      payload: {
        ...payload,
        user: client.user || client.id,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcastToRoom(client.room, message, client.id);
  }

  handleTaskUpdated(client, payload) {
    const message = {
      type: 'task_updated',
      payload: {
        ...payload,
        user: client.user || client.id,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcastToRoom(client.room, message, client.id);
  }

  handleBoardSync(client, payload) {
    // Enviar estado completo do board para o cliente
    // TODO: Implementar sincronização com banco de dados
    this.sendToClient(client, {
      type: 'board_state',
      payload: {
        // TODO: buscar estado atual do board
        message: 'Board sync not implemented yet',
        timestamp: new Date().toISOString()
      }
    });
  }

  sendToClient(client, message) {
    if (client.socket.readyState === client.socket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
        this.stats.messagesSent++;
      } catch (error) {
        this.logger.error(`Error sending message to client ${client.id}:`, error);
      }
    }
  }

  broadcastToRoom(room, message, excludeClientId = null) {
    for (const [clientId, client] of this.clients) {
      if (client.room === room && clientId !== excludeClientId) {
        this.sendToClient(client, message);
      }
    }
  }

  broadcastToAll(message, excludeClientId = null) {
    for (const [clientId, client] of this.clients) {
      if (clientId !== excludeClientId) {
        this.sendToClient(client, message);
      }
    }
  }

  updateRoomUsers(room) {
    const roomUsers = [];
    for (const [clientId, client] of this.clients) {
      if (client.room === room) {
        roomUsers.push({
          id: clientId,
          user: client.user,
          connectedAt: client.connectedAt
        });
      }
    }

    this.broadcastToRoom(room, {
      type: 'users_update',
      payload: {
        room,
        users: roomUsers,
        count: roomUsers.length,
        timestamp: new Date().toISOString()
      }
    });
  }

  startHeartbeat() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = [...this.clients.values()].find(c => c.socket === ws);

        if (!client) return;

        if (!client.isAlive) {
          this.logger.info(`Terminating dead client: ${client.id}`);
          ws.terminate();
          return;
        }

        client.isAlive = false;
        ws.ping();
      });
    }, 30000); // Check every 30 seconds

    // Cleanup on server close
    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  // Métodos públicos para notificações externas
  notifyPipelineStarted(taskTitle, jobId) {
    this.broadcastToAll({
      type: 'pipeline_started',
      payload: {
        taskTitle,
        jobId,
        timestamp: new Date().toISOString()
      }
    });
  }

  notifyPipelineCompleted(taskTitle, jobId, success, result = null) {
    this.broadcastToAll({
      type: 'pipeline_completed',
      payload: {
        taskTitle,
        jobId,
        success,
        result,
        timestamp: new Date().toISOString()
      }
    });
  }

  notifySystemMessage(type, title, message) {
    this.broadcastToAll({
      type: 'system_notification',
      payload: {
        type,
        title,
        message,
        timestamp: new Date().toISOString()
      }
    });
  }

  getStats() {
    const now = new Date();
    const uptime = Math.floor((now - this.stats.startTime) / 1000);

    return {
      ...this.stats,
      uptime: `${uptime}s`,
      rooms: Array.from(new Set([...this.clients.values()].map(c => c.room))),
      clientsPerRoom: Object.fromEntries(
        Array.from(new Set([...this.clients.values()].map(c => c.room)))
          .map(room => [
            room,
            [...this.clients.values()].filter(c => c.room === room).length
          ])
      )
    };
  }
}

export default KanbanWebSocketServer;