import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Apenas remover o token, deixar o AuthContext gerenciar o redirecionamento
      Cookies.remove('token');
    }
    return Promise.reject(error);
  }
);

const appointmentService = {
  // Testar autenticação
  testAuth: async () => {
    try {
      console.log('appointmentService - Testando autenticação...');
      const response = await api.get('/appointments/test-auth');
      console.log('appointmentService - Teste de autenticação:', response);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('appointmentService - Erro no teste de autenticação:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro no teste de autenticação',
        error: error.response?.data
      };
    }
  },

  // Criar novo agendamento
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      const message = error.response?.data?.message || 'Erro ao criar agendamento';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Buscar agendamentos do usuário
  getUserAppointments: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Adicionar filtros específicos
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        queryParams.append('dateTo', filters.dateTo);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.page) {
        queryParams.append('page', filters.page);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      
      // Adicionar timestamp para evitar cache
      queryParams.append('_t', Date.now().toString());
      
      // Adicionar outros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key] && !['status', 'dateFrom', 'dateTo', 'search', 'page', 'limit'].includes(key)) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/appointments?${queryParams.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Formatar agendamentos para o frontend
      const appointments = response.data.data || response.data || [];
      
      const formattedAppointments = appointments.map(appointment => {
        const formatted = appointmentService.formatAppointmentForFrontend(appointment);
        return {
          ...formatted,
          id: appointment._id // Garantir que o campo id esteja presente
        };
      });
      
      const result = {
        success: true,
        data: formattedAppointments,
        total: response.data.total || response.data.pagination?.total || formattedAppointments.length,
        pagination: response.data.pagination
      };
      
      return result;
      
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      
      const message = error.response?.data?.message || 'Erro ao buscar agendamentos';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Buscar agendamentos da oficina
  getWorkshopAppointments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/appointments/workshop?${params.toString()}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Erro ao buscar agendamentos da oficina:', error);
      const message = error.response?.data?.message || 'Erro ao buscar agendamentos da oficina';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Buscar agendamento por ID
  getAppointmentById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      const message = error.response?.data?.message || 'Erro ao buscar agendamento';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Atualizar status do agendamento
  updateAppointmentStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/appointments/${id}/status`, {
        status,
        notes
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar status';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Cancelar agendamento
  cancelAppointment: async (id, reason = '') => {
    try {
      const response = await api.put(`/appointments/${id}/cancel`, {
        reason
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      const message = error.response?.data?.message || 'Erro ao cancelar agendamento';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Buscar horários disponíveis
  getAvailableSlots: async (workshopId, date) => {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { workshopId, date }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      const message = error.response?.data?.message || 'Erro ao buscar horários disponíveis';
      return {
        success: false,
        message,
        error: error.response?.data
      };
    }
  },

  // Funções utilitárias
  formatAppointmentForFrontend: (appointment) => {
    if (!appointment) return null;

    return {
      id: appointment._id,
      workshop: {
        id: appointment.workshop._id,
        name: appointment.workshop.workshopData?.businessName || appointment.workshop.name,
        address: appointment.workshop.workshopData?.address || {},
        phone: appointment.workshop.workshopData?.phone || '',
        rating: appointment.workshop.workshopData?.rating || 0
      },
      cyclist: appointment.cyclist ? {
        id: appointment.cyclist._id,
        name: appointment.cyclist.name,
        email: appointment.cyclist.email,
        phone: appointment.cyclist.phone
      } : null,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      status: appointment.status,
      serviceType: appointment.serviceType,
      services: appointment.requestedServices || [],
      bikeInfo: appointment.bikeInfo || {},
      description: appointment.description || '',
      urgency: appointment.urgency || 'normal',
      totalPrice: appointment.pricing?.totalPrice || appointment.totalPrice || 0,
      notes: appointment.notes || '',
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
  },

  formatDateForDisplay: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  },

  formatTimeForDisplay: (time) => {
    if (!time) return '';
    return time;
  },

  getStatusLabel: (status) => {
    const statusLabels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusLabels[status] || status;
  },

  getStatusColor: (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'info',
      in_progress: 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  },

  getUrgencyLabel: (urgency) => {
    const urgencyLabels = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta'
    };
    return urgencyLabels[urgency] || urgency;
  },

  getUrgencyColor: (urgency) => {
    const urgencyColors = {
      low: 'success',
      normal: 'info',
      high: 'error'
    };
    return urgencyColors[urgency] || 'default';
  },

  canCancelAppointment: (appointment) => {
    if (!appointment) return false;
    
    // Não permitir cancelamento de agendamentos concluídos
    if (appointment.status === 'completed') {
      return false;
    }
    
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate || appointment.date);
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff > 24 && ['pending', 'confirmed'].includes(appointment.status);
  },

  isPastAppointment: (appointment) => {
    if (!appointment) return false;
    
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    return appointmentDate < now;
  }
};

export default appointmentService;