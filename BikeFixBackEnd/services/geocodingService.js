const axios = require('axios');

/**
 * Serviço de geocodificação para o backend
 * Converte endereços em coordenadas usando Nominatim (OpenStreetMap)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Headers obrigatórios para uso da API Nominatim
const HEADERS = {
  'User-Agent': 'BikeFix/1.0 (bikefix@example.com)'
};

// Controle de rate limiting (1 requisição por segundo)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo

/**
 * Aguarda o intervalo mínimo entre requisições
 */
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

/**
 * Geocodifica um endereço (converte endereço em coordenadas)
 * @param {Object} address - Objeto com dados do endereço
 * @param {string} address.street - Rua
 * @param {string} address.city - Cidade
 * @param {string} address.state - Estado
 * @param {string} address.zipCode - CEP
 * @returns {Promise<Object>} - Coordenadas {lat, lng}
 */
const geocodeAddress = async (address) => {
  try {
    if (!address || (!address.street && !address.city && !address.zipCode)) {
      throw new Error('Dados de endereço insuficientes para geocodificação');
    }

    // Constrói o endereço completo
    const addressParts = [];
    if (address.street) addressParts.push(address.street);
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.zipCode) addressParts.push(address.zipCode);
    
    const fullAddress = addressParts.join(', ');
    
    if (!fullAddress.trim()) {
      throw new Error('Endereço vazio após formatação');
    }

    console.log(`Geocodificando endereço: ${fullAddress}`);

    // Aguarda rate limit
    await waitForRateLimit();

    // Parâmetros da consulta
    const params = {
      q: fullAddress,
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'br' // Foca no Brasil
    };

    // Faz requisição para Nominatim
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params,
      headers: HEADERS,
      timeout: 10000 // 10 segundos de timeout
    });

    const data = response.data;

    // Verifica se encontrou resultados
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`Nenhuma coordenada encontrada para: ${fullAddress}`);
      return null;
    }

    // Retorna as coordenadas do primeiro resultado
    const result = data[0];
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    console.log(`Coordenadas encontradas: ${coordinates.lat}, ${coordinates.lng}`);
    return coordinates;

  } catch (error) {
    console.error('Erro na geocodificação:', error.message);
    // Retorna null em caso de erro para não quebrar o fluxo
    return null;
  }
};

/**
 * Geocodifica endereço de um usuário usando campos padronizados na raiz
 * @param {Object} userData - Dados do usuário
 * @param {string} userType - Tipo do usuário ('cyclist' ou 'workshop')
 * @returns {Promise<Object>} - Dados do usuário com coordenadas atualizadas
 */
const geocodeUserAddress = async (userData, userType) => {
  try {
    // Usa os campos de endereço padronizados na raiz do schema
    const addressToGeocode = userData.address;

    if (!addressToGeocode) {
      console.log('Nenhum endereço encontrado para geocodificação');
      return userData;
    }

    // Geocodifica o endereço
    const coordinates = await geocodeAddress(addressToGeocode);
    
    if (coordinates) {
      // Atualiza as coordenadas dentro do address
      if (!userData.address) {
        userData.address = {};
      }
      userData.address.coordinates = {
        latitude: coordinates.lat,
        longitude: coordinates.lng
      };
      
      console.log(`Coordenadas adicionadas para usuário ${userType}:`, userData.address.coordinates);
    }

    return userData;

  } catch (error) {
    console.error('Erro ao geocodificar endereço do usuário:', error.message);
    // Retorna os dados originais em caso de erro
    return userData;
  }
};

module.exports = {
  geocodeAddress,
  geocodeUserAddress
};