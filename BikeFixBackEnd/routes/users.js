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

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     description: Retorna os dados do perfil do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Atualizar perfil do usuário
 *     description: Atualiza os dados do perfil do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário
 *                 example: "João Silva"
 *               preferences:
 *                 type: object
 *                 description: Preferências do usuário
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Perfil atualizado com sucesso"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Rotas de perfil
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/users/bikes:
 *   get:
 *     summary: Listar bicicletas do usuário
 *     description: Retorna todas as bicicletas cadastradas pelo usuário autenticado
 *     tags: [Bicicletas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bicicletas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bikes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bike'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Adicionar nova bicicleta
 *     description: Cadastra uma nova bicicleta para o usuário autenticado
 *     tags: [Bicicletas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bike'
 *     responses:
 *       201:
 *         description: Bicicleta adicionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bicicleta adicionada com sucesso"
 *                 bike:
 *                   $ref: '#/components/schemas/Bike'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Rotas de bikes do usuário
router.get('/bikes', getUserBikes);
router.post('/bikes', bikeValidation, addUserBike);

/**
 * @swagger
 * /api/users/bikes/{bikeId}:
 *   put:
 *     summary: Atualizar bicicleta
 *     description: Atualiza os dados de uma bicicleta específica do usuário
 *     tags: [Bicicletas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da bicicleta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bike'
 *     responses:
 *       200:
 *         description: Bicicleta atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bicicleta atualizada com sucesso"
 *                 bike:
 *                   $ref: '#/components/schemas/Bike'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bicicleta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Excluir bicicleta
 *     description: Remove uma bicicleta específica do usuário
 *     tags: [Bicicletas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da bicicleta
 *     responses:
 *       200:
 *         description: Bicicleta excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bicicleta excluída com sucesso"
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bicicleta não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/bikes/:bikeId', bikeValidation, updateUserBike);
router.delete('/bikes/:bikeId', deleteUserBike);

module.exports = router;