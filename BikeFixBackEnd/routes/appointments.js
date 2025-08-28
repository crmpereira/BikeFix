const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getWorkshopAppointments,
  getAvailableSlots
} = require('../controllers/appointmentController');

// Endpoint de teste para verificar autenticação
router.get('/test-auth', authenticateToken, (req, res) => {
  console.log('Test auth - Usuário autenticado:', {
    id: req.user._id,
    email: req.user.email,
    userType: req.user.userType
  });
  res.json({
    success: true,
    message: 'Autenticação funcionando',
    user: {
      id: req.user._id,
      email: req.user.email,
      userType: req.user.userType
    }
  });
});

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// @route   POST /api/appointments
// @desc    Criar novo agendamento
// @access  Private (Cyclist)
router.post('/', createAppointment);

// @route   GET /api/appointments
// @desc    Buscar agendamentos do usuário logado
// @access  Private
router.get('/', getUserAppointments);

// @route   GET /api/appointments/workshop
// @desc    Buscar agendamentos da oficina
// @access  Private (Workshop)
router.get('/workshop', getWorkshopAppointments);

// @route   GET /api/appointments/available-slots
// @desc    Buscar horários disponíveis para uma oficina em uma data
// @access  Private
router.get('/available-slots', getAvailableSlots);

// @route   GET /api/appointments/:id
// @desc    Buscar agendamento por ID
// @access  Private
router.get('/:id', getAppointmentById);

// @route   PUT /api/appointments/:id/status
// @desc    Atualizar status do agendamento
// @access  Private
router.put('/:id/status', updateAppointmentStatus);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancelar agendamento
// @access  Private
router.put('/:id/cancel', cancelAppointment);

module.exports = router;