const https = require('https');

// Oficinas de exemplo para recriar
const workshops = [
  {
    name: "João Silva",
    email: "joao2@bikecenter.com.br",
    password: "123456",
    phone: "(11) 3456-7890",
    userType: "workshop",
    workshopData: {
      businessName: "Bike Center São Paulo",
      cnpj: "12.345.678/0001-90",
      description: "Oficina especializada em bikes urbanas e mountain bikes com mais de 15 anos de experiência",
      address: {
        street: "Rua Augusta, 1234",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        coordinates: {
          lat: -23.5505,
          lng: -46.6520
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
          name: "Manutenção Geral",
          description: "Revisão completa da bike incluindo ajustes e lubrificação",
          basePrice: 80,
          estimatedTime: 120
        },
        {
          name: "Troca de Pneus",
          description: "Substituição de pneus e câmaras de ar",
          basePrice: 45,
          estimatedTime: 30
        },
        {
          name: "Ajuste de Freios",
          description: "Regulagem e manutenção do sistema de freios",
          basePrice: 35,
          estimatedTime: 45
        }
      ],
      rating: {
        average: 4.5,
        count: 50
      },
      isApproved: true
    }
  },
  {
    name: "Maria Santos",
    email: "maria2@pedalecia.com.br",
    password: "123456",
    phone: "(11) 2345-6789",
    userType: "workshop",
    workshopData: {
      businessName: "Pedal & Cia",
      cnpj: "98.765.432/0001-10",
      description: "Especialistas em bikes elétricas e speed com equipamentos de última geração",
      address: {
        street: "Av. Paulista, 2000",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
        coordinates: {
          lat: -23.5613,
          lng: -46.6566
        }
      },
      workingHours: {
        monday: { open: "09:00", close: "19:00", isOpen: true },
        tuesday: { open: "09:00", close: "19:00", isOpen: true },
        wednesday: { open: "09:00", close: "19:00", isOpen: true },
        thursday: { open: "09:00", close: "19:00", isOpen: true },
        friday: { open: "09:00", close: "19:00", isOpen: true },
        saturday: { open: "09:00", close: "15:00", isOpen: true },
        sunday: { open: "", close: "", isOpen: false }
      },
      services: [
        {
          name: "Manutenção de E-bikes",
          description: "Manutenção especializada em bikes elétricas",
          basePrice: 120,
          estimatedTime: 150
        },
        {
          name: "Upgrade de Componentes",
          description: "Atualização de peças para melhor performance",
          basePrice: 200,
          estimatedTime: 180
        }
      ],
      rating: {
        average: 4.8,
        count: 75
      },
      isApproved: true
    }
  },
  {
    name: "Carlos Oliveira",
    email: "carlos2@oficinaciclist.com.br",
    password: "123456",
    phone: "(11) 1234-5678",
    userType: "workshop",
    workshopData: {
      businessName: "Oficina do Ciclista",
      cnpj: "55.555.555/0001-55",
      description: "Atendimento rápido e preços justos para todos os tipos de bikes",
      address: {
        street: "Rua da Consolação, 500",
        city: "São Paulo",
        state: "SP",
        zipCode: "01302-000",
        coordinates: {
          lat: -23.5505,
          lng: -46.6448
        }
      },
      workingHours: {
        monday: { open: "07:00", close: "17:00", isOpen: true },
        tuesday: { open: "07:00", close: "17:00", isOpen: true },
        wednesday: { open: "07:00", close: "17:00", isOpen: true },
        thursday: { open: "07:00", close: "17:00", isOpen: true },
        friday: { open: "07:00", close: "17:00", isOpen: true },
        saturday: { open: "08:00", close: "12:00", isOpen: true },
        sunday: { open: "", close: "", isOpen: false }
      },
      services: [
        {
          name: "Reparo de Pneus",
          description: "Conserto de furos e troca de câmaras",
          basePrice: 15,
          estimatedTime: 20
        },
        {
          name: "Lubrificação",
          description: "Lubrificação completa da corrente e componentes",
          basePrice: 25,
          estimatedTime: 30
        },
        {
          name: "Ajuste Geral",
          description: "Ajustes básicos de freios e câmbio",
          basePrice: 40,
          estimatedTime: 60
        }
      ],
      rating: {
        average: 4.2,
        count: 30
      },
      isApproved: true
    }
  }
];

// Função para fazer requisição POST
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'bikefix-backend.onrender.com',
      port: 443,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } else {
          reject({ status: res.statusCode, data: responseData });
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

// Função principal
async function main() {
  console.log('🚀 Recriando oficinas com verificação automática...');
  
  for (const workshop of workshops) {
    try {
      const result = await makeRequest(workshop);
      console.log(`✅ Oficina "${workshop.name}" (${workshop.workshopData.businessName}) criada com sucesso!`);
      // Pequena pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Erro ao criar "${workshop.name}":`, error);
    }
  }
  
  console.log('\n🎉 Processo concluído!');
}

main();