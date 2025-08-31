const axios = require('axios');
require('dotenv').config();

/**
 * Teste para validar que ciclistas precisam ter pelo menos uma bike cadastrada
 * para fazer agendamentos
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Função para fazer requisições
const makeRequest = async (method, endpoint, data = null, token = null) => {
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

  return await axios(config);
};

const testBikeValidation = async () => {
  console.log('🧪 Testando validação de bike obrigatória para agendamentos');
  console.log('=' .repeat(60));

  let cyclistToken = null;
  let workshopId = null;

  try {
    // 1. Criar uma oficina para o teste
    console.log('\n🏪 Criando oficina de teste...');
    const workshopData = {
      name: 'Oficina Teste Validação',
      email: 'oficina.validacao@test.com',
      password: 'senha123',
      userType: 'workshop',
      phone: '(11) 99999-9999'
    };

    const workshopResponse = await makeRequest('POST', '/auth/register', workshopData);
    workshopId = workshopResponse.data.data.user._id;
    console.log('✅ Oficina criada:', workshopId);

    // 2. Criar um ciclista SEM bikes
    console.log('\n🚴 Criando ciclista sem bikes...');
    const cyclistData = {
      name: 'Ciclista Sem Bike',
      email: 'ciclista.sembike@test.com',
      password: 'senha123',
      userType: 'cyclist',
      phone: '(11) 88888-8888'
    };

    const cyclistResponse = await makeRequest('POST', '/auth/register', cyclistData);
    console.log('✅ Ciclista criado:', cyclistResponse.data.data.user._id);

    // 3. Fazer login como ciclista
    console.log('\n🔐 Fazendo login como ciclista...');
    const loginResponse = await makeRequest('POST', '/auth/login', {
      email: cyclistData.email,
      password: cyclistData.password
    });
    
    cyclistToken = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso');

    // 4. Verificar se o ciclista não tem bikes
    console.log('\n🔍 Verificando bikes do ciclista...');
    const bikesResponse = await makeRequest('GET', '/users/bikes', null, cyclistToken);
    console.log('📊 Número de bikes:', bikesResponse.data.data.length);
    
    if (bikesResponse.data.data.length > 0) {
      console.log('⚠️  Ciclista já tem bikes cadastradas. Teste pode não ser válido.');
    }

    // 5. Tentar criar agendamento SEM ter bikes (deve falhar)
    console.log('\n❌ Tentando criar agendamento sem bikes (deve falhar)...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentData = {
      workshopId: workshopId,
      appointmentDate: tomorrow.toISOString().split('T')[0],
      appointmentTime: '14:00',
      serviceType: 'complete',
      description: 'Teste de validação - não deve funcionar',
      bikeInfo: {
        brand: 'Trek',
        model: 'Test',
        type: 'mountain'
      },
      requestedServices: [{
        name: 'Teste',
        description: 'Serviço de teste'
      }]
    };

    try {
      await makeRequest('POST', '/appointments', appointmentData, cyclistToken);
      console.log('❌ FALHA NO TESTE: Agendamento foi criado mesmo sem bikes!');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ SUCESSO: Agendamento foi rejeitado corretamente');
        console.log('📝 Mensagem:', error.response.data.message);
        
        // Verificar se a mensagem está correta
        if (error.response.data.message.includes('bicicleta cadastrada')) {
          console.log('✅ Mensagem de erro está correta');
        } else {
          console.log('⚠️  Mensagem de erro inesperada:', error.response.data.message);
        }
      } else {
        console.log('❌ Erro inesperado:', error.response?.data || error.message);
        return false;
      }
    }

    // 6. Adicionar uma bike ao ciclista
    console.log('\n🚲 Adicionando bike ao ciclista...');
    const bikeData = {
      brand: 'Trek',
      model: 'Mountain Bike Test',
      year: 2023,
      type: 'mountain',
      serialNumber: 'TEST123',
      totalKm: 0
    };

    await makeRequest('POST', '/users/bikes', bikeData, cyclistToken);
    console.log('✅ Bike adicionada com sucesso');

    // 7. Tentar criar agendamento novamente (agora deve funcionar)
    console.log('\n✅ Tentando criar agendamento com bike cadastrada (deve funcionar)...');
    
    try {
      const appointmentResponse = await makeRequest('POST', '/appointments', appointmentData, cyclistToken);
      console.log('✅ SUCESSO: Agendamento criado com sucesso!');
      console.log('📝 ID do agendamento:', appointmentResponse.data._id);
    } catch (error) {
      console.log('❌ FALHA: Agendamento não foi criado mesmo com bike cadastrada');
      console.log('📝 Erro:', error.response?.data || error.message);
      return false;
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TESTE DE VALIDAÇÃO CONCLUÍDO COM SUCESSO!');
    console.log('\n📊 Resumo:');
    console.log('   ✅ Agendamento rejeitado sem bikes');
    console.log('   ✅ Agendamento aceito com bikes');
    console.log('   ✅ Mensagens de erro adequadas');
    
    return true;

  } catch (error) {
    console.log('\n❌ ERRO NO TESTE!');
    console.error('Erro:', error.response?.data || error.message);
    return false;
  }
};

// Executar teste se chamado diretamente
if (require.main === module) {
  testBikeValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testBikeValidation };