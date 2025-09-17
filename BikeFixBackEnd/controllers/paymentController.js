const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// Usar apenas serviço de produção
const mercadoPagoService = require('../services/mercadoPagoService');

/**
 * @desc    Criar preferência de pagamento
 * @route   POST /api/payments/create-preference
 * @access  Private
 */
const createPaymentPreference = async (req, res) => {
  try {
    const { appointmentId, paymentData } = req.body;
    
    // Validar dados obrigatórios
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'ID do agendamento é obrigatório'
      });
    }
    
    // Verificar se o agendamento existe e pertence ao usuário
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      cyclist: req.user.id,
      status: 'confirmed'
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado ou não confirmado'
      });
    }
    
    // Verificar se já existe um pagamento pendente ou aprovado
    const existingPayment = await Payment.findOne({
      appointment: appointmentId,
      status: { $in: ['pending', 'processing', 'approved'] }
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um pagamento para este agendamento',
        payment: existingPayment
      });
    }
    
    // Adicionar dados do usuário à requisição
    const enrichedPaymentData = {
      ...paymentData,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };
    
    // Criar preferência de pagamento
    const preference = await mercadoPagoService.createPaymentPreference(
      appointmentId,
      enrichedPaymentData
    );
    
    res.status(201).json({
      success: true,
      message: 'Preferência de pagamento criada com sucesso',
      data: preference
    });
    
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Processar webhook do Mercado Pago
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const processWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('Webhook recebido:', JSON.stringify(webhookData, null, 2));
    
    // Processar webhook
    await mercadoPagoService.processWebhook(webhookData);
    
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook'
    });
  }
};

/**
 * @desc    Buscar status de pagamento
 * @route   GET /api/payments/:paymentId/status
 * @access  Private
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de pagamento inválido'
      });
    }
    
    const payment = await mercadoPagoService.getPaymentStatus(paymentId);
    
    // Verificar se o usuário tem permissão para ver este pagamento
    if (payment.appointment.cyclist.toString() !== req.user.id && 
        payment.appointment.workshop.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
    
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * @desc    Buscar pagamentos do usuário
 * @route   GET /api/payments/user
 * @access  Private
 */
const getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    // Buscar agendamentos do usuário
    const appointmentQuery = {
      $or: [
        { cyclist: req.user.id },
        { workshop: req.user.id }
      ]
    };
    
    const appointments = await Appointment.find(appointmentQuery).select('_id');
    const appointmentIds = appointments.map(app => app._id);
    
    // Construir query de pagamentos
    const paymentQuery = {
      appointment: { $in: appointmentIds }
    };
    
    if (status) {
      paymentQuery.status = status;
    }
    
    // Buscar pagamentos
    const payments = await Payment.find(paymentQuery)
      .populate({
        path: 'appointment',
        populate: [
          { path: 'cyclist', select: 'name email' },
          { path: 'workshop', select: 'name email' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalPayments = await Payment.countDocuments(paymentQuery);
    
    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / limit),
        totalItems: totalPayments,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pagamentos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * @desc    Processar reembolso
 * @route   POST /api/payments/:paymentId/refund
 * @access  Private
 */
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de pagamento inválido'
      });
    }
    
    // Buscar pagamento
    const payment = await Payment.findById(paymentId)
      .populate('appointment', 'cyclist workshop status');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    // Verificar permissões (apenas oficina ou admin pode processar reembolso)
    if (payment.appointment.workshop.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    // Verificar se o pagamento pode ser reembolsado
    if (payment.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pagamentos aprovados podem ser reembolsados'
      });
    }
    
    // Processar reembolso
    const refund = await mercadoPagoService.processRefund(paymentId, amount, reason);
    
    res.status(200).json({
      success: true,
      message: 'Reembolso processado com sucesso',
      data: refund
    });
    
  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * @desc    Buscar estatísticas de pagamento
 * @route   GET /api/payments/stats
 * @access  Private (Admin/Workshop)
 */
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, workshopId } = req.query;
    
    // Verificar permissões
    if (req.user.userType !== 'admin' && req.user.userType !== 'workshop') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    let filters = {};
    
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }
    
    // Se for oficina, filtrar apenas seus pagamentos
    if (req.user.userType === 'workshop') {
      const appointments = await Appointment.find({ workshop: req.user.id }).select('_id');
      const appointmentIds = appointments.map(app => app._id);
      
      const payments = await Payment.find({
        appointment: { $in: appointmentIds },
        ...(filters.startDate && filters.endDate && {
          createdAt: {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
          }
        })
      });
      
      // Calcular estatísticas manualmente para oficina específica
      const stats = {
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        totalPlatformFee: payments.reduce((sum, p) => sum + p.platformFee, 0),
        totalWorkshopAmount: payments.reduce((sum, p) => sum + p.workshopAmount, 0),
        totalPayments: payments.length,
        averageAmount: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
        statusDistribution: payments.map(p => p.status),
        paymentMethodDistribution: payments.map(p => p.paymentMethod)
      };
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    }
    
    // Para admin, usar método do modelo
    const stats = await Payment.getPaymentStats(filters);
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas de pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * @desc    Buscar pagamentos por agendamento
 * @route   GET /api/payments/appointment/:appointmentId
 * @access  Private
 */
const getPaymentsByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de agendamento inválido'
      });
    }
    
    // Verificar se o usuário tem acesso ao agendamento
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      $or: [
        { cyclist: req.user.id },
        { workshop: req.user.id }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }
    
    const payments = await Payment.findByAppointment(appointmentId);
    
    res.status(200).json({
      success: true,
      data: payments
    });
    
  } catch (error) {
    console.error('Erro ao buscar pagamentos por agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createPaymentPreference,
  processWebhook,
  getPaymentStatus,
  getUserPayments,
  processRefund,
  getPaymentStats,
  getPaymentsByAppointment
};