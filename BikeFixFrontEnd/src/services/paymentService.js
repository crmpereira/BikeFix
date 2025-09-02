import api from './api';

class PaymentService {
  // Criar preferência de pagamento
  async createPaymentPreference(paymentData) {
    try {
      const response = await api.post('/payments/create-preference', paymentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      throw error;
    }
  }

  // Verificar status do pagamento
  async getPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw error;
    }
  }

  // Buscar pagamentos do usuário
  async getUserPayments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/payments/user?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pagamentos do usuário:', error);
      throw error;
    }
  }

  // Buscar pagamentos por agendamento
  async getPaymentsByAppointment(appointmentId) {
    try {
      const response = await api.get(`/payments/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pagamentos do agendamento:', error);
      throw error;
    }
  }

  // Processar reembolso (apenas para admins)
  async processRefund(paymentId, refundData) {
    try {
      const response = await api.post(`/payments/refund/${paymentId}`, refundData);
      return response.data;
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      throw error;
    }
  }

  // Obter estatísticas de pagamento (para oficinas e admins)
  async getPaymentStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.workshopId) params.append('workshopId', filters.workshopId);

      const response = await api.get(`/payments/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de pagamento:', error);
      throw error;
    }
  }

  // Validar dados de pagamento
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.appointmentId) {
      errors.push('ID do agendamento é obrigatório');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Valor do pagamento deve ser maior que zero');
    }

    if (!paymentData.description) {
      errors.push('Descrição do pagamento é obrigatória');
    }

    if (!paymentData.payer?.email) {
      errors.push('Email do pagador é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatar valor monetário
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Obter status legível do pagamento
  getPaymentStatusText(status) {
    const statusMap = {
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'authorized': 'Autorizado',
      'in_process': 'Em processamento',
      'in_mediation': 'Em mediação',
      'rejected': 'Rejeitado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado',
      'charged_back': 'Estornado'
    };

    return statusMap[status] || status;
  }

  // Obter cor do status para UI
  getPaymentStatusColor(status) {
    const colorMap = {
      'pending': 'yellow',
      'approved': 'green',
      'authorized': 'blue',
      'in_process': 'blue',
      'in_mediation': 'orange',
      'rejected': 'red',
      'cancelled': 'gray',
      'refunded': 'purple',
      'charged_back': 'red'
    };

    return colorMap[status] || 'gray';
  }
}

export const paymentService = new PaymentService();
export default paymentService;