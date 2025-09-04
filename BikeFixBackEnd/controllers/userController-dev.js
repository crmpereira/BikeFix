// Controlador de Usuários para Desenvolvimento (Mock)
const jwt = require('jsonwebtoken');

// Dados mock de bicicletas para desenvolvimento
let mockBikes = [
  {
    _id: '507f1f77bcf86cd799439021',
    userId: '507f1f77bcf86cd799439001', // César Pereira
    brand: 'Trek',
    model: 'Domane SL 5',
    year: 2023,
    type: 'road',
    serialNumber: 'TRK2023001',
    purchaseDate: new Date('2023-03-15'),
    lastMaintenance: new Date('2024-11-01'),
    totalKm: 2500,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-11-01')
  },
  {
    _id: '507f1f77bcf86cd799439022',
    userId: '507f1f77bcf86cd799439001', // César Pereira
    brand: 'Specialized',
    model: 'Rockhopper',
    year: 2022,
    type: 'mountain',
    serialNumber: 'SPZ2022001',
    purchaseDate: new Date('2022-08-20'),
    lastMaintenance: new Date('2024-10-15'),
    totalKm: 1800,
    createdAt: new Date('2022-08-20'),
    updatedAt: new Date('2024-10-15')
  }
];

// Função para gerar ID único
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// @desc    Obter bicicletas do usuário
// @route   GET /api/users/bikes
// @access  Private
const getUserBikes = async (req, res) => {
  try {
    console.log('🚲 Buscando bikes do usuário (MOCK):', req.user._id);
    
    // Filtrar bikes do usuário logado
    const userBikes = mockBikes.filter(bike => bike.userId === req.user._id);
    
    console.log('✅ Bikes encontradas (MOCK):', userBikes.length);
    
    res.json({
      success: true,
      data: userBikes
    });
  } catch (error) {
    console.error('❌ Erro ao buscar bikes (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Adicionar nova bicicleta
// @route   POST /api/users/bikes
// @access  Private
const addUserBike = async (req, res) => {
  try {
    console.log('🚲 Adicionando nova bike (MOCK):', req.body);
    
    const { brand, model, year, type, serialNumber, purchaseDate, lastMaintenance, totalKm } = req.body;
    
    // Validação básica
    if (!brand || !model || !year || !type) {
      return res.status(400).json({
        success: false,
        message: 'Marca, modelo, ano e tipo são obrigatórios'
      });
    }
    
    // Criar nova bike
    const newBike = {
      _id: generateId(),
      userId: req.user._id,
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year),
      type,
      serialNumber: serialNumber?.trim() || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
      totalKm: parseFloat(totalKm) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Adicionar à lista mock
    mockBikes.push(newBike);
    
    console.log('✅ Bike adicionada com sucesso (MOCK):', newBike._id);
    
    res.status(201).json({
      success: true,
      message: 'Bicicleta adicionada com sucesso',
      data: newBike
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar bike (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar bicicleta
// @route   PUT /api/users/bikes/:bikeId
// @access  Private
const updateUserBike = async (req, res) => {
  try {
    const { bikeId } = req.params;
    console.log('🚲 Atualizando bike (MOCK):', bikeId, req.body);
    
    // Encontrar bike
    const bikeIndex = mockBikes.findIndex(bike => bike._id === bikeId && bike.userId === req.user._id);
    
    if (bikeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bicicleta não encontrada'
      });
    }
    
    const { brand, model, year, type, serialNumber, purchaseDate, lastMaintenance, totalKm } = req.body;
    
    // Atualizar bike
    mockBikes[bikeIndex] = {
      ...mockBikes[bikeIndex],
      brand: brand?.trim() || mockBikes[bikeIndex].brand,
      model: model?.trim() || mockBikes[bikeIndex].model,
      year: year ? parseInt(year) : mockBikes[bikeIndex].year,
      type: type || mockBikes[bikeIndex].type,
      serialNumber: serialNumber?.trim() || mockBikes[bikeIndex].serialNumber,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : mockBikes[bikeIndex].purchaseDate,
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : mockBikes[bikeIndex].lastMaintenance,
      totalKm: totalKm !== undefined ? parseFloat(totalKm) : mockBikes[bikeIndex].totalKm,
      updatedAt: new Date()
    };
    
    console.log('✅ Bike atualizada com sucesso (MOCK):', bikeId);
    
    res.json({
      success: true,
      message: 'Bicicleta atualizada com sucesso',
      data: mockBikes[bikeIndex]
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar bike (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar bicicleta
// @route   DELETE /api/users/bikes/:bikeId
// @access  Private
const deleteUserBike = async (req, res) => {
  try {
    const { bikeId } = req.params;
    console.log('🚲 Deletando bike (MOCK):', bikeId);
    
    // Encontrar bike
    const bikeIndex = mockBikes.findIndex(bike => bike._id === bikeId && bike.userId === req.user._id);
    
    if (bikeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bicicleta não encontrada'
      });
    }
    
    // Remover bike
    mockBikes.splice(bikeIndex, 1);
    
    console.log('✅ Bike deletada com sucesso (MOCK):', bikeId);
    
    res.json({
      success: true,
      message: 'Bicicleta deletada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar bike (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getUserBikes,
  addUserBike,
  updateUserBike,
  deleteUserBike
};