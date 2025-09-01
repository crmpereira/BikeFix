// Script para executar diretamente no MongoDB Atlas ou Compass
// Copie e cole este código no MongoDB Compass ou Atlas Data Explorer

// Selecione o database 'bikefix' e a collection 'users'
// Execute este script na aba "Aggregation" ou "Documents"

// Dados das oficinas de Joinville para inserir
const joinvilleWorkshops = [
  {
    name: 'Carlos Silva',
    email: 'carlos@bikejoinville1.com.br',
    password: '$2a$10$YourHashedPasswordHere1', // Senha: BikeCenter2024!
    phone: '(47) 3422-1234',
    userType: 'workshop',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    password: '$2a$10$YourHashedPasswordHere2', // Senha: BikeExpress2024!
    phone: '(47) 3455-6789',
    userType: 'workshop',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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

// Para inserir no MongoDB Atlas/Compass:
// 1. Abra o MongoDB Compass ou Atlas Data Explorer
// 2. Conecte ao cluster 'bikefix-production'
// 3. Selecione o database 'bikefix'
// 4. Selecione a collection 'users'
// 5. Clique em 'INSERT DOCUMENT'
// 6. Cole cada objeto do array acima (um por vez)
// 7. Clique em 'INSERT'

// Ou use este comando no MongoDB Shell:
// db.users.insertMany(joinvilleWorkshops);

// Para verificar se foram inseridas:
// db.users.find({"workshopData.address.city": "Joinville"}).pretty();

console.log('📋 Dados das oficinas de Joinville preparados para inserção:');
console.log('🏪 Oficina 1:', joinvilleWorkshops[0].workshopData.businessName);
console.log('📧 Email:', joinvilleWorkshops[0].email);
console.log('📍 CEP:', joinvilleWorkshops[0].workshopData.address.zipCode);
console.log('');
console.log('🏪 Oficina 2:', joinvilleWorkshops[1].workshopData.businessName);
console.log('📧 Email:', joinvilleWorkshops[1].email);
console.log('📍 CEP:', joinvilleWorkshops[1].workshopData.address.zipCode);
console.log('');
console.log('💡 Para inserir, use o comando: db.users.insertMany(joinvilleWorkshops);');