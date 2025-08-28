const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Criar novo agendamento
const createAppointment = async (req, res) => {
  try {
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

    // Verificar se a oficina existe
    const workshop = await User.findOne({ _id: workshopId, userType: 'workshop' });
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }

    // Verificar se a data/hora não está no passado
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Data e horário devem ser no futuro'
      });
    }

    // Verificar se já existe agendamento no mesmo horário para a oficina
    const existingAppointment = await Appointment.findOne({
      workshop: workshopId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Horário já ocupado. Escolha outro horário.'
      });
    }

    // Calcular preço total
    let totalPrice = 0;
    if (requestedServices && requestedServices.length > 0) {
      totalPrice = requestedServices.reduce((sum, service) => sum + (service.price || 0), 0);
    }

    // Criar agendamento
    const appointment = new Appointment({
      cyclist: req.user.id,
      workshop: workshopId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      serviceType,
      requestedServices: requestedServices || [],
      bikeIds: bikeIds || [],
      bikeInfo: bikeInfo || {},
      description: description || '',
      urgency: urgency || 'normal',
      totalPrice,
      status: 'pending'
    });

    await appointment.save();

    // Popular dados para resposta
    await appointment.populate([
      { path: 'cyclist', select: 'name email phone' },
      { path: 'workshop', select: 'businessName address phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: appointment
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Buscar agendamentos do usuário
const getUserAppointments = async (req, res) => {
  try {
    console.log('getUserAppointments - Iniciando busca para usuário:', req.user.id);
    const { status, page = 1, limit = 10 } = req.query;
    console.log('getUserAppointments - Parâmetros:', { status, page, limit });
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = { cyclist: req.user.id };
    if (status) {
      filters.status = status;
    }
    console.log('getUserAppointments - Filtros:', filters);

    // Buscar agendamentos
    console.log('getUserAppointments - Executando query...');
    
    // Primeiro, vamos verificar se existem agendamentos sem populate
    const appointmentsCount = await Appointment.countDocuments(filters);
    console.log('getUserAppointments - Total de agendamentos sem populate:', appointmentsCount);
    
    const appointments = await Appointment.find(filters)
      .populate('workshop', 'name email workshopData')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    console.log('getUserAppointments - Agendamentos encontrados após populate:', appointments.length);
    
    // Log detalhado dos primeiros agendamentos
    if (appointments.length > 0) {
      console.log('getUserAppointments - Primeiro agendamento:', {
        id: appointments[0]._id,
        cyclist: appointments[0].cyclist,
        workshop: appointments[0].workshop,
        appointmentDate: appointments[0].appointmentDate
      });
    }

    // Contar total
    const total = await Appointment.countDocuments(filters);
    console.log('getUserAppointments - Total de agendamentos:', total);

    const response = {
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
    
    console.log('getUserAppointments - Resposta final:', {
      success: response.success,
      appointmentsCount: response.data.length,
      totalItems: response.pagination.total
    });
    
    // Forçar cache refresh
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Buscar agendamentos da oficina
const getWorkshopAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Verificar se o usuário é uma oficina
    if (req.user.userType !== 'workshop') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas oficinas podem acessar esta rota.'
      });
    }

    // Construir filtros
    const filters = { workshop: req.user.id };
    if (status) {
      filters.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filters.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Buscar agendamentos
    const appointments = await Appointment.find(filters)
      .populate('cyclist', 'name email phone')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total
    const total = await Appointment.countDocuments(filters);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const appointment = await Appointment.findById(id)
      .populate('cyclist', 'name email phone')
      .populate('workshop', 'name email workshopData');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar se o usuário tem permissão para ver este agendamento
    if (appointment.cyclist._id.toString() !== req.user.id && 
        appointment.workshop._id.toString() !== req.user.id) {
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
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar permissões
    const isWorkshop = req.user.userType === 'workshop' && appointment.workshop.toString() === req.user.id;
    const isCyclist = req.user.userType === 'cyclist' && appointment.cyclist.toString() === req.user.id;

    if (!isWorkshop && !isCyclist) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Validar transições de status
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[appointment.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Não é possível alterar status de ${appointment.status} para ${status}`
      });
    }

    // Atualizar agendamento
    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }
    await appointment.save();

    await appointment.populate([
      { path: 'cyclist', select: 'name email phone' },
      { path: 'workshop', select: 'businessName address phone' }
    ]);

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: appointment
    });

  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Verificar se o usuário pode cancelar
    if (appointment.cyclist.toString() !== req.user.id && 
        appointment.workshop.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Verificar se pode ser cancelado
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Agendamento não pode ser cancelado'
      });
    }

    // Cancelar agendamento
    appointment.status = 'cancelled';
    if (reason) {
      appointment.notes = `Cancelado: ${reason}`;
    }
    await appointment.save();

    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: appointment
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

    // Verificar se a oficina existe
    const workshop = await User.findOne({ _id: workshopId, userType: 'workshop' });
    if (!workshop) {
      return res.status(404).json({
        success: false,
        message: 'Oficina não encontrada'
      });
    }

    // Buscar agendamentos existentes para a data
    const existingAppointments = await Appointment.find({
      workshop: workshopId,
      appointmentDate: new Date(date),
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    }).select('appointmentTime');

    // Horários padrão (pode ser configurável por oficina no futuro)
    const allSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    // Remover horários ocupados
    const occupiedSlots = existingAppointments.map(apt => apt.appointmentTime);
    const availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));

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

module.exports = {
  createAppointment,
  getUserAppointments,
  getWorkshopAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots
};