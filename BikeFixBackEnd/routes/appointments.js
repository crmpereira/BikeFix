const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// @route   POST /api/appointments
// @desc    Criar novo agendamento
// @access  Private (Cyclist)
router.post('/', appointmentController.createAppointment);

// @route   GET /api/appointments
// @desc    Buscar agendamentos do usuário logado
// @access  Private
router.get('/', appointmentController.getUserAppointments);

// @route   GET /api/appointments/workshop
// @desc    Buscar agendamentos da oficina
// @access  Private (Workshop)
router.get('/workshop', appointmentController.getWorkshopAppointments);

// @route   GET /api/appointments/available-slots
// @desc    Buscar horários disponíveis para uma oficina em uma data
// @access  Private
router.get('/available-slots', appointmentController.getAvailableSlots);

// @route   GET /api/appointments/:id
// @desc    Buscar agendamento por ID
// @access  Private
router.get('/:id', appointmentController.getAppointmentById);

// @route   PUT /api/appointments/:id/status
// @desc    Atualizar status do agendamento
// @access  Private
router.put('/:id/status', appointmentController.updateAppointmentStatus);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancelar agendamento
// @access  Private
router.put('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;