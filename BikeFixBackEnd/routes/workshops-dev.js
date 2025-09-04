const express = require('express');
const router = express.Router();
const workshopsController = require('../controllers/workshopsController-dev');
const auth = require('../middleware/auth-dev');

// Rotas públicas
// GET /api/workshops - Obter todas as oficinas
router.get('/', workshopsController.getAllWorkshops);

// GET /api/workshops/nearby - Buscar oficinas próximas
router.get('/nearby', workshopsController.getNearbyWorkshops);

// GET /api/workshops/:id - Obter oficina por ID
router.get('/:id', workshopsController.getWorkshopById);

// Rotas protegidas (requerem autenticação)
// POST /api/workshops - Criar nova oficina (apenas admins)
router.post('/', auth.protect, auth.authorize('admin'), workshopsController.createWorkshop);

// PUT /api/workshops/:id - Atualizar oficina (apenas admins e donos da oficina)
router.put('/:id', auth.protect, auth.authorize('admin', 'workshop'), workshopsController.updateWorkshop);

// DELETE /api/workshops/:id - Deletar oficina (apenas admins)
router.delete('/:id', auth.protect, auth.authorize('admin'), workshopsController.deleteWorkshop);

module.exports = router;