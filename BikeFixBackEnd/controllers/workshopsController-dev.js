// Controlador mock para workshops - Desenvolvimento
// Este arquivo simula operações de workshops sem banco de dados

// Dados mock de oficinas - Joinville/SC
const mockWorkshops = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Bike Center Joinville',
    description: 'Especializada em manutenção e vendas de bicicletas no centro de Joinville',
    address: {
      street: 'Rua do Príncipe, 1250',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89201-200',
      coordinates: {
        lat: -26.3044,
        lng: -48.8487
      }
    },
    phone: '(47) 3422-1234',
    email: 'contato@bikecenterjoinville.com.br',
    services: [
      { name: 'Manutenção Básica', price: 45.00 },
      { name: 'Troca de Pneu', price: 28.00 },
      { name: 'Ajuste de Freios', price: 22.00 },
      { name: 'Regulagem de Câmbio', price: 35.00 }
    ],
    rating: 4.6,
    reviewCount: 87,
    isActive: true,
    workingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '14:00' },
      sunday: { closed: true }
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Oficina Duas Rodas',
    description: 'Serviços especializados em bikes urbanas e mountain bikes',
    address: {
      street: 'Rua Visconde de Taunay, 890',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89203-005',
      coordinates: {
        lat: -26.3051,
        lng: -48.8420
      }
    },
    phone: '(47) 99876-5432',
    email: 'contato@duasrodas.com.br',
    services: [
      { name: 'Manutenção Completa MTB', price: 150.00 },
      { name: 'Limpeza e Lubrificação', price: 38.00 },
      { name: 'Troca de Corrente', price: 45.00 },
      { name: 'Ajuste de Suspensão', price: 80.00 }
    ],
    rating: 4.8,
    reviewCount: 124,
    isActive: true,
    workingHours: {
      monday: { open: '07:30', close: '18:30' },
      tuesday: { open: '07:30', close: '18:30' },
      wednesday: { open: '07:30', close: '18:30' },
      thursday: { open: '07:30', close: '18:30' },
      friday: { open: '07:30', close: '18:30' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: { open: '09:00', close: '14:00' }
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Bike Shop Bucarein',
    description: 'Tradição em consertos e acessórios no bairro Bucarein',
    address: {
      street: 'Rua Blumenau, 567',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89202-310',
      coordinates: {
        lat: -26.2987,
        lng: -48.8512
      }
    },
    phone: '(47) 3433-7890',
    email: 'contato@bikeshopbucarein.com.br',
    services: [
      { name: 'Conserto de Pneu', price: 18.00 },
      { name: 'Manutenção Preventiva', price: 55.00 },
      { name: 'Instalação de Acessórios', price: 40.00 },
      { name: 'Revisão Geral', price: 85.00 }
    ],
    rating: 4.3,
    reviewCount: 56,
    isActive: true,
    workingHours: {
      monday: { open: '08:30', close: '17:30' },
      tuesday: { open: '08:30', close: '17:30' },
      wednesday: { open: '08:30', close: '17:30' },
      thursday: { open: '08:30', close: '17:30' },
      friday: { open: '08:30', close: '17:30' },
      saturday: { open: '08:00', close: '13:00' },
      sunday: { closed: true }
    },
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-11-28')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Ciclo Tech Joinville',
    description: 'Tecnologia e inovação em manutenção de bicicletas',
    address: {
      street: 'Av. Santos Dumont, 1456',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89218-200',
      coordinates: {
        lat: -26.2890,
        lng: -48.8356
      }
    },
    phone: '(47) 3027-4567',
    email: 'atendimento@ciclotechjoinville.com.br',
    services: [
      { name: 'Diagnóstico Eletrônico', price: 60.00 },
      { name: 'Manutenção E-bike', price: 180.00 },
      { name: 'Upgrade de Componentes', price: 120.00 },
      { name: 'Customização', price: 200.00 }
    ],
    rating: 4.9,
    reviewCount: 203,
    isActive: true,
    workingHours: {
      monday: { open: '08:00', close: '19:00' },
      tuesday: { open: '08:00', close: '19:00' },
      wednesday: { open: '08:00', close: '19:00' },
      thursday: { open: '08:00', close: '19:00' },
      friday: { open: '08:00', close: '19:00' },
      saturday: { open: '08:00', close: '17:00' },
      sunday: { open: '09:00', close: '15:00' }
    },
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Bike Express Zona Norte',
    description: 'Atendimento rápido e eficiente na zona norte de Joinville',
    address: {
      street: 'Rua Itajaí, 234',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89206-001',
      coordinates: {
        lat: -26.2756,
        lng: -48.8623
      }
    },
    phone: '(47) 99234-5678',
    email: 'zonanorte@bikeexpress.com.br',
    services: [
      { name: 'Reparo Rápido', price: 25.00 },
      { name: 'Calibragem de Pneus', price: 8.00 },
      { name: 'Ajuste Básico', price: 30.00 },
      { name: 'Limpeza Express', price: 20.00 }
    ],
    rating: 4.4,
    reviewCount: 78,
    isActive: true,
    workingHours: {
      monday: { open: '07:00', close: '20:00' },
      tuesday: { open: '07:00', close: '20:00' },
      wednesday: { open: '07:00', close: '20:00' },
      thursday: { open: '07:00', close: '20:00' },
      friday: { open: '07:00', close: '20:00' },
      saturday: { open: '07:00', close: '18:00' },
      sunday: { open: '08:00', close: '16:00' }
    },
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-12-01')
  }
];

// Obter todas as oficinas
exports.getAllWorkshops = async (req, res) => {
  try {
    console.log('🔧 Buscando oficinas (MOCK)');
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { page = 1, limit = 10, search, city, rating } = req.query;
    let filteredWorkshops = [...mockWorkshops];
    
    // Filtro por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredWorkshops = filteredWorkshops.filter(workshop => 
        workshop.name.toLowerCase().includes(searchLower) ||
        workshop.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por cidade
    if (city) {
      filteredWorkshops = filteredWorkshops.filter(workshop => 
        workshop.address.city.toLowerCase() === city.toLowerCase()
      );
    }
    
    // Filtro por rating
    if (rating) {
      filteredWorkshops = filteredWorkshops.filter(workshop => 
        workshop.rating >= parseFloat(rating)
      );
    }
    
    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWorkshops = filteredWorkshops.slice(startIndex, endIndex);
    
    console.log(`✅ Retornando ${paginatedWorkshops.length} oficinas (MOCK)`);
    
    res.json({
      success: true,
      data: paginatedWorkshops,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredWorkshops.length / limit),
        totalItems: filteredWorkshops.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar oficinas (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter oficina por ID
exports.getWorkshopById = async (req, res) => {
  try {
    console.log(`🔧 Buscando oficina por ID (MOCK): ${req.params.id}`);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const workshop = mockWorkshops.find(w => w._id === req.params.id);
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }
    
    console.log(`✅ Oficina encontrada (MOCK): ${workshop.name}`);
    
    res.json({
      success: true,
      data: workshop
    });
  } catch (error) {
    console.error('❌ Erro ao buscar oficina por ID (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar oficinas próximas
exports.getNearbyWorkshops = async (req, res) => {
  try {
    console.log('🔧 Buscando oficinas próximas (MOCK)');
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude e longitude são obrigatórias'
      });
    }
    
    // Para o mock, retornar todas as oficinas com distância simulada
    const workshopsWithDistance = mockWorkshops.map(workshop => ({
      ...workshop,
      distance: Math.random() * parseFloat(radius) // Distância simulada
    })).sort((a, b) => a.distance - b.distance);
    
    console.log(`✅ Retornando ${workshopsWithDistance.length} oficinas próximas (MOCK)`);
    
    res.json({
      success: true,
      data: workshopsWithDistance
    });
  } catch (error) {
    console.error('❌ Erro ao buscar oficinas próximas (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova oficina (apenas para admins)
exports.createWorkshop = async (req, res) => {
  try {
    console.log('🔧 Criando nova oficina (MOCK)');
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newWorkshop = {
      _id: `507f1f77bcf86cd79943901${mockWorkshops.length + 1}`,
      ...req.body,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockWorkshops.push(newWorkshop);
    
    console.log(`✅ Oficina criada (MOCK): ${newWorkshop.name}`);
    
    res.status(201).json({
      success: true,
      data: newWorkshop,
      message: 'Oficina criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar oficina (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar oficina
exports.updateWorkshop = async (req, res) => {
  try {
    console.log(`🔧 Atualizando oficina (MOCK): ${req.params.id}`);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const workshopIndex = mockWorkshops.findIndex(w => w._id === req.params.id);
    
    if (workshopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }
    
    mockWorkshops[workshopIndex] = {
      ...mockWorkshops[workshopIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    console.log(`✅ Oficina atualizada (MOCK): ${mockWorkshops[workshopIndex].name}`);
    
    res.json({
      success: true,
      data: mockWorkshops[workshopIndex],
      message: 'Oficina atualizada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar oficina (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar oficina
exports.deleteWorkshop = async (req, res) => {
  try {
    console.log(`🔧 Deletando oficina (MOCK): ${req.params.id}`);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const workshopIndex = mockWorkshops.findIndex(w => w._id === req.params.id);
    
    if (workshopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }
    
    const deletedWorkshop = mockWorkshops.splice(workshopIndex, 1)[0];
    
    console.log(`✅ Oficina deletada (MOCK): ${deletedWorkshop.name}`);
    
    res.json({
      success: true,
      message: 'Oficina deletada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar oficina (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Exportar dados mock para uso em outros controladores
module.exports.mockWorkshops = mockWorkshops;