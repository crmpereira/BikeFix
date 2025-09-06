import axios from 'axios';
import Cookies from 'js-cookie';

// Configurar base URL da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    console.log('authService - Token encontrado:', token ? 'Sim' : 'Não');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('authService - Header Authorization definido para:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Se token expirou, apenas remover o token
    // O AuthContext vai detectar e gerenciar o redirecionamento
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // Não fazer redirecionamento automático aqui
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Registro de usuário
  register: async (userData) => {
    console.log('authService - Enviando dados para:', `${API_BASE_URL}/auth/register`);
    console.log('authService - Dados enviados:', userData);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('authService - Resposta recebida:', response);
      return response;
    } catch (error) {
      console.error('authService - Erro na requisição:', error);
      throw error;
    }
  },

  // Login
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  // Logout
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Obter perfil do usuário
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Atualizar perfil
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword) => {
    return await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Solicitar recuperação de senha
  requestPasswordReset: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Redefinir senha
  resetPassword: async (token, newPassword) => {
    return await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  // Verificar email
  verifyEmail: async (token) => {
    return await api.post('/auth/verify-email', { token });
  },

  // Verificar se token é válido
  verifyToken: async () => {
    return await api.get('/auth/verify-token');
  },

  // Reenviar email de verificação
  resendVerificationEmail: async () => {
    return await api.post('/auth/resend-verification');
  },
};

export default api;