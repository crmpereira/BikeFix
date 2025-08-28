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
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
    }
    return Promise.reject(error);
  }
);

class BikeService {
  // Obter todas as bikes do usuário
  async getUserBikes() {
    try {
      const response = await api.get('/users/bikes');
      // O interceptor já retorna response.data, então acessamos response.data diretamente
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar bikes:', error);
      throw error;
    }
  }

  // Adicionar nova bike
  async addBike(bikeData) {
    try {
      const response = await api.post('/users/bikes', bikeData);
      return response.data || response;
    } catch (error) {
      console.error('Erro ao adicionar bike:', error);
      throw error;
    }
  }

  // Atualizar bike existente
  async updateBike(bikeId, bikeData) {
    try {
      const response = await api.put(`/users/bikes/${bikeId}`, bikeData);
      return response.data || response;
    } catch (error) {
      console.error('Erro ao atualizar bike:', error);
      throw error;
    }
  }

  // Deletar bike
  async deleteBike(bikeId) {
    try {
      const response = await api.delete(`/users/bikes/${bikeId}`);
      return response.data || response;
    } catch (error) {
      console.error('Erro ao deletar bike:', error);
      throw error;
    }
  }

  // Validar dados da bike
  validateBikeData(bikeData) {
    const errors = [];

    if (!bikeData.brand || bikeData.brand.trim() === '') {
      errors.push('Marca é obrigatória');
    }

    if (!bikeData.model || bikeData.model.trim() === '') {
      errors.push('Modelo é obrigatório');
    }

    if (!bikeData.year || bikeData.year < 1900 || bikeData.year > new Date().getFullYear() + 1) {
      errors.push('Ano deve ser válido');
    }

    if (!bikeData.type || !['road', 'mountain', 'hybrid', 'electric', 'bmx', 'other'].includes(bikeData.type)) {
      errors.push('Tipo de bike é obrigatório');
    }

    if (bikeData.totalKm && bikeData.totalKm < 0) {
      errors.push('Quilometragem total deve ser um número positivo');
    }

    return errors;
  }

  // Formatar dados da bike para envio
  formatBikeData(formData) {
    return {
      brand: formData.brand?.trim(),
      model: formData.model?.trim(),
      year: parseInt(formData.year),
      type: formData.type,
      serialNumber: formData.serialNumber?.trim() || '',
      purchaseDate: formData.purchaseDate || null,
      lastMaintenance: formData.lastMaintenance || null,
      totalKm: parseFloat(formData.totalKm) || 0
    };
  }

  // Obter tipos de bike disponíveis
  getBikeTypes() {
    return [
      { value: 'road', label: 'Speed/Estrada' },
      { value: 'mountain', label: 'Mountain Bike' },
      { value: 'hybrid', label: 'Híbrida' },
      { value: 'electric', label: 'Elétrica' },
      { value: 'bmx', label: 'BMX' },
      { value: 'other', label: 'Outro' }
    ];
  }
}

const bikeService = new BikeService();
export default bikeService;