import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar axios para workshops
const workshopAPI = axios.create({
  baseURL: `${API_BASE_URL}/workshops`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token se necessário
workshopAPI.interceptors.request.use(
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

// Interceptor para tratar respostas
workshopAPI.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Workshop API Error:', error);
    
    if (error.response?.status === 401) {
      // Apenas remover o token, deixar o AuthContext gerenciar o redirecionamento
      Cookies.remove('token');
    }
    
    return Promise.reject({
      message: error.response?.data?.message || 'Erro de conexão com o servidor',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Serviços de workshops
const workshopService = {
  // Buscar todas as oficinas com filtros
  async getWorkshops(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros aos parâmetros
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.services && filters.services.length > 0) {
        filters.services.forEach(service => params.append('services', service));
      }
      if (filters.lat) params.append('lat', filters.lat);
      if (filters.lng) params.append('lng', filters.lng);
      if (filters.radius) params.append('radius', filters.radius);
      
      const queryString = params.toString();
      const url = queryString ? `/?${queryString}` : '/';
      
      const response = await workshopAPI.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar oficina por ID
  async getWorkshopById(id) {
    try {
      const response = await workshopAPI.get(`/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar oficinas próximas
  async getNearbyWorkshops(lat, lng, radius = 10, additionalFilters = {}) {
    try {
      const filters = {
        lat,
        lng,
        radius,
        ...additionalFilters
      };
      
      return await this.getWorkshops(filters);
    } catch (error) {
      throw error;
    }
  },

  // Buscar serviços de uma oficina
  async getWorkshopServices(id) {
    try {
      const response = await workshopAPI.get(`/${id}/services`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Buscar oficinas por localização do usuário
  async getWorkshopsByLocation(additionalFilters = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Fallback: buscar todas as oficinas
        this.getWorkshops(additionalFilters).then(resolve).catch(reject);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await this.getNearbyWorkshops(latitude, longitude, 20, additionalFilters);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          // Fallback: buscar todas as oficinas
          this.getWorkshops(additionalFilters).then(resolve).catch(reject);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      );
    });
  },

  // Buscar todas as oficinas (sem filtros)
  async getAllWorkshops() {
    try {
      const response = await workshopAPI.get('/');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Formatar dados da oficina para compatibilidade com o frontend
  formatWorkshopForFrontend(workshop) {
    return {
      id: workshop.id,
      name: workshop.name,
      owner: workshop.owner,
      email: workshop.email,
      phone: workshop.phone,
      description: workshop.description,
      city: workshop.address?.city || '',
      state: workshop.address?.state || '',
      address: workshop.address?.street || '',
      zipCode: workshop.address?.zipCode || '',
      coordinates: workshop.address?.coordinates || null,
      workingHours: workshop.workingHours || {},
      services: workshop.services || [],
      serviceNames: workshop.services?.map(service => service.name) || [],
      rating: workshop.rating?.average || 0,
      ratingCount: workshop.rating?.count || 0,
      verified: workshop.verified || false,
      cnpj: workshop.cnpj || '',
      priceRange: this.calculatePriceRange(workshop.services || []),
      openHours: this.formatOpenHours(workshop.workingHours || {}),
      distance: workshop.distance ? `${workshop.distance} km` : null,
      image: null // Placeholder para futuras implementações
    };
  },

  // Calcular faixa de preços dos serviços
  calculatePriceRange(services) {
    if (!services || services.length === 0) return 'Consultar';
    
    const prices = services.map(service => service.basePrice || 0).filter(price => price > 0);
    if (prices.length === 0) return 'Consultar';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `R$ ${minPrice}`;
    }
    
    return `R$ ${minPrice} - R$ ${maxPrice}`;
  },

  // Formatar horários de funcionamento
  formatOpenHours(workingHours) {
    const today = new Date().getDay(); // 0 = domingo, 1 = segunda, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today];
    
    const todayHours = workingHours[todayName];
    
    if (!todayHours || !todayHours.isOpen) {
      return 'Fechado hoje';
    }
    
    return `${todayHours.open} - ${todayHours.close}`;
  },

  // Verificar se a oficina está aberta agora
  isWorkshopOpen(workingHours) {
    const now = new Date();
    const today = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutos desde meia-noite
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[today];
    
    const todayHours = workingHours[todayName];
    
    if (!todayHours || !todayHours.isOpen) {
      return false;
    }
    
    // Converter horários para minutos
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  }
};

export default workshopService;