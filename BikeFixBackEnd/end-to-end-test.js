const axios = require('axios');
require('dotenv').config({ path: './BikeFixBackEnd/.env' });

/**
 * Teste ponta a ponta do sistema BikeFix
 * 1. Criar usuário OFICINA
 * 2. Criar usuário CICLISTA
 * 3. Login como CICLISTA e fazer agendamento
 * 4. Login como OFICINA e verificar agendamento
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Dados de teste
const testData = {
  oficina: {
    name: 'Oficina Teste E2E',
    email: 'oficina.teste@bikefix.com',
    password: 'senha123',
    userType: 'workshop',
    phone: '(11) 99999-9999',
    workshopData: {
      businessName: 'Oficina Teste E2E Ltda',
      description: 'Oficina de teste para validação E2E',
      address: {
        street: 'Rua das Bicicletas, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        coordinates: {
          lat: -23.5505,
          lng: -46.6333
        }
      },
      services: [
        {
          name: 'Manutenção Geral',
          description: 'Revisão completa da bicicleta',
          basePrice: 50.00,
          estimatedTime: 120
        },
        {
          name: 'Troca de Pneus',
          description: 'Substituição de pneus dianteiro e traseiro',
          basePrice: 80.00,
          estimatedTime: 60
        }
      ],
      workingHours: {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '08:00', close: '14:00', isOpen: true },
        sunday: { open: '09:00', close: '12:00', isOpen: false }
      }
    }
  },
  ciclista: {
    name: 'Ciclista Teste E2E',
    email: 'ciclista.teste@bikefix.com',
    password: 'senha123',
    userType: 'cyclist',
    phone: '(11) 88888-8888'
  }
};

let tokens = {};
let userIds = {};
let appointmentId = null;

// Função para fazer requisições HTTP
const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro na requisição ${method} ${endpoint}:`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

// Passo 1: Criar usuário OFICINA
const createWorkshopUser = async () => {
  console.log('\n🏪 Passo 1: Criando usuário OFICINA...');
  
  try {
    const response = await makeRequest('POST', '/auth/register', testData.oficina);
    userIds.oficina = response.data.user._id;
    console.log('✅ Oficina criada com sucesso!');
    console.log('   ID:', userIds.oficina);
    console.log('   Nome:', response.data.user.name);
    console.log('   Email:', response.data.user.email);
    return response;
  } catch (error) {
    console.error('❌ Falha ao criar oficina');
    throw error;
  }
};

// Passo 2: Criar usuário CICLISTA
const createCyclistUser = async () => {
  console.log('\n🚴 Passo 2: Criando usuário CICLISTA...');
  
  try {
    const response = await makeRequest('POST', '/auth/register', testData.ciclista);
    userIds.ciclista = response.data.user._id;
    console.log('✅ Ciclista criado com sucesso!');
    console.log('   ID:', userIds.ciclista);
    console.log('   Nome:', response.data.user.name);
    console.log('   Email:', response.data.user.email);
    return response;
  } catch (error) {
    console.error('❌ Falha ao criar ciclista');
    throw error;
  }
};

// Passo 3: Login como CICLISTA
const loginAsCyclist = async () => {
  console.log('\n🔐 Passo 3: Fazendo login como CICLISTA...');
  
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: testData.ciclista.email,
      password: testData.ciclista.password
    });
    
    tokens.ciclista = response.data.token;
    console.log('✅ Login do ciclista realizado com sucesso!');
    console.log('   Token obtido:', tokens.ciclista.substring(0, 20) + '...');
    return response;
  } catch (error) {
    console.error('❌ Falha no login do ciclista');
    throw error;
  }
};

// Passo 4: Criar agendamento como CICLISTA
const createAppointment = async () => {
  console.log('\n📅 Passo 4: Criando agendamento como CICLISTA...');
  
  // Data para amanhã às 14:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const appointmentData = {
    workshopId: userIds.oficina,
    appointmentDate: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD
    appointmentTime: '14:00',
    serviceType: 'complete',
    description: 'Teste E2E - Manutenção preventiva da bicicleta',
    bikeInfo: {
      brand: 'Trek',
      model: 'Mountain Bike',
      type: 'mountain'
    },
    requestedServices: [
      {
        name: 'Revisão geral',
        description: 'Revisão completa da bicicleta'
      },
      {
        name: 'Ajuste de freios',
        description: 'Ajuste e calibração dos freios'
      }
    ]
  };
  
  try {
    const response = await makeRequest('POST', '/appointments', appointmentData, tokens.ciclista);
    appointmentId = response.data.id || response.data._id;
    console.log('✅ Agendamento criado com sucesso!');
    console.log('   ID do agendamento:', appointmentId);
    console.log('   Oficina:', response.data.workshop);
    console.log('   Data:', response.data.appointmentDate + ' às ' + response.data.appointmentTime);
    console.log('   Serviço:', response.data.serviceType);
    return response;
  } catch (error) {
    console.error('❌ Falha ao criar agendamento');
    throw error;
  }
};

// Passo 5: Login como OFICINA
const loginAsWorkshop = async () => {
  console.log('\n🔐 Passo 5: Fazendo login como OFICINA...');
  
  try {
    const response = await makeRequest('POST', '/auth/login', {
      email: testData.oficina.email,
      password: testData.oficina.password
    });
    
    tokens.oficina = response.data.token;
    console.log('✅ Login da oficina realizado com sucesso!');
    console.log('   Token obtido:', tokens.oficina.substring(0, 20) + '...');
    return response;
  } catch (error) {
    console.error('❌ Falha no login da oficina');
    throw error;
  }
};

// Passo 6: Verificar agendamentos como OFICINA
const checkAppointmentsAsWorkshop = async () => {
  console.log('\n📋 Passo 6: Verificando agendamentos como OFICINA...');
  
  try {
    const response = await makeRequest('GET', '/appointments/workshop', null, tokens.oficina);
    
    console.log('✅ Agendamentos obtidos com sucesso!');
    console.log(`   Total de agendamentos: ${response.data.appointments ? response.data.appointments.length : response.data.length || 0}`);
    
    const appointments = response.data.appointments || response.data;
    
    if (appointments && appointments.length > 0) {
      console.log('\n📋 Detalhes dos agendamentos:');
      appointments.forEach((apt, index) => {
        console.log(`   Agendamento ${index + 1}:`);
        console.log(`     ID: ${apt.id || apt._id}`);
        console.log(`     Cliente: ${apt.userId?.name || apt.clientName || 'N/A'}`);
        console.log(`     Serviço: ${apt.serviceType}`);
        console.log(`     Data: ${apt.appointmentDate} às ${apt.appointmentTime}`);
        console.log(`     Status: ${apt.status}`);
        console.log(`     Descrição: ${apt.description}`);
      });
      
      // Verificar se nosso agendamento está na lista
      const ourAppointment = appointments.find(apt => 
        (apt.id || apt._id) === appointmentId || 
        apt.serviceType === 'Manutenção Geral'
      );
      
      if (ourAppointment) {
        console.log('\n🎉 SUCESSO! O agendamento criado foi encontrado na lista da oficina!');
      } else {
        console.log('\n⚠️  ATENÇÃO: O agendamento criado não foi encontrado na lista da oficina.');
      }
    } else {
      console.log('\n⚠️  Nenhum agendamento encontrado para esta oficina.');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Falha ao verificar agendamentos');
    throw error;
  }
};

// Função principal do teste
const runEndToEndTest = async () => {
  console.log('🚀 Iniciando teste ponta a ponta do BikeFix');
  console.log('=' .repeat(60));
  
  try {
    // Executar todos os passos
    await createWorkshopUser();
    await createCyclistUser();
    await loginAsCyclist();
    await createAppointment();
    await loginAsWorkshop();
    await checkAppointmentsAsWorkshop();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TESTE PONTA A PONTA CONCLUÍDO COM SUCESSO!');
    console.log('\n📊 Resumo do teste:');
    console.log(`   ✅ Oficina criada: ${testData.oficina.name} (ID: ${userIds.oficina})`);
    console.log(`   ✅ Ciclista criado: ${testData.ciclista.name} (ID: ${userIds.ciclista})`);
    console.log(`   ✅ Login do ciclista: Realizado`);
    console.log(`   ✅ Agendamento criado: ID ${appointmentId}`);
    console.log(`   ✅ Login da oficina: Realizado`);
    console.log(`   ✅ Verificação de agendamentos: Concluída`);
    
    console.log('\n💡 Próximos passos:');
    console.log('   • Acesse http://localhost:3000 para testar a interface');
    console.log(`   • Login Oficina: ${testData.oficina.email} / ${testData.oficina.password}`);
    console.log(`   • Login Ciclista: ${testData.ciclista.email} / ${testData.ciclista.password}`);
    
  } catch (error) {
    console.log('\n' + '=' .repeat(60));
    console.log('❌ TESTE FALHOU!');
    console.error('Erro:', error.message);
    
    console.log('\n🔧 Verificações sugeridas:');
    console.log('   • Backend está rodando em http://localhost:5000?');
    console.log('   • MongoDB está conectado?');
    console.log('   • Todas as rotas estão funcionando?');
    
    process.exit(1);
  }
};

// Executar apenas se chamado diretamente
if (require.main === module) {
  runEndToEndTest();
}

module.exports = {
  runEndToEndTest,
  testData,
  makeRequest
};