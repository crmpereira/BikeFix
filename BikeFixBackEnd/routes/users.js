const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getUserBikes,
  addUserBike,
  updateUserBike,
  deleteUserBike
} = require('../controllers/userController');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Validações para bikes
const bikeValidation = [
  body('brand')
    .notEmpty()
    .withMessage('Marca é obrigatória')
    .isLength({ max: 50 })
    .withMessage('Marca não pode ter mais de 50 caracteres'),
  body('model')
    .notEmpty()
    .withMessage('Modelo é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Modelo não pode ter mais de 100 caracteres'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano deve ser válido'),
  body('type')
    .isIn(['road', 'mountain', 'hybrid', 'electric', 'bmx', 'other'])
    .withMessage('Tipo de bike inválido'),
  body('serialNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Número de série não pode ter mais de 50 caracteres'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Data de compra deve ser uma data válida'),
  body('lastMaintenance')
    .optional()
    .isISO8601()
    .withMessage('Data da última manutenção deve ser uma data válida'),
  body('totalKm')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quilometragem total deve ser um número positivo')
];

// Rotas de perfil
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Rotas de bikes do usuário
router.get('/bikes', getUserBikes);
router.post('/bikes', bikeValidation, addUserBike);
router.put('/bikes/:bikeId', bikeValidation, updateUserBike);
router.delete('/bikes/:bikeId', deleteUserBike);

module.exports = router;