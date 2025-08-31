const axios = require('axios');

// Dados das oficinas para adicionar via API
const workshopsData = [
  {
    name: 'João Silva',
    email: 'joao@bikecenter.com.br',
    password: '123456',
    phone: '(11) 1234-5678',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Bike Center',
      cnpj: '12.345.678/0001-90',
      description: 'Oficina especializada em manutenção e reparo de bikes com mais de 15 anos de experiência.',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        coordinates: { lat: -23.5505, lng: -46.6333 }
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
        { name: 'Manutenção Preventiva', description: 'Revisão completa da bike', basePrice: 80, estimatedTime: 120 },
        { name: 'Troca de Pneus', description: 'Substituição de pneus e câmaras', basePrice: 45, estimatedTime: 30 },
        { name: 'Ajuste de Freios', description: 'Regulagem do sistema de freios', basePrice: 35, estimatedTime: 45 },
        { name: 'Ajuste de Câmbio', description: 'Regulagem do sistema de transmissão', basePrice: 40, estimatedTime: 60 }
      ],
      isApproved: true
    }
  },
  {
    name: 'Maria Santos',
    email: 'maria@speedbikes.com.br',
    password: '123456',
    phone: '(11) 9876-5432',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Speed Bikes',
      cnpj: '98.765.432/0001-10',
      description: 'Especialistas em bikes de alta performance e speed.',
      address: {
        street: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        coordinates: { lat: -23.5618, lng: -46.6565 }
      },
      workingHours: {
        monday: { open: '09:00', close: '19:00', isOpen: true },
        tuesday: { open: '09:00', close: '19:00', isOpen: true },
        wednesday: { open: '09:00', close: '19:00', isOpen: true },
        thursday: { open: '09:00', close: '19:00', isOpen: true },
        friday: { open: '09:00', close: '19:00', isOpen: true },
        saturday: { open: '09:00', close: '16:00', isOpen: true },
        sunday: { open: '', close: '', isOpen: false }
      },
      services: [
        { name: 'Manutenção Completa', description: 'Revisão completa com componentes', basePrice: 150, estimatedTime: 180 },
        { name: 'Upgrade de Componentes', description: 'Atualização de peças', basePrice: 200, estimatedTime: 240 },
        { name: 'Limpeza Profissional', description: 'Limpeza completa e lubrificação', basePrice: 50, estimatedTime: 60 },
        { name: 'Ajuste Aerodinâmico', description: 'Ajuste de posição aerodinâmica', basePrice: 120, estimatedTime: 90 }
      ],
      isApproved: true
    }
  },
  {
    name: 'Carlos Oliveira',
    email: 'carlos@ciclorepair.com.br',
    password: '123456',
    phone: '(11) 5555-1234',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Ciclo Repair',
      cnpj: '55.555.555/0001-55',
      description: 'Oficina de bairro com preços acessíveis e atendimento personalizado.',
      address: {
        street: 'Rua Augusta, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-100',
        coordinates: { lat: -23.5489, lng: -46.6388 }
      },
      workingHours: {
        monday: { open: '08:30', close: '17:30', isOpen: true },
        tuesday: { open: '08:30', close: '17:30', isOpen: true },
        wednesday: { open: '08:30', close: '17:30', isOpen: true },
        thursday: { open: '08:30', close: '17:30', isOpen: true },
        friday: { open: '08:30', close: '17:30', isOpen: true },
        saturday: { open: '08:30', close: '13:00', isOpen: true },
        sunday: { open: '', close: '', isOpen: false }
      },
      services: [
        { name: 'Reparo de Pneus', description: 'Conserto de furos e troca de câmaras', basePrice: 15, estimatedTime: 20 },
        { name: 'Ajuste de Câmbio', description: 'Regulagem básica do sistema de marchas', basePrice: 30, estimatedTime: 45 },
        { name: 'Soldas e Reparos', description: 'Soldas em quadros e reparos estruturais', basePrice: 80, estimatedTime: 120 },
        { name: 'Manutenção Básica', description: 'Lubrificação e ajustes básicos', basePrice: 40, estimatedTime: 60 }
      ],
      isApproved: true
    }
  }
];

const addWorkshopsViaAPI = async () => {
  try {
    console.log('🌱 Adicionando oficinas via API...');
    
    for (const workshop of workshopsData) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', workshop);
        
        if (response.data.success) {
          console.log(`✅ Oficina criada: ${workshop.workshopData.businessName}`);
        } else {
          console.log(`⚠️  Oficina já existe: ${workshop.workshopData.businessName}`);
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('já está em uso')) {
          console.log(`⚠️  Oficina já existe: ${workshop.workshopData.businessName}`);
        } else {
          console.error(`❌ Erro ao criar oficina ${workshop.workshopData.businessName}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    // Verificar se as oficinas foram criadas
    const response = await axios.get('http://localhost:5000/api/workshops');
    console.log(`\n📊 Total de oficinas no sistema: ${response.data.count}`);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 Oficinas disponíveis:');
      response.data.data.forEach((workshop, index) => {
        console.log(`${index + 1}. ${workshop.name} (${workshop.email})`);
      });
    }
    
    console.log('\n🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error.message);
  }
};

addWorkshopsViaAPI();