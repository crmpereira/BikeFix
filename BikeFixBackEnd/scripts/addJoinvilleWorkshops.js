const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/database');
require('dotenv').config({ path: '.env.local' });

// Dados das oficinas de Joinville
const joinvilleWorkshopsData = [
  {
    name: 'Carlos Silva',
    email: 'carlos@bikejoinville1.com.br',
    password: 'BikeCenter2024!',
    phone: '(47) 3422-1234',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Bike Center Joinville',
      cnpj: '12.345.678/0001-91',
      description: 'Oficina especializada em bicicletas urbanas e mountain bikes com mais de 15 anos de experiência em Joinville.',
      address: {
        street: 'Rua das Palmeiras, 150',
        neighborhood: 'América',
        city: 'Joinville',
        state: 'SC',
        zipCode: '89202-330',
        coordinates: {
          lat: -26.3044,
          lng: -48.8487
        }
      },
      workingHours: {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '08:00', close: '12:00', isOpen: true },
        sunday: { open: '', close: '', isOpen: false }
      },
      services: [
        {
          name: 'Manutenção Preventiva',
          description: 'Revisão completa da bike incluindo ajustes e lubrificação',
          basePrice: 85,
          estimatedTime: 120
        },
        {
          name: 'Reparo de Freios',
          description: 'Ajuste e substituição de pastilhas e cabos de freio',
          basePrice: 60,
          estimatedTime: 45
        },
        {
          name: 'Troca de Pneus',
          description: 'Substituição de pneus e câmaras de ar',
          basePrice: 50,
          estimatedTime: 30
        },
        {
          name: 'Ajuste de Câmbio',
          description: 'Regulagem e ajuste do sistema de câmbio',
          basePrice: 40,
          estimatedTime: 60
        },
        {
          name: 'Revisão Completa',
          description: 'Revisão geral com limpeza, lubrificação e ajustes',
          basePrice: 120,
          estimatedTime: 180
        },
        {
          name: 'Montagem de Bikes',
          description: 'Montagem completa de bicicletas novas',
          basePrice: 100,
          estimatedTime: 150
        }
      ],
      specialties: ['Mountain Bike', 'Bike Urbana', 'Speed'],
      rating: {
        average: 4.7,
        count: 89
      },
      priceRange: 'Médio',
      acceptsEmergency: true,
      isApproved: true
    }
  },
  {
    name: 'Ana Costa',
    email: 'ana@bikejoinville2.com.br',
    password: 'BikeExpress2024!',
    phone: '(47) 3455-6789',
    userType: 'workshop',
    isVerified: true,
    workshopData: {
      businessName: 'Oficina Bike Express Joinville',
      cnpj: '12.345.678/0001-92',
      description: 'Oficina moderna com atendimento rápido e eficiente, especializada em bikes elétricas e de alta performance.',
      address: {
        street: 'Avenida Santos Dumont, 890',
        neighborhood: 'Zona Industrial Norte',
        city: 'Joinville',
        state: 'SC',
        zipCode: '89205-652',
        coordinates: {
          lat: -26.2775,
          lng: -48.8589
        }
      },
      workingHours: {
        monday: { open: '07:30', close: '17:30', isOpen: true },
        tuesday: { open: '07:30', close: '17:30', isOpen: true },
        wednesday: { open: '07:30', close: '17:30', isOpen: true },
        thursday: { open: '07:30', close: '17:30', isOpen: true },
        friday: { open: '07:30', close: '17:30', isOpen: true },
        saturday: { open: '08:00', close: '14:00', isOpen: true },
        sunday: { open: '', close: '', isOpen: false }
      },
      services: [
        {
          name: 'Manutenção de Bikes Elétricas',
          description: 'Manutenção especializada em bicicletas elétricas',
          basePrice: 150,
          estimatedTime: 180
        },
        {
          name: 'Reparo de Suspensão',
          description: 'Manutenção e reparo de suspensões dianteiras e traseiras',
          basePrice: 120,
          estimatedTime: 120
        },
        {
          name: 'Troca de Correntes',
          description: 'Substituição de correntes e cassetes',
          basePrice: 80,
          estimatedTime: 45
        },
        {
          name: 'Ajuste de Freios a Disco',
          description: 'Ajuste e sangria de freios hidráulicos a disco',
          basePrice: 90,
          estimatedTime: 60
        },
        {
          name: 'Limpeza e Lubrificação',
          description: 'Limpeza profunda e lubrificação completa',
          basePrice: 70,
          estimatedTime: 90
        },
        {
          name: 'Diagnóstico Eletrônico',
          description: 'Diagnóstico de sistemas eletrônicos em bikes elétricas',
          basePrice: 100,
          estimatedTime: 60
        }
      ],
      specialties: ['Bike Elétrica', 'Speed', 'Mountain Bike'],
      rating: {
        average: 4.9,
        count: 156
      },
      priceRange: 'Alto',
      acceptsEmergency: true,
      isApproved: true
    }
  }
];

// Função para adicionar oficinas de Joinville
const addJoinvilleWorkshops = async () => {
  try {
    console.log('🌱 Iniciando cadastro das oficinas de Joinville...');
    
    // Criar as oficinas
    console.log('📝 Criando oficinas...');
    
    for (const workshopData of joinvilleWorkshopsData) {
      try {
        // Verificar se já existe
        const existingWorkshop = await User.findOne({ email: workshopData.email });
        
        if (existingWorkshop) {
          console.log(`⚠️  Oficina ${workshopData.workshopData.businessName} já existe (${workshopData.email})`);
          continue;
        }
        
        const workshop = new User(workshopData);
        await workshop.save();
        console.log(`✅ Oficina criada: ${workshopData.workshopData.businessName}`);
        console.log(`   📧 Email: ${workshopData.email}`);
        console.log(`   📍 CEP: ${workshopData.workshopData.address.zipCode}`);
        console.log(`   🆔 ID: ${workshop._id}`);
      } catch (error) {
        console.error(`❌ Erro ao criar oficina ${workshopData.workshopData.businessName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Cadastro das oficinas de Joinville concluído!');
    console.log(`📊 Total de oficinas processadas: ${joinvilleWorkshopsData.length}`);
    
    // Verificar se foram criadas
    const joinvilleWorkshops = await User.find({ 
      userType: 'workshop',
      'workshopData.address.city': 'Joinville'
    }).select('workshopData.businessName email workshopData.address.zipCode');
    
    console.log('\n📋 Oficinas de Joinville no banco:');
    joinvilleWorkshops.forEach((workshop, index) => {
      console.log(`${index + 1}. ${workshop.workshopData.businessName} (${workshop.email}) - CEP: ${workshop.workshopData.address.zipCode}`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante o cadastro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão com MongoDB fechada.');
    process.exit(0);
  }
};

// Executar o script
const main = async () => {
  await connectDB();
  await addJoinvilleWorkshops();
};

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});