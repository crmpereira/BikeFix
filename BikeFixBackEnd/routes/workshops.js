const express = require('express');
const router = express.Router();
const {
  getWorkshops,
  getWorkshopById,
  getNearbyWorkshops,
  getWorkshopServices
} = require('../controllers/workshopController');

// @route   GET /api/workshops
// @desc    Buscar todas as oficinas aprovadas
// @access  Public
// @query   search, city, state, services, minRating, maxDistance
router.get('/', getWorkshops);

// @route   GET /api/workshops/nearby
// @desc    Buscar oficinas próximas por coordenadas
// @access  Public
// @query   lat, lng, radius (opcional, padrão 10km)
router.get('/nearby', getNearbyWorkshops);

// @route   GET /api/workshops/:id
// @desc    Buscar oficina por ID
// @access  Public
router.get('/:id', getWorkshopById);

// @route   GET /api/workshops/:id/services
// @desc    Buscar serviços de uma oficina específica
// @access  Public
router.get('/:id/services', getWorkshopServices);

module.exports = router;