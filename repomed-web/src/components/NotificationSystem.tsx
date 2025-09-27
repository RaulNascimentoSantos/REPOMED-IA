'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X, Bell } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = 5000
}: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? defaultDuration
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove if not persistent and has duration
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, newNotification.duration);
    }

    // Remove oldest if exceeding max
    if (state.notifications.length >= maxNotifications) {
      const oldestId = state.notifications[0]?.id;
      if (oldestId) {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: oldestId });
      }
    }

    return id;
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotifications();

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-700'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700'
    }
  };

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl hover:scale-105
        animate-slide-in-right
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`mt-1 text-sm ${config.textColor}`}>
              {notification.message}
            </p>
          )}
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={notification.action.onClick}
                className={`
                  text-sm font-medium underline hover:no-underline
                  ${config.textColor} hover:${config.titleColor}
                `}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => removeNotification(notification.id)}
            className={`
              inline-flex rounded-md p-1.5 hover:bg-white hover:bg-opacity-20
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${config.textColor} hover:${config.titleColor}
            `}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm space-y-4 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}

// Notification hooks for common use cases
export function useKanbanNotifications() {
  const { addNotification } = useNotifications();

  return {
    notifyTaskMoved: (taskTitle: string, fromStatus: string, toStatus: string) => {
      addNotification({
        type: 'info',
        title: 'Tarefa movida',
        message: `"${taskTitle}" foi movida de "${fromStatus}" para "${toStatus}"`,
        duration: 3000
      });
    },

    notifyTaskAdded: (taskTitle: string) => {
      addNotification({
        type: 'success',
        title: 'Nova tarefa criada',
        message: `"${taskTitle}" foi adicionada ao backlog`,
        duration: 3000
      });
    },

    notifyPipelineStarted: (taskTitle: string, jobId: string) => {
      addNotification({
        type: 'info',
        title: '🚀 Pipeline iniciado',
        message: `Pipeline para "${taskTitle}" foi iniciado`,
        duration: 4000,
        action: {
          label: 'Ver detalhes',
          onClick: () => console.log('View job:', jobId)
        }
      });
    },

    notifyPipelineCompleted: (taskTitle: string, jobId: string, success: boolean) => {
      addNotification({
        type: success ? 'success' : 'error',
        title: success ? '✅ Pipeline concluído' : '❌ Pipeline falhou',
        message: `Pipeline para "${taskTitle}" ${success ? 'foi concluído com sucesso' : 'falhou'}`,
        duration: success ? 5000 : 8000,
        action: {
          label: 'Ver logs',
          onClick: () => console.log('View logs:', jobId)
        }
      });
    },

    notifyImportSuccess: (count: number) => {
      addNotification({
        type: 'success',
        title: 'Importação concluída',
        message: `${count} tarefas foram importadas com sucesso`,
        duration: 4000
      });
    },

    notifyImportError: (error: string) => {
      addNotification({
        type: 'error',
        title: 'Erro na importação',
        message: error,
        duration: 7000
      });
    },

    notifyExportSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Arquivo CSV foi baixado com sucesso',
        duration: 3000
      });
    },

    notifyWIPLimitReached: (columnTitle: string, limit: number) => {
      addNotification({
        type: 'warning',
        title: 'Limite WIP atingido',
        message: `A coluna "${columnTitle}" atingiu o limite de ${limit} tarefas`,
        duration: 5000
      });
    },

    notifyConnectionError: () => {
      addNotification({
        type: 'error',
        title: 'Erro de conexão',
        message: 'Não foi possível conectar com o servidor. Tentando reconectar...',
        persistent: true
      });
    },

    notifyConnectionRestored: () => {
      addNotification({
        type: 'success',
        title: 'Conexão restaurada',
        message: 'A conexão com o servidor foi restabelecida',
        duration: 3000
      });
    }
  };
}