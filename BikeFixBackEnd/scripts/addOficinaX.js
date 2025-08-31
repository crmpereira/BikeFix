const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';

// Dados da oficina X Oficina
const oficinaXData = {
  name: 'Oficina X',
  email: 'contato@oficinax.com.br',
  password: '123456',
  phone: '(47) 3333-4444',
  userType: 'workshop',
  isVerified: true,
  workshopData: {
    businessName: 'X Oficina',
    cnpj: '11.222.333/0001-44',
    description: 'Oficina especializada em manutenção e reparo de bicicletas de todos os tipos.',
    address: {
      street: 'Rua Principal, 100',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89205-650',
      coordinates: { lat: -26.3044, lng: -48.8487 }
    },
    workingHours: {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '08:00', close: '14:00', isOpen: true },
      sunday: { open: '', close: '', isOpen: false }
    },
    services: [
      { name: 'Manutenção Geral', description: 'Revisão completa da bicicleta', basePrice: 75, estimatedTime: 120 },
      { name: 'Troca de Pneus', description: 'Substituição de pneus e câmaras', basePrice: 40, estimatedTime: 30 },
      { name: 'Ajuste de Freios', description: 'Regulagem do sistema de freios', basePrice: 30, estimatedTime: 45 },
      { name: 'Ajuste de Câmbio', description: 'Regulagem do sistema de transmissão', basePrice: 35, estimatedTime: 60 },
      { name: 'Limpeza e Lubrificação', description: 'Limpeza completa e lubrificação da corrente', basePrice: 25, estimatedTime: 30 }
    ],
    isApproved: true
  }
};

async function addOficinaX() {
  try {
    console.log('Cadastrando X Oficina no banco de teste...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, oficinaXData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ X Oficina cadastrada com sucesso!');
    console.log('Resposta completa:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user) {
      console.log('ID da oficina:', response.data.user._id);
      console.log('Nome da oficina:', response.data.user.workshopData?.businessName);
      console.log('CEP:', response.data.user.workshopData?.address?.zipCode);
      console.log('Cidade:', response.data.user.workshopData?.address?.city);
    } else {
      console.log('Nome:', response.data.name);
      console.log('Email de verificação enviado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao cadastrar X Oficina:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar o cadastro
addOficinaX();