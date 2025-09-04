import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  crm?: string;
  uf?: string;
  crmValidated?: boolean;
  lastLogin?: string | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    token: localStorage.getItem('repomed_token'),
    refreshToken: localStorage.getItem('repomed_refresh_token'),
    user: JSON.parse(localStorage.getItem('repomed_user') || 'null'),
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
      const response = await api.get('/api/me', {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      const { user } = response.data;
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false
      }));
      localStorage.setItem('repomed_user', JSON.stringify(user));
    } catch (error) {
      console.warn('Token inválido, tentando refresh...');
      if (authState.refreshToken) {
        try {
          await refreshAuth();
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
  }, [authState.token, authState.refreshToken]);

  const refreshAuth = useCallback(async () => {
    if (!authState.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('/api/auth/refresh', {
        refreshToken: authState.refreshToken
      });

      const { token } = response.data;
      
      setAuthState(prev => ({
        ...prev,
        token,
        isLoading: false
      }));

      localStorage.setItem('repomed_token', token);
      
    } catch (error) {
      // Clear auth data on refresh failure
      setAuthState({
        token: null,
        refreshToken: null,
        user: null,
        isLoading: false
      });
      
      localStorage.removeItem('repomed_token');
      localStorage.removeItem('repomed_refresh_token');
      localStorage.removeItem('repomed_user');
      
      throw error;
    }
  }, [authState.refreshToken]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token, refreshToken, user } = response.data;
      
      setAuthState({
        token,
        refreshToken,
        user,
        isLoading: false
      });
      
      localStorage.setItem('repomed_token', token);
      localStorage.setItem('repomed_refresh_token', refreshToken);
      localStorage.setItem('repomed_user', JSON.stringify(user));
      
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

  const logout = useCallback(async () => {
    // Call logout API if authenticated
    if (authState.token) {
      try {
        await api.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    setAuthState({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false
    });
    
    localStorage.removeItem('repomed_token');
    localStorage.removeItem('repomed_refresh_token');
    localStorage.removeItem('repomed_user');
    
    // Redirecionar para login se não estiver já lá
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }, [authState.token]);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    crm: string;
    uf: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, refreshToken, user } = response.data;
      
      setAuthState({
        token,
        refreshToken,
        user,
        isLoading: false
      });
      
      localStorage.setItem('repomed_token', token);
      localStorage.setItem('repomed_refresh_token', refreshToken);
      localStorage.setItem('repomed_user', JSON.stringify(user));
      
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
    refreshAuth,
    validateToken
  };
}