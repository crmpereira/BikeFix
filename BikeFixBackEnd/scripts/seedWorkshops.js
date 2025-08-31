const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/database-dev');
require('dotenv').config();

// Dados das oficinas para popular o banco
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
      description: 'Oficina especializada em manutenção e reparo de bikes com mais de 15 anos de experiência. Oferecemos serviços completos para todos os tipos de bikes.',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        coordinates: {
          lat: -23.5505,
          lng: -46.6333
        }
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
        {
          name: 'Manutenção Preventiva',
          description: 'Revisão completa da bike incluindo ajustes e lubrificação',
          basePrice: 80,
          estimatedTime: 120
        },
        {
          name: 'Troca de Pneus',
          description: 'Substituição de pneus e câmaras de ar',
          basePrice: 45,
          estimatedTime: 30
        },
        {
          name: 'Ajuste de Freios',
          description: 'Regulagem e manutenção do sistema de freios',
          basePrice: 35,
          estimatedTime: 45
        },
        {
          name: 'Ajuste de Câmbio',
          description: 'Regulagem do sistema de transmissão',
          basePrice: 40,
          estimatedTime: 60
        }
      ],
      rating: {
        average: 4.8,
        count: 156
      },
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
      description: 'Especialistas em bikes de alta performance e speed. Atendemos ciclistas profissionais e amadores com equipamentos de última geração.',
      address: {
        street: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        coordinates: {
          lat: -23.5618,
          lng: -46.6565
        }
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
        {
          name: 'Manutenção Completa',
          description: 'Revisão completa com troca de componentes desgastados',
          basePrice: 150,
          estimatedTime: 180
        },
        {
          name: 'Upgrade de Componentes',
          description: 'Atualização de peças para melhor performance',
          basePrice: 200,
          estimatedTime: 240
        },
        {
          name: 'Limpeza Profissional',
          description: 'Limpeza completa e lubrificação da bike',
          basePrice: 50,
          estimatedTime: 60
        },
        {
          name: 'Ajuste Aerodinâmico',
          description: 'Ajuste de posição para melhor aerodinâmica',
          basePrice: 120,
          estimatedTime: 90
        }
      ],
      rating: {
        average: 4.5,
        count: 89
      },
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
      description: 'Oficina de bairro com preços acessíveis e atendimento personalizado. Especializada em reparos rápidos e manutenção básica.',
      address: {
        street: 'Rua Augusta, 789',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-100',
        coordinates: {
          lat: -23.5489,
          lng: -46.6388
        }
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
        {
          name: 'Reparo de Pneus',
          description: 'Conserto de furos e troca de câmaras',
          basePrice: 15,
          estimatedTime: 20
        },
        {
          name: 'Ajuste de Câmbio',
          description: 'Regulagem básica do sistema de marchas',
          basePrice: 30,
          estimatedTime: 45
        },
        {
          name: 'Soldas e Reparos',
          description: 'Soldas em quadros e reparos estruturais',
          basePrice: 80,
          estimatedTime: 120
        },
        {
          name: 'Manutenção Básica',
          description: 'Lubrificação e ajustes básicos',
          basePrice: 40,
          estimatedTime: 60
        }
      ],
      rating: {
        average: 4.2,
        count: 67
      },
      isApproved: true
    }
  },
  {
    name: 'Ana Costa',
    email: 'ana@bikemaster.com.br',
    password: '123456',
    phone: '(11) 7777-8888',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Bike Master',
      cnpj: '77.777.777/0001-77',
      description: 'Oficina premium especializada em bikes importadas e de alta qualidade. Técnicos certificados e peças originais.',
      address: {
        street: 'Rua Oscar Freire, 321',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-001',
        coordinates: {
          lat: -23.5693,
          lng: -46.6658
        }
      },
      workingHours: {
        monday: { open: '10:00', close: '20:00', isOpen: true },
        tuesday: { open: '10:00', close: '20:00', isOpen: true },
        wednesday: { open: '10:00', close: '20:00', isOpen: true },
        thursday: { open: '10:00', close: '20:00', isOpen: true },
        friday: { open: '10:00', close: '20:00', isOpen: true },
        saturday: { open: '10:00', close: '18:00', isOpen: true },
        sunday: { open: '12:00', close: '17:00', isOpen: true }
      },
      services: [
        {
          name: 'Revisão Premium',
          description: 'Revisão completa com peças originais',
          basePrice: 250,
          estimatedTime: 300
        },
        {
          name: 'Customização',
          description: 'Personalização completa da bike',
          basePrice: 500,
          estimatedTime: 480
        },
        {
          name: 'Diagnóstico Eletrônico',
          description: 'Análise completa com equipamentos especializados',
          basePrice: 100,
          estimatedTime: 90
        },
        {
          name: 'Montagem Completa',
          description: 'Montagem de bike do zero',
          basePrice: 300,
          estimatedTime: 360
        }
      ],
      rating: {
        average: 4.9,
        count: 203
      },
      isApproved: true
    }
  },
  {
    name: 'Roberto Silva',
    email: 'roberto@mountainbikes.com.br',
    password: '123456',
    phone: '(11) 9999-0000',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Mountain Bikes SP',
      cnpj: '99.999.999/0001-99',
      description: 'Especialistas em mountain bikes e bikes de trilha. Equipamentos para aventureiros e esportistas radicais.',
      address: {
        street: 'Av. Rebouças, 1500',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05402-100',
        coordinates: {
          lat: -23.5629,
          lng: -46.6731
        }
      },
      workingHours: {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '08:00', close: '16:00', isOpen: true },
        sunday: { open: '09:00', close: '15:00', isOpen: true }
      },
      services: [
        {
          name: 'Suspensão MTB',
          description: 'Manutenção e regulagem de suspensões',
          basePrice: 120,
          estimatedTime: 150
        },
        {
          name: 'Freios Hidráulicos',
          description: 'Manutenção de freios a disco hidráulicos',
          basePrice: 90,
          estimatedTime: 90
        },
        {
          name: 'Tubeless Setup',
          description: 'Conversão para sistema tubeless',
          basePrice: 80,
          estimatedTime: 60
        },
        {
          name: 'Preparação para Trilha',
          description: 'Revisão completa para aventuras off-road',
          basePrice: 150,
          estimatedTime: 180
        }
      ],
      rating: {
        average: 4.7,
        count: 124
      },
      isApproved: true
    }
  }
];

// Função para popular o banco com oficinas
const seedWorkshops = async () => {
  try {
    console.log('🌱 Iniciando seed das oficinas...');
    
    // Verificar se já existem oficinas
    const existingWorkshops = await User.find({ userType: 'workshop' });
    
    if (existingWorkshops.length > 0) {
      console.log(`⚠️  Já existem ${existingWorkshops.length} oficinas no banco.`);
      console.log('Deseja continuar e adicionar mais oficinas? (y/n)');
      
      // Para automação, vamos limpar e recriar
      console.log('🗑️  Removendo oficinas existentes...');
      await User.deleteMany({ userType: 'workshop' });
      console.log('✅ Oficinas removidas com sucesso!');
    }
    
    // Criar as oficinas
    console.log('📝 Criando oficinas...');
    
    for (const workshopData of workshopsData) {
      try {
        const workshop = new User(workshopData);
        await workshop.save();
        console.log(`✅ Oficina criada: ${workshopData.workshopData.businessName}`);
      } catch (error) {
        console.error(`❌ Erro ao criar oficina ${workshopData.workshopData.businessName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Seed das oficinas concluído com sucesso!');
    console.log(`📊 Total de oficinas criadas: ${workshopsData.length}`);
    
    // Verificar se foram criadas
    const createdWorkshops = await User.find({ userType: 'workshop' }).select('workshopData.businessName email');
    console.log('\n📋 Oficinas no banco:');
    createdWorkshops.forEach((workshop, index) => {
      console.log(`${index + 1}. ${workshop.workshopData.businessName} (${workshop.email})`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB fechada.');
    process.exit(0);
  }
};

// Executar o script
const main = async () => {
  await connectDB();
  await seedWorkshops();
};

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});