import api from './api';

class UserService {
  // Obter todos os usuários (admin)
  async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.userType) params.append('userType', filters.userType);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  // Obter estatísticas de usuários (admin)
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      throw error;
    }
  }

  // Obter usuário por ID
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário (admin)
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Desativar/ativar usuário (admin)
  async toggleUserStatus(userId) {
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  }

  // Obter oficinas (para admin)
  async getWorkshops(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/workshops?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
      throw error;
    }
  }

  // Aprovar/rejeitar oficina (admin)
  async updateWorkshopStatus(workshopId, status, reason = '') {
    try {
      const response = await api.patch(`/workshops/${workshopId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da oficina:', error);
      throw error;
    }
  }

  // Obter dados do dashboard admin
  async getAdminDashboardData() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard admin:', error);
      throw error;
    }
  }

  // Obter relatórios financeiros (admin)
  async getFinancialReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.workshopId) params.append('workshopId', filters.workshopId);
      if (filters.type) params.append('type', filters.type);
      
      const response = await api.get(`/admin/financial-reports?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatórios financeiros:', error);
      throw error;
    }
  }

  // Obter dados de comissão (admin)
  async getCommissionData(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.workshopId) params.append('workshopId', filters.workshopId);
      
      const response = await api.get(`/admin/commission-data?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de comissão:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;