import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Mock database para notificações (em produção, use uma tabela real)
const notifications = new Map<string, any>();

const NotificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  userId: z.string()
});

export function registerNotificationRoutes(fastify: FastifyInstance) {
  // Listar notificações do usuário
  fastify.get('/api/notifications', {
    schema: {
      tags: ['Notifications'],
      description: 'Lista notificações do usuário',
      querystring: {
        type: 'object',
        properties: {
          read: { type: 'boolean' },
          type: { type: 'string' },
          limit: { type: 'integer', default: 50 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { read, type, limit = 50 } = request.query as any;
      const userId = 'current-user'; // TODO: pegar do JWT

      // Filtrar notificações do usuário
      let userNotifications = Array.from(notifications.values())
        .filter(n => n.userId === userId);

      if (read !== undefined) {
        userNotifications = userNotifications.filter(n => n.read === read);
      }

      if (type) {
        userNotifications = userNotifications.filter(n => n.type === type);
      }

      // Ordenar por data (mais recente primeiro)
      userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Limitar resultados
      userNotifications = userNotifications.slice(0, limit);

      return {
        success: true,
        data: userNotifications,
        unreadCount: Array.from(notifications.values())
          .filter(n => n.userId === userId && !n.read).length
      };
    } catch (error) {
      fastify.log.error('Erro ao buscar notificações:', error);
      reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Marcar notificação como lida
  fastify.patch('/api/notifications/:id/read', {
    schema: {
      tags: ['Notifications'],
      description: 'Marca uma notificação como lida',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = 'current-user'; // TODO: pegar do JWT

      const notification = notifications.get(id);

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: 'Notificação não encontrada'
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Não autorizado'
        });
      }

      notification.read = true;
      notification.readAt = new Date();
      notifications.set(id, notification);

      return {
        success: true,
        message: 'Notificação marcada como lida'
      };
    } catch (error) {
      fastify.log.error('Erro ao marcar notificação como lida:', error);
      reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Marcar todas as notificações como lidas
  fastify.patch('/api/notifications/read-all', {
    schema: {
      tags: ['Notifications'],
      description: 'Marca todas as notificações como lidas'
    }
  }, async (request, reply) => {
    try {
      const userId = 'current-user'; // TODO: pegar do JWT

      let count = 0;
      for (const [id, notification] of notifications) {
        if (notification.userId === userId && !notification.read) {
          notification.read = true;
          notification.readAt = new Date();
          notifications.set(id, notification);
          count++;
        }
      }

      return {
        success: true,
        message: `${count} notificações marcadas como lidas`
      };
    } catch (error) {
      fastify.log.error('Erro ao marcar todas as notificações como lidas:', error);
      reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Deletar notificação
  fastify.delete('/api/notifications/:id', {
    schema: {
      tags: ['Notifications'],
      description: 'Deleta uma notificação',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = 'current-user'; // TODO: pegar do JWT

      const notification = notifications.get(id);

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: 'Notificação não encontrada'
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'Não autorizado'
        });
      }

      notifications.delete(id);

      return {
        success: true,
        message: 'Notificação deletada com sucesso'
      };
    } catch (error) {
      fastify.log.error('Erro ao deletar notificação:', error);
      reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Criar notificação (para uso interno/admin)
  fastify.post('/api/notifications', {
    schema: {
      tags: ['Notifications'],
      description: 'Cria uma nova notificação',
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          message: { type: 'string' },
          type: { type: 'string', enum: ['info', 'success', 'warning', 'error'] },
          userId: { type: 'string' }
        },
        required: ['title', 'message', 'type', 'userId']
      }
    }
  }, async (request, reply) => {
    try {
      const notificationData = request.body as z.infer<typeof NotificationSchema>;
      const id = uuidv4();

      const notification = {
        id,
        ...notificationData,
        read: false,
        createdAt: new Date(),
        readAt: null
      };

      notifications.set(id, notification);

      return {
        success: true,
        data: notification
      };
    } catch (error) {
      fastify.log.error('Erro ao criar notificação:', error);
      reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // Seed algumas notificações para demo
  const seedNotifications = () => {
    const demoNotifications = [
      {
        id: uuidv4(),
        title: 'Novo paciente cadastrado',
        message: 'João Silva foi cadastrado no sistema',
        type: 'info',
        userId: 'current-user',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
        readAt: null
      },
      {
        id: uuidv4(),
        title: 'Documento assinado',
        message: 'Prescrição para Maria Santos foi assinada digitalmente',
        type: 'success',
        userId: 'current-user',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        readAt: null
      },
      {
        id: uuidv4(),
        title: 'Sistema atualizado',
        message: 'Nova versão do RepoMed IA v3.0 disponível',
        type: 'info',
        userId: 'current-user',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // lida 12h atrás
      }
    ];

    demoNotifications.forEach(notification => {
      notifications.set(notification.id, notification);
    });
  };

  // Inicializar notificações de demo
  seedNotifications();
}