/**
 * Utilitário para formatação de endereços
 * Evita o erro React #31 ao renderizar objetos de endereço diretamente
 */

/**
 * Formata um objeto de endereço para exibição
 * @param {Object|string} address - Objeto de endereço ou string
 * @param {Object} options - Opções de formatação
 * @returns {string} Endereço formatado
 */
export const formatAddress = (address, options = {}) => {
  if (!address) {
    return '';
  }

  // Se já é uma string, retorna diretamente
  if (typeof address === 'string') {
    return address;
  }

  // Se é um objeto, formata as propriedades
  if (typeof address === 'object') {
    const {
      includeZipCode = false,
      includeCoordinates = false,
      separator = ', ',
      stateSeparator = ' - '
    } = options;

    const parts = [];

    // Adiciona rua
    if (address.street) {
      parts.push(address.street);
    }

    // Adiciona cidade
    if (address.city) {
      parts.push(address.city);
    }

    // Adiciona estado
    if (address.state) {
      const lastPart = parts.pop();
      if (lastPart) {
        parts.push(`${lastPart}${stateSeparator}${address.state}`);
      } else {
        parts.push(address.state);
      }
    }

    // Adiciona CEP se solicitado
    if (includeZipCode && address.zipCode) {
      parts.push(`CEP: ${address.zipCode}`);
    }

    // Adiciona coordenadas se solicitado
    if (includeCoordinates && address.coordinates) {
      const { latitude, longitude } = address.coordinates;
      if (latitude && longitude) {
        parts.push(`(${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
      }
    }

    return parts.join(separator);
  }

  return String(address);
};

/**
 * Formata endereço de forma compacta (apenas rua, cidade e estado)
 * @param {Object|string} address - Objeto de endereço ou string
 * @returns {string} Endereço formatado de forma compacta
 */
export const formatAddressCompact = (address) => {
  return formatAddress(address, {
    includeZipCode: false,
    includeCoordinates: false
  });
};

/**
 * Formata endereço completo (com CEP)
 * @param {Object|string} address - Objeto de endereço ou string
 * @returns {string} Endereço formatado completo
 */
export const formatAddressFull = (address) => {
  return formatAddress(address, {
    includeZipCode: true,
    includeCoordinates: false
  });
};

/**
 * Formata endereço com coordenadas (para debug/admin)
 * @param {Object|string} address - Objeto de endereço ou string
 * @returns {string} Endereço formatado com coordenadas
 */
export const formatAddressWithCoords = (address) => {
  return formatAddress(address, {
    includeZipCode: true,
    includeCoordinates: true
  });
};

/**
 * Valida se um endereço tem as propriedades mínimas necessárias
 * @param {Object} address - Objeto de endereço
 * @returns {boolean} True se o endereço é válido
 */
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return false;
  }

  // Pelo menos cidade e estado são obrigatórios
  return !!(address.city && address.state);
};

/**
 * Extrai apenas as coordenadas de um endereço
 * @param {Object} address - Objeto de endereço
 * @returns {Object|null} Coordenadas {lat, lng} ou null
 */
export const getAddressCoordinates = (address) => {
  if (!address || typeof address !== 'object' || !address.coordinates) {
    return null;
  }

  const { latitude, longitude } = address.coordinates;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { lat: latitude, lng: longitude };
  }

  return null;
};

export default {
  formatAddress,
  formatAddressCompact,
  formatAddressFull,
  formatAddressWithCoords,
  isValidAddress,
  getAddressCoordinates
};