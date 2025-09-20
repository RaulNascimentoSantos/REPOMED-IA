import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  crm?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Auto-login para desenvolvimento/demo - MODO DESENVOLVIMENTO
    const existingToken = localStorage.getItem('token');
    const existingUser = localStorage.getItem('user');

    if (!existingToken) {
      // Se não há token, criar um token de demo automaticamente
      const demoToken = 'demo-token-' + Date.now();
      const demoUser = {
        id: 'demo-user',
        name: 'Dr. Demo RepoMed',
        email: 'demo@repomed.ai',
        role: 'medico',
        crm: 'CRM/SP 123456'
      };

      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));

      return {
        token: demoToken,
        user: demoUser,
        isLoading: false
      };
    }

    return {
      token: existingToken,
      user: existingUser ? JSON.parse(existingUser) : null,
      isLoading: false
    };
  });

  // Validar token na inicialização
  useEffect(() => {
    if (authState.token && !authState.user) {
      validateToken();
    }
  }, []);

  const validateToken = useCallback(async () => {
    if (!authState.token) return;

    // MODO DESENVOLVIMENTO - Pular validação de token
    if (authState.token.startsWith('demo-token-')) {
      console.log('🚀 MODO DEMO - Token validado automaticamente');
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await api.get('/api/auth/me') as any;

      const user = response.data || response;
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false
      }));
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.warn('Token inválido, fazendo logout');
      // logout(); // DESABILITADO PARA DESENVOLVIMENTO
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [authState.token]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/api/auth/login', credentials) as any;
      const { token, user } = response.data || response;
      
      setAuthState({
        token,
        user,
        isLoading: false
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      // Tratar erros RFC 7807
      const errorDetail = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erro ao fazer login';
      
      return { success: false, error: errorDetail };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      token: null,
      user: null,
      isLoading: false
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirecionar para login se não estiver já lá
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }, []);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    crm?: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/api/auth/register', userData) as any;
      const { token, user } = response.data || response;
      
      setAuthState({
        token,
        user,
        isLoading: false
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const errorDetail = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Erro ao registrar usuário';
      
      return { success: false, error: errorDetail };
    }
  }, []);

  return {
    ...authState,
    isAuthenticated: !!authState.token,
    login,
    logout,
    register,
    validateToken
  };
}