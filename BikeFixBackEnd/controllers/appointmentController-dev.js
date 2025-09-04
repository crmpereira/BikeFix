// Mock data para agendamentos em desenvolvimento
const mockAppointments = [
  {
    _id: '507f1f77bcf86cd799439011',
    cyclist: '507f1f77bcf86cd799439001', // ID do CESAR
    workshop: '507f1f77bcf86cd799439002', // ID da primeira oficina
    appointmentDate: new Date('2024-12-20'),
    appointmentTime: '09:00',
    serviceType: 'Manutenção Geral',
    requestedServices: [
      {
        name: 'Revisão Completa',
        price: 80.00,
        estimatedTime: 120
      },
      {
        name: 'Ajuste de Freios',
        price: 25.00,
        estimatedTime: 30
      }
    ],
    bikeIds: ['507f1f77bcf86cd799439021'], // ID da primeira bike do CESAR
    bikeInfo: [
      {
        brand: 'Trek',
        model: 'Domane SL 5',
        year: 2023,
        type: 'road'
      }
    ],
    description: 'Freio fazendo barulho e corrente pulando',
    urgency: 'medium',
    status: 'pending',
    totalPrice: 105.00,
    estimatedDuration: 150,
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    cyclist: '507f1f77bcf86cd799439001', // ID do CESAR
    workshop: '507f1f77bcf86cd799439003', // ID da segunda oficina
    appointmentDate: new Date('2024-12-22'),
    appointmentTime: '14:30',
    serviceType: 'Reparo Específico',
    requestedServices: [
      {
        name: 'Troca de Pneu',
        price: 45.00,
        estimatedTime: 45
      }
    ],
    bikeIds: ['507f1f77bcf86cd799439022'], // ID da segunda bike do CESAR
    bikeInfo: [
      {
        brand: 'Specialized',
        model: 'Rockhopper',
        year: 2022,
        type: 'mountain'
      }
    ],
    description: 'Pneu furado',
    urgency: 'high',
    status: 'confirmed',
    totalPrice: 45.00,
    estimatedDuration: 45,
    createdAt: new Date('2024-12-14'),
    updatedAt: new Date('2024-12-16')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    cyclist: '507f1f77bcf86cd799439001', // ID do CESAR
    workshop: '507f1f77bcf86cd799439018', // ID da oficina João Silva - Bike Center Joinville
    appointmentDate: new Date('2024-12-23'),
    appointmentTime: '10:00',
    serviceType: 'Manutenção Geral',
    requestedServices: [
      {
        name: 'Revisão Completa',
        price: 120.00,
        estimatedTime: 180
      },
      {
        name: 'Limpeza e Lubrificação',
        price: 35.00,
        estimatedTime: 60
      }
    ],
    bikeIds: ['507f1f77bcf86cd799439021'],
    bikeInfo: [
      {
        brand: 'Trek',
        model: 'Domane SL 5',
        year: 2023,
        type: 'road'
      }
    ],
    description: 'Manutenção preventiva completa',
    urgency: 'low',
    status: 'pending',
    totalPrice: 155.00,
    estimatedDuration: 240,
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-18')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    cyclist: '507f1f77bcf86cd799439002', // ID da Ana Silva
    workshop: '507f1f77bcf86cd799439018', // ID da oficina João Silva - Bike Center Joinville
    appointmentDate: new Date('2024-12-24'),
    appointmentTime: '15:30',
    serviceType: 'Reparo Específico',
    requestedServices: [
      {
        name: 'Ajuste de Câmbio',
        price: 40.00,
        estimatedTime: 45
      }
    ],
    bikeIds: ['507f1f77bcf86cd799439023'],
    bikeInfo: [
      {
        brand: 'Caloi',
        model: 'Elite',
        year: 2021,
        type: 'hybrid'
      }
    ],
    description: 'Câmbio não está trocando as marchas corretamente',
    urgency: 'medium',
    status: 'confirmed',
    totalPrice: 40.00,
    estimatedDuration: 45,
    createdAt: new Date('2024-12-19'),
    updatedAt: new Date('2024-12-20')
  }
];

// Criar novo agendamento
const createAppointment = async (req, res) => {
  try {
    console.log('createAppointment - Dados recebidos:', req.body);
    console.log('createAppointment - Usuário:', req.user);
    
    const {
      workshopId,
      appointmentDate,
      appointmentTime,
      serviceType,
      requestedServices,
      bikeInfo,
      bikeIds,
      description,
      urgency
    } = req.body;

    // Validações básicas
    if (!workshopId || !appointmentDate || !appointmentTime || !requestedServices) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      });
    }

    // Calcular preço total e tempo estimado
    const totalPrice = requestedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
    const estimatedDuration = requestedServices.reduce((sum, service) => sum + parseInt(service.estimatedTime || 0), 0);

    // Criar novo agendamento mock
    const newAppointment = {
      _id: `mock_${Date.now()}`,
      cyclist: req.user._id,
      workshop: workshopId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      serviceType: serviceType || 'Serviço Geral',
      requestedServices,
      bikeIds: bikeIds || [],
      bikeInfo: bikeInfo || [],
      description: description || '',
      urgency: urgency || 'medium',
      status: 'pending',
      totalPrice,
      estimatedDuration,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Adicionar à lista mock
    mockAppointments.push(newAppointment);

    console.log('createAppointment - Agendamento criado:', newAppointment);

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: newAppointment
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar agendamentos do usuário
const getUserAppointments = async (req, res) => {
  try {
    console.log('getUserAppointments - Usuário:', req.user._id);
    
    const { status, page = 1, limit = 10 } = req.query;
    
    // Importar dados mock das oficinas
    const { mockWorkshops } = require('./workshopsController-dev');
    const { mockUsers } = require('./authController-dev');
    
    // Filtrar agendamentos do usuário
    let userAppointments = mockAppointments.filter(apt => apt.cyclist === req.user._id);
    
    // Popular dados da oficina e ciclista
    userAppointments = userAppointments.map(appointment => {
      // Buscar dados da oficina
      const workshop = mockWorkshops.find(w => w._id === appointment.workshop) || 
                      mockUsers.find(u => u._id === appointment.workshop && u.role === 'workshop');
      
      // Buscar dados do ciclista
      const cyclist = mockUsers.find(u => u._id === appointment.cyclist);
      
      return {
        ...appointment,
        workshop: workshop ? {
          _id: workshop._id,
          name: workshop.name || workshop.workshopData?.businessName,
          workshopData: {
            businessName: workshop.name || workshop.workshopData?.businessName,
            address: workshop.address || workshop.workshopData?.address || {},
            phone: workshop.phone || workshop.workshopData?.phone || '',
            rating: workshop.rating || workshop.workshopData?.rating || 0
          }
        } : { _id: appointment.workshop, name: 'Oficina' },
        cyclist: cyclist ? {
          _id: cyclist._id,
          name: cyclist.name,
          email: cyclist.email,
          phone: cyclist.phone
        } : null
      };
    });
    
    // Filtrar por status se fornecido
    if (status) {
      userAppointments = userAppointments.filter(apt => apt.status === status);
    }
    
    // Ordenar por data (mais recentes primeiro)
    userAppointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    
    // Paginação
    const skip = (page - 1) * limit;
    const paginatedAppointments = userAppointments.slice(skip, skip + parseInt(limit));
    
    console.log(`getUserAppointments - Encontrados ${userAppointments.length} agendamentos`);
    
    res.json({
      success: true,
      data: paginatedAppointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(userAppointments.length / limit),
        total: userAppointments.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar agendamentos da oficina
const getWorkshopAppointments = async (req, res) => {
  try {
    console.log('getWorkshopAppointments - Oficina:', req.user._id);
    
    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Verificar se o usuário é uma oficina
    if (req.user.userType !== 'workshop') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas oficinas podem acessar esta rota.'
      });
    }
    
    // Filtrar agendamentos da oficina
    let workshopAppointments = mockAppointments.filter(apt => apt.workshop === req.user._id);
    
    // Filtrar por status se fornecido
    if (status) {
      workshopAppointments = workshopAppointments.filter(apt => apt.status === status);
    }
    
    // Filtrar por data se fornecido
    if (date) {
      const filterDate = new Date(date);
      workshopAppointments = workshopAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === filterDate.toDateString();
      });
    }
    
    // Ordenar por data e horário
    workshopAppointments.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
      return dateA - dateB;
    });
    
    // Paginação
    const skip = (page - 1) * limit;
    const paginatedAppointments = workshopAppointments.slice(skip, skip + parseInt(limit));
    
    console.log(`getWorkshopAppointments - Encontrados ${workshopAppointments.length} agendamentos`);
    
    res.json({
      success: true,
      data: paginatedAppointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(workshopAppointments.length / limit),
        total: workshopAppointments.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar agendamentos da oficina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar agendamento por ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = mockAppointments.find(apt => apt._id === id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    // Verificar se o usuário tem permissão para ver este agendamento
    if (appointment.cyclist !== req.user._id && appointment.workshop !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar status do agendamento
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointmentIndex = mockAppointments.findIndex(apt => apt._id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    const appointment = mockAppointments[appointmentIndex];
    
    // Verificar permissões
    if (appointment.cyclist !== req.user._id && appointment.workshop !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    // Atualizar status
    mockAppointments[appointmentIndex].status = status;
    mockAppointments[appointmentIndex].updatedAt = new Date();
    
    console.log(`updateAppointmentStatus - Status atualizado para: ${status}`);
    
    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: mockAppointments[appointmentIndex]
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar agendamento
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const appointmentIndex = mockAppointments.findIndex(apt => apt._id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    const appointment = mockAppointments[appointmentIndex];
    
    // Verificar permissões
    if (appointment.cyclist !== req.user._id && appointment.workshop !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    // Cancelar agendamento
    mockAppointments[appointmentIndex].status = 'cancelled';
    mockAppointments[appointmentIndex].cancellationReason = reason;
    mockAppointments[appointmentIndex].updatedAt = new Date();
    
    console.log('cancelAppointment - Agendamento cancelado');
    
    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: mockAppointments[appointmentIndex]
    });

  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar horários disponíveis
const getAvailableSlots = async (req, res) => {
  try {
    const { workshopId, date } = req.query;
    
    if (!workshopId || !date) {
      return res.status(400).json({
        success: false,
        message: 'ID da oficina e data são obrigatórios'
      });
    }
    
    // Buscar agendamentos existentes para a data
    const filterDate = new Date(date);
    const existingAppointments = mockAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return apt.workshop === workshopId && 
             aptDate.toDateString() === filterDate.toDateString() &&
             ['pending', 'confirmed', 'in_progress'].includes(apt.status);
    });
    
    // Horários padrão
    const allSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];
    
    // Remover horários ocupados
    const occupiedSlots = existingAppointments.map(apt => apt.appointmentTime);
    const availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));
    
    console.log(`getAvailableSlots - ${availableSlots.length} horários disponíveis para ${date}`);
    
    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        occupiedSlots
      }
    });

  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Funções placeholder para orçamentos adicionais
const addAdditionalBudget = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidade não implementada no modo de desenvolvimento'
  });
};

const approveAdditionalBudget = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidade não implementada no modo de desenvolvimento'
  });
};

const rejectAdditionalBudget = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidade não implementada no modo de desenvolvimento'
  });
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getWorkshopAppointments,
  getAvailableSlots,
  addAdditionalBudget,
  approveAdditionalBudget,
  rejectAdditionalBudget
};