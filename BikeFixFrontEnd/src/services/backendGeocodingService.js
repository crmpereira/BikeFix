/**
 * Serviço de geocodificação que usa o backend para evitar problemas de CORS
 * Converte endereços em coordenadas através da API do backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Geocodifica um endereço usando o backend
 * @param {Object} address - Objeto com dados do endereço
 * @param {string} address.street - Rua
 * @param {string} address.city - Cidade
 * @param {string} address.state - Estado
 * @param {string} address.zipCode - CEP
 * @returns {Promise<Object>} - Coordenadas {lat, lng}
 */
export const geocodeAddress = async (addressData) => {
  try {
    // Converte o objeto de endereço em uma string formatada
    const addressParts = [];
    if (addressData.street) addressParts.push(addressData.street);
    if (addressData.city) addressParts.push(addressData.city);
    if (addressData.state) addressParts.push(addressData.state);
    if (addressData.zipCode) addressParts.push(addressData.zipCode);
    
    const addressString = addressParts.join(', ');
    
    // Faz requisição para o backend
    const response = await fetch(`${API_BASE_URL}/auth/geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: addressString }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.coordinates) {
      // Retorna no formato esperado pelo frontend
      return {
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng
      };
    } else {
      throw new Error(data.message || 'Erro na geocodificação');
    }
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    throw error;
  }
};

/**
 * Geocodifica um endereço a partir de uma string completa
 * @param {string} fullAddress - Endereço completo como string
 * @returns {Promise<Object>} - Coordenadas {latitude, longitude}
 */
export const geocodeAddressString = async (fullAddress) => {
  try {
    if (!fullAddress || fullAddress.trim().length === 0) {
      throw new Error('Endereço é obrigatório');
    }

    // Tenta extrair componentes do endereço da string
    const addressParts = fullAddress.split(',').map(part => part.trim());
    
    const address = {
      street: addressParts[0] || '',
      city: addressParts[1] || '',
      state: addressParts[2] || '',
      zipCode: addressParts[3] || ''
    };

    return await geocodeAddress(address);

  } catch (error) {
    console.error('Erro na geocodificação de string:', error.message);
    throw error;
  }
};

const backendGeocodingService = {
  geocodeAddress,
  geocodeAddressString
};

export default backendGeocodingService;