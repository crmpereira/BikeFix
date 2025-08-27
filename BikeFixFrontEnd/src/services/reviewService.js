import api from './api';

const reviewService = {
  // Criar nova avaliação
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  },

  // Obter avaliações de uma oficina
  getWorkshopReviews: async (workshopId, params = {}) => {
    try {
      const { page = 1, limit = 10, sort = 'recent' } = params;
      const response = await api.get(`/reviews/workshop/${workshopId}`, {
        params: { page, limit, sort }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avaliações da oficina:', error);
      throw error;
    }
  },

  // Obter avaliações do usuário logado
  getMyReviews: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get('/reviews/my-reviews', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas avaliações:', error);
      throw error;
    }
  },

  // Responder a uma avaliação (apenas oficinas)
  respondToReview: async (reviewId, comment) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/respond`, {
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao responder avaliação:', error);
      throw error;
    }
  },

  // Votar em uma avaliação
  voteReview: async (reviewId, vote) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/vote`, {
        vote // 'helpful' ou 'not_helpful'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao votar em avaliação:', error);
      throw error;
    }
  },

  // Reportar uma avaliação
  reportReview: async (reviewId, reason, description = '') => {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, {
        reason,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao reportar avaliação:', error);
      throw error;
    }
  },

  // Obter estatísticas de avaliações (admin)
  getReviewStats: async () => {
    try {
      const response = await api.get('/reviews/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de avaliações:', error);
      throw error;
    }
  }
};

export default reviewService;