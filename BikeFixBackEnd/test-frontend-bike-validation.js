const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';

// Função para fazer requisições HTTP
const makeRequest = async (method, endpoint, data = null, token = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro na requisição');
    }
    throw error;
  }
};

// Função para gerar dados aleatórios
const generateRandomData = () => {
  const timestamp = Date.now();
  return {
    email: `ciclista${timestamp}@test.com`,
    workshopEmail: `oficina${timestamp}@test.com`,
    phone: `11${timestamp.toString().slice(-8)}`,
  };
};

// Teste principal
const testFrontendBikeValidation = async () => {
  console.log('🚴‍♂️ Iniciando teste de validação de bike no frontend...');
  
  const randomData = generateRandomData();
  let cyclistToken = null;
  let workshopToken = null;
  let cyclistId = null;
  
  try {
    // Passo 1: Criar uma oficina
    console.log('\n📍 Passo 1: Criando oficina...');
    const workshopData = {
      name: 'Oficina Teste Frontend',
      email: randomData.workshopEmail,
      password: 'senha123',
      phone: randomData.phone,
      userType: 'workshop',
      businessName: 'Oficina Teste Frontend Ltda',
      cnpj: '12345678000199',
      address: {
        street: 'Rua das Bikes',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567'
      },
      services: [
        {
          name: 'Manutenção Básica',
          description: 'Limpeza e lubrificação',
          basePrice: 50,
          estimatedTime: 60
        }
      ]
    };
    
    const workshopResponse = await makeRequest('POST', '/auth/register', workshopData);
    console.log('✅ Oficina criada com sucesso!');
    
    // Passo 2: Fazer login da oficina
    console.log('\n🔐 Passo 2: Fazendo login da oficina...');
    const workshopLoginResponse = await makeRequest('POST', '/auth/login', {
      email: randomData.workshopEmail,
      password: 'senha123'
    });
    workshopToken = workshopLoginResponse.data.token;
    console.log('✅ Login da oficina realizado com sucesso!');
    
    // Passo 3: Criar um ciclista SEM bicicletas
    console.log('\n🚴‍♂️ Passo 3: Criando ciclista sem bicicletas...');
    const cyclistData = {
      name: 'Ciclista Teste Frontend',
      email: randomData.email,
      password: 'senha123',
      phone: randomData.phone,
      userType: 'cyclist',
      address: {
        street: 'Rua dos Ciclistas',
        number: '456',
        neighborhood: 'Vila Bike',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567'
      }
    };
    
    const cyclistResponse = await makeRequest('POST', '/auth/register', cyclistData);
    cyclistId = cyclistResponse.data.user._id;
    console.log('✅ Ciclista criado com sucesso!');
    
    // Passo 4: Fazer login do ciclista
    console.log('\n🔐 Passo 4: Fazendo login do ciclista...');
    const cyclistLoginResponse = await makeRequest('POST', '/auth/login', {
      email: randomData.email,
      password: 'senha123'
    });
    cyclistToken = cyclistLoginResponse.data.token;
    console.log('✅ Login do ciclista realizado com sucesso!');
    
    // Passo 5: Verificar se o ciclista não tem bicicletas
    console.log('\n🚲 Passo 5: Verificando bicicletas do ciclista...');
    const bikesResponse = await makeRequest('GET', '/users/bikes', null, cyclistToken);
    const bikes = bikesResponse.bikes || bikesResponse.data?.bikes || [];
    console.log(`📊 Número de bicicletas: ${bikes.length}`);
    
    if (bikes.length > 0) {
      console.log('❌ ERRO: Ciclista já possui bicicletas cadastradas!');
      return;
    }
    
    // Passo 6: Tentar criar agendamento (deve falhar)
    console.log('\n❌ Passo 6: Tentando criar agendamento sem bicicletas (deve falhar)...');
    const appointmentData = {
      workshopId: workshopResponse.data.user._id,
      appointmentDate: '2024-12-30',
      appointmentTime: '10:00',
      serviceType: 'custom',
      requestedServices: [
        {
          name: 'Manutenção Básica',
          description: 'Teste de validação'
        }
      ],
      bikeIds: [],
      description: 'Teste de validação de bike obrigatória',
      urgency: 'normal'
    };
    
    try {
      await makeRequest('POST', '/appointments', appointmentData, cyclistToken);
      console.log('❌ ERRO: Agendamento foi criado mesmo sem bicicletas!');
      return;
    } catch (error) {
      if (error.message.includes('pelo menos uma bicicleta cadastrada')) {
        console.log('✅ Validação funcionou! Agendamento rejeitado corretamente.');
        console.log(`   Mensagem: ${error.message}`);
      } else {
        console.log(`❌ Erro inesperado: ${error.message}`);
        return;
      }
    }
    
    console.log('\n🎉 Teste de validação de bike no frontend concluído com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('   ✅ Oficina criada e logada');
    console.log('   ✅ Ciclista criado sem bicicletas');
    console.log('   ✅ Validação de backend funcionando (agendamento rejeitado)');
    console.log('   ✅ Mensagem de erro adequada exibida');
    console.log('\n💡 Próximo passo: Testar a validação no frontend (interface)');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
};

// Executar o teste
testFrontendBikeValidation();