const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'https://bikefix-backend.onrender.com/api';

// Dados de teste
const testUser = {
  email: 'joao@bikecenter.com.br',
  password: '123456'
};

const testAppointment = {
  workshopId: null, // Será preenchido após buscar oficinas
  appointmentDate: '2024-12-30',
  appointmentTime: '14:00',
  serviceType: 'custom',
  requestedServices: [
    {
      name: 'Revisão Completa',
      price: 150.00,
      duration: 120
    },
    {
      name: 'Troca de Pneu',
      price: 80.00,
      duration: 30
    }
  ],
  bikeInfo: {
    brand: 'Caloi',
    model: 'Elite',
    year: 2023
  },
  description: 'Teste para verificar se o valor aparece no histórico',
  urgency: 'normal'
};

async function testAppointmentValue() {
  try {
    console.log('🔐 Fazendo login...');
    
    // 1. Fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Falha no login: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Buscar oficinas disponíveis
    console.log('🔍 Buscando oficinas...');
    const workshopsResponse = await axios.get(`${API_BASE_URL}/workshops`);
    
    if (!workshopsResponse.data.success || !workshopsResponse.data.data.length) {
      throw new Error('Nenhuma oficina encontrada');
    }
    
    const workshop = workshopsResponse.data.data[0];
    testAppointment.workshopId = workshop._id;
    console.log(`✅ Oficina selecionada: ${workshop.name}`);
    
    // 3. Criar agendamento
    console.log('📅 Criando agendamento...');
    const appointmentResponse = await axios.post(
      `${API_BASE_URL}/appointments`,
      testAppointment,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!appointmentResponse.data.success) {
      throw new Error('Falha ao criar agendamento: ' + appointmentResponse.data.message);
    }
    
    console.log('✅ Agendamento criado com sucesso!');
    console.log('📋 Dados do agendamento:', {
      id: appointmentResponse.data.data._id,
      totalPrice: appointmentResponse.data.data.pricing?.totalPrice || appointmentResponse.data.data.totalPrice,
      status: appointmentResponse.data.data.status
    });
    
    // 4. Buscar histórico de agendamentos
    console.log('📜 Verificando histórico...');
    const historyResponse = await axios.get(
      `${API_BASE_URL}/appointments`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    if (!historyResponse.data.success) {
      throw new Error('Falha ao buscar histórico: ' + historyResponse.data.message);
    }
    
    const appointments = historyResponse.data.data || [];
    console.log(`✅ Encontrados ${appointments.length} agendamentos no histórico`);
    
    // 5. Verificar se o valor aparece
    const latestAppointment = appointments[0];
    if (latestAppointment) {
      console.log('🔍 Último agendamento:');
      console.log('  - ID:', latestAppointment._id);
      console.log('  - Status:', latestAppointment.status);
      console.log('  - Valor direto (totalPrice):', latestAppointment.totalPrice);
      console.log('  - Valor em pricing:', latestAppointment.pricing?.totalPrice);
      console.log('  - Estrutura pricing completa:', latestAppointment.pricing);
      
      const displayValue = latestAppointment.pricing?.totalPrice || latestAppointment.totalPrice || 0;
      console.log('  - Valor que será exibido:', displayValue);
      
      if (displayValue > 0) {
        console.log('✅ SUCESSO: O campo VALOR está sendo retornado corretamente!');
      } else {
        console.log('❌ PROBLEMA: O campo VALOR está vazio ou zero!');
      }
    } else {
      console.log('❌ Nenhum agendamento encontrado no histórico');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar o teste
testAppointmentValue();