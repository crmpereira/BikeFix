const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCommissionConfig,
  updateDefaultRate,
  setWorkshopSpecificRate,
  removeWorkshopSpecificRate,
  setTieredRates,
  updateGeneralSettings,
  getChangeHistory,
  simulateCommission
} = require('../controllers/commissionController');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// @route   GET /api/commission/config
// @desc    Obter configuração atual de comissão
// @access  Private (Admin)
router.get('/config', getCommissionConfig);

// @route   PUT /api/commission/default-rate
// @desc    Atualizar taxa padrão de comissão
// @access  Private (Admin)
router.put('/default-rate', updateDefaultRate);

// @route   POST /api/commission/workshop-rate
// @desc    Definir taxa específica para uma oficina
// @access  Private (Admin)
router.post('/workshop-rate', setWorkshopSpecificRate);

// @route   DELETE /api/commission/workshop-rate/:workshopId
// @desc    Remover taxa específica de uma oficina
// @access  Private (Admin)
router.delete('/workshop-rate/:workshopId', removeWorkshopSpecificRate);

// @route   PUT /api/commission/tiered-rates
// @desc    Configurar taxas por faixa de valor
// @access  Private (Admin)
router.put('/tiered-rates', setTieredRates);

// @route   PUT /api/commission/general-settings
// @desc    Atualizar configurações gerais (valores mínimo e máximo)
// @access  Private (Admin)
router.put('/general-settings', updateGeneralSettings);

// @route   GET /api/commission/history
// @desc    Obter histórico de alterações
// @access  Private (Admin)
router.get('/history', getChangeHistory);

// @route   POST /api/commission/simulate
// @desc    Simular cálculo de comissão
// @access  Private
router.post('/simulate', simulateCommission);

module.exports = router;