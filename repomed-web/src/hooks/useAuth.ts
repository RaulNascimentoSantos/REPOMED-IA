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
  const [authState, setAuthState] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isLoading: false
  }));

  // Validar token na inicialização
  useEffect(() => {
    if (authState.token && !authState.user) {
      validateToken();
    }
  }, []);

  const validateToken = useCallback(async () => {
    if (!authState.token) return;
    
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      const user = response.data || response;
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false
      }));
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.warn('Token inválido, fazendo logout');
      logout();
    }
  }, [authState.token]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/api/auth/login', credentials);
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
      const response = await api.post('/api/auth/register', userData);
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