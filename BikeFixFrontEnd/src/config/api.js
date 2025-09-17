/**
 * Configuração centralizada da API
 * Este arquivo centraliza todas as configurações de URL da API
 * Para alternar entre desenvolvimento e produção, basta comentar/descomentar as linhas abaixo
 */

// Configurar base URL da API
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // Desenvolvimento local
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bikefix-backend.onrender.com/api'; // Produção

// Configurações adicionais da API
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Exportar a URL base para compatibilidade
export { API_BASE_URL };
export default API_BASE_URL;