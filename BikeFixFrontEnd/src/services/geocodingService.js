/**
 * Serviço de geocodificação usando Nominatim (OpenStreetMap)
 * Converte endereços em coordenadas (latitude/longitude)
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
 * @param {string} address - Endereço completo a ser geocodificado
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} - Coordenadas e informações do local
 */
export const geocodeAddress = async (address, options = {}) => {
  try {
    if (!address || address.trim().length === 0) {
      throw new Error('Endereço é obrigatório');
    }
    
    // Aguarda rate limit
    await waitForRateLimit();
    
    // Parâmetros da consulta
    const params = new URLSearchParams({
      q: address.trim(),
      format: 'json',
      addressdetails: '1',
      limit: options.limit || '5',
      countrycodes: options.countryCode || 'br', // Foca no Brasil
      ...options.extraParams
    });
    
    // Faz requisição para Nominatim
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`Erro na geocodificação: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verifica se encontrou resultados
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Nenhuma localização encontrada para este endereço');
    }
    
    // Retorna o primeiro resultado formatado
    const result = data[0];
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address || {},
      boundingBox: result.boundingbox ? {
        north: parseFloat(result.boundingbox[1]),
        south: parseFloat(result.boundingbox[0]),
        east: parseFloat(result.boundingbox[3]),
        west: parseFloat(result.boundingbox[2])
      } : null,
      importance: result.importance,
      placeId: result.place_id,
      osmType: result.osm_type,
      osmId: result.osm_id,
      // Dados originais para referência
      raw: result
    };
    
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    throw error;
  }
};

/**
 * Geocodificação reversa (converte coordenadas em endereço)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} - Informações do endereço
 */
export const reverseGeocode = async (latitude, longitude, options = {}) => {
  try {
    if (!latitude || !longitude) {
      throw new Error('Latitude e longitude são obrigatórias');
    }
    
    // Aguarda rate limit
    await waitForRateLimit();
    
    // Parâmetros da consulta
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      addressdetails: '1',
      zoom: options.zoom || '18',
      ...options.extraParams
    });
    
    // Faz requisição para Nominatim
    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`Erro na geocodificação reversa: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verifica se encontrou resultado
    if (!data || data.error) {
      throw new Error('Nenhum endereço encontrado para estas coordenadas');
    }
    
    return {
      displayName: data.display_name,
      address: data.address || {},
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
      placeId: data.place_id,
      osmType: data.osm_type,
      osmId: data.osm_id,
      // Dados originais para referência
      raw: data
    };
    
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    throw error;
  }
};

/**
 * Busca lugares por nome (ex: "Padaria São João, São Paulo")
 * @param {string} placeName - Nome do lugar
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Array>} - Lista de lugares encontrados
 */
export const searchPlaces = async (placeName, options = {}) => {
  try {
    if (!placeName || placeName.trim().length === 0) {
      throw new Error('Nome do lugar é obrigatório');
    }
    
    // Aguarda rate limit
    await waitForRateLimit();
    
    // Parâmetros da consulta
    const params = new URLSearchParams({
      q: placeName.trim(),
      format: 'json',
      addressdetails: '1',
      limit: options.limit || '10',
      countrycodes: options.countryCode || 'br',
      ...options.extraParams
    });
    
    // Faz requisição para Nominatim
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`Erro na busca de lugares: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Retorna lista formatada
    return data.map(item => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      displayName: item.display_name,
      address: item.address || {},
      importance: item.importance,
      placeId: item.place_id,
      osmType: item.osm_type,
      osmId: item.osm_id,
      raw: item
    }));
    
  } catch (error) {
    console.error('Erro na busca de lugares:', error);
    throw error;
  }
};

/**
 * Função combinada: CEP → Endereço → Coordenadas
 * @param {string} cep - CEP a ser geocodificado
 * @returns {Promise<Object>} - Coordenadas do CEP
 */
export const geocodeCEP = async (cep) => {
  try {
    // Importa o serviço de CEP dinamicamente para evitar dependência circular
    const { searchByCEP } = await import('./cepService.js');
    
    // 1. Busca endereço pelo CEP
    const addressData = await searchByCEP(cep);
    
    // 2. Geocodifica o endereço
    const coordinates = await geocodeAddress(addressData.enderecoCompleto);
    
    // 3. Combina informações
    return {
      ...coordinates,
      cep: addressData.cep,
      addressFromCEP: addressData,
      source: 'cep-geocoding'
    };
    
  } catch (error) {
    console.error('Erro na geocodificação de CEP:', error);
    throw error;
  }
};

const geocodingService = {
  geocodeAddress,
  reverseGeocode,
  searchPlaces,
  geocodeCEP
};

export default geocodingService;