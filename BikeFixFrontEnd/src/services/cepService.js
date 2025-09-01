/**
 * Serviço para busca de CEP usando ViaCEP API
 * Converte CEP em endereço completo
 */

const API_BASE_URL = 'https://viacep.com.br/ws';

/**
 * Valida formato do CEP brasileiro (8 dígitos)
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} - True se válido, false caso contrário
 */
export const validateCEP = (cep) => {
  if (!cep) return false;
  
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Verifica se tem exatamente 8 dígitos
  return cleanCEP.length === 8;
};

/**
 * Formata CEP para exibição (12345678 -> 12345-678)
 * @param {string} cep - CEP a ser formatado
 * @returns {string} - CEP formatado
 */
export const formatCEP = (cep) => {
  if (!cep) return '';
  
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length === 8) {
    return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
  }
  
  return cleanCEP;
};

/**
 * Busca informações de endereço pelo CEP
 * @param {string} cep - CEP a ser consultado (com ou sem formatação)
 * @returns {Promise<Object>} - Dados do endereço ou erro
 */
export const searchByCEP = async (cep) => {
  try {
    // Valida formato do CEP
    if (!validateCEP(cep)) {
      throw new Error('CEP deve conter exatamente 8 dígitos');
    }
    
    // Remove formatação do CEP
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Faz requisição para ViaCEP
    const response = await fetch(`${API_BASE_URL}/${cleanCEP}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro na consulta do CEP');
    }
    
    const data = await response.json();
    
    // Verifica se CEP foi encontrado
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    // Retorna dados formatados
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      localidade: data.localidade, // cidade
      uf: data.uf,
      estado: data.estado,
      regiao: data.regiao,
      ibge: data.ibge,
      ddd: data.ddd,
      // Endereço completo para geocodificação
      enderecoCompleto: `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`
    };
    
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
};

/**
 * Busca CEPs por endereço (busca reversa)
 * @param {string} uf - Estado (ex: 'SP')
 * @param {string} cidade - Cidade
 * @param {string} logradouro - Nome da rua/logradouro
 * @returns {Promise<Array>} - Lista de CEPs encontrados
 */
export const searchByAddress = async (uf, cidade, logradouro) => {
  try {
    // Valida parâmetros mínimos
    if (!uf || !cidade || !logradouro) {
      throw new Error('UF, cidade e logradouro são obrigatórios');
    }
    
    if (cidade.length < 3 || logradouro.length < 3) {
      throw new Error('Cidade e logradouro devem ter pelo menos 3 caracteres');
    }
    
    // Faz requisição para ViaCEP
    const response = await fetch(`${API_BASE_URL}/${uf}/${cidade}/${logradouro}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro na busca por endereço');
    }
    
    const data = await response.json();
    
    // Verifica se encontrou resultados
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Nenhum CEP encontrado para este endereço');
    }
    
    // Retorna lista formatada
    return data.map(item => ({
      cep: item.cep,
      logradouro: item.logradouro,
      complemento: item.complemento,
      bairro: item.bairro,
      localidade: item.localidade,
      uf: item.uf,
      estado: item.estado,
      enderecoCompleto: `${item.logradouro}, ${item.bairro}, ${item.localidade}, ${item.uf}`
    }));
    
  } catch (error) {
    console.error('Erro ao buscar por endereço:', error);
    throw error;
  }
};

const cepService = {
  validateCEP,
  formatCEP,
  searchByCEP,
  searchByAddress
};

export default cepService;