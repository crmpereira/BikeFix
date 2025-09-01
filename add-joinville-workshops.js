const https = require('https');

// URL da API em produção
const API_BASE_URL = 'https://bikefix-backend.onrender.com';

// Dados das oficinas para Joinville SC
const workshops = [
  {
    name: "Carlos Mendes",
    email: "carlos@bikejoinville1.com.br",
    password: "123456",
    phone: "(47) 3422-1234",
    userType: "workshop",
    workshopData: {
      businessName: "Bike Center Joinville",
      cnpj: "15.678.901/0001-23",
      description: "Oficina especializada em bikes urbanas e mountain bikes no coração de Joinville",
      address: {
        street: "Rua das Palmeiras, 456",
        city: "Joinville",
        state: "SC",
        zipCode: "89202-330",
        coordinates: {
          lat: -26.3044,
          lng: -48.8487
        }
      },
      workingHours: {
        monday: { open: "08:00", close: "18:00", isOpen: true },
        tuesday: { open: "08:00", close: "18:00", isOpen: true },
        wednesday: { open: "08:00", close: "18:00", isOpen: true },
        thursday: { open: "08:00", close: "18:00", isOpen: true },
        friday: { open: "08:00", close: "18:00", isOpen: true },
        saturday: { open: "08:00", close: "14:00", isOpen: true },
        sunday: { open: "", close: "", isOpen: false }
      },
      services: [
        {
          name: "Manutenção Completa",
          description: "Revisão geral da bike com ajustes e lubrificação",
          basePrice: 85,
          estimatedTime: 120
        },
        {
          name: "Reparo de Freios",
          description: "Ajuste e substituição de pastilhas e cabos de freio",
          basePrice: 45,
          estimatedTime: 60
        },
        {
          name: "Troca de Pneus",
          description: "Substituição de pneus e câmaras de ar",
          basePrice: 35,
          estimatedTime: 30
        }
      ],
      rating: {
        average: 4.6,
        count: 28
      },
      isApproved: true
    }
  },
  {
    name: "Ana Silva",
    email: "ana@bikejoinville2.com.br",
    password: "123456",
    phone: "(47) 3455-5678",
    userType: "workshop",
    workshopData: {
      businessName: "Oficina Bike Express Joinville",
      cnpj: "16.789.012/0001-34",
      description: "Serviços rápidos e especializados para todos os tipos de bicicletas em Joinville",
      address: {
        street: "Avenida Santos Dumont, 789",
        city: "Joinville",
        state: "SC",
        zipCode: "89205-652",
        coordinates: {
          lat: -26.2890,
          lng: -48.8420
        }
      },
      workingHours: {
        monday: { open: "07:30", close: "17:30", isOpen: true },
        tuesday: { open: "07:30", close: "17:30", isOpen: true },
        wednesday: { open: "07:30", close: "17:30", isOpen: true },
        thursday: { open: "07:30", close: "17:30", isOpen: true },
        friday: { open: "07:30", close: "17:30", isOpen: true },
        saturday: { open: "08:00", close: "13:00", isOpen: true },
        sunday: { open: "", close: "", isOpen: false }
      },
      services: [
        {
          name: "Revisão Express",
          description: "Revisão rápida com verificação geral dos componentes",
          basePrice: 60,
          estimatedTime: 90
        },
        {
          name: "Ajuste de Câmbio",
          description: "Regulagem precisa do sistema de câmbio",
          basePrice: 40,
          estimatedTime: 45
        },
        {
          name: "Limpeza e Lubrificação",
          description: "Limpeza completa e lubrificação da corrente e componentes",
          basePrice: 30,
          estimatedTime: 40
        },
        {
          name: "Upgrade de Componentes",
          description: "Instalação e configuração de novos componentes",
          basePrice: 80,
          estimatedTime: 150
        }
      ],
      rating: {
        average: 4.8,
        count: 35
      },
      isApproved: true
    }
  }
];

// Função para fazer requisição POST
function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Função principal para cadastrar oficinas
async function addWorkshops() {
  console.log('🚀 Iniciando cadastro de oficinas em Joinville SC...');
  console.log(`🌐 API: ${API_BASE_URL}`);
  
  for (let i = 0; i < workshops.length; i++) {
    const workshop = workshops[i];
    
    try {
      console.log(`\n📝 Cadastrando: ${workshop.workshopData.businessName}`);
      console.log(`📧 Email: ${workshop.email}`);
      console.log(`📍 CEP: ${workshop.workshopData.address.zipCode}`);
      
      const response = await makePostRequest(`${API_BASE_URL}/api/auth/register`, workshop);
      
      if (response.statusCode === 201 || response.statusCode === 200) {
        console.log(`✅ Oficina cadastrada com sucesso!`);
        console.log(`🆔 Resposta:`, response.data.message || 'Cadastro realizado');
      } else if (response.statusCode === 400 && response.data.message && response.data.message.includes('já existe')) {
        console.log(`⚠️  Oficina já existe no sistema`);
      } else {
        console.log(`❌ Erro no cadastro:`);
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Resposta:`, response.data);
      }
      
    } catch (error) {
      console.log(`❌ Erro na requisição para ${workshop.workshopData.businessName}:`);
      console.log(`   ${error.message}`);
    }
    
    // Aguardar um pouco entre as requisições
    if (i < workshops.length - 1) {
      console.log('⏳ Aguardando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 Processo de cadastro concluído!');
  console.log('📋 Resumo:');
  console.log(`   • ${workshops.length} oficinas processadas`);
  console.log(`   • Localização: Joinville, SC`);
  console.log(`   • CEPs: 89202-330 e 89205-652`);
  console.log('\n💡 Verifique o painel de administração para aprovar as oficinas se necessário.');
}

// Executar o script
addWorkshops().catch(console.error);