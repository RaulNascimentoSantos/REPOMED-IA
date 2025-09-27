import * as React from 'react';
import { api } from '../../lib/api';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Buscar notificações
  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/notifications') as any;
      const data = Array.isArray(response.data) ? response.data : response;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Notificações não disponíveis, usando mock');
      // Mock de notificações para demonstração
      setNotifications([
        {
          id: '1',
          title: 'Novo documento assinado',
          message: 'Dr. João Silva assinou o documento #1234',
          type: 'success',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: '2',
          title: 'Template atualizado',
          message: 'O template "Receita Simples" foi atualizado',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '3',
          title: 'Backup concluído',
          message: 'Backup diário realizado com sucesso',
          type: 'success',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Carregar notificações apenas ao montar (sem auto-refresh)
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Fechar ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  // Marcar como lida
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch {
      // Apenas atualizar localmente se a API falhar
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };
  
  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // Apenas atualizar localmente se a API falhar
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };
  
  // Deletar notificação
  const deleteNotification = async (id: string) => {
    try {
      await api.del(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      // Apenas remover localmente se a API falhar
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        aria-label="Notificações"
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-base
                         rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl 
                      shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Notificações
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 
                           dark:hover:text-blue-300 transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 
                              border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Carregando notificações...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nenhuma notificação no momento
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors
                              ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-slate-900 dark:text-white 
                                     ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-base text-slate-500 dark:text-slate-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-base text-blue-600 hover:text-blue-700
                                       dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  // Navegar para página de notificações se existir
                  window.location.href = '/notifications';
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 
                         dark:hover:text-blue-300 transition-colors"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}