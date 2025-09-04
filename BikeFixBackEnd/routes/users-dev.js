const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth-dev');
const {
  getUserBikes,
  addUserBike,
  updateUserBike,
  deleteUserBike
} = require('../controllers/userController-dev');

// Aplicar middleware de autenticação a todas as rotas
router.use(protect);

/**
 * @swagger
 * /api/users/bikes:
 *   get:
 *     summary: Listar bicicletas do usuário
 *     description: Retorna todas as bicicletas cadastradas pelo usuário logado
 *     tags: [Bicicletas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bicicletas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bike'
 *       401:
 *         description: Token de autenticação inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/bikes', getUserBikes);

/**
 * @swagger
 * /api/users/bikes:
 *   post:
 *     summary: Adicionar nova bicicleta
 *     description: Cadastra uma nova bicicleta para o usuário logado
 *     tags: [Bicicletas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - year
 *               - type
 *             properties:
 *               brand:
 *                 type: string
 *                 description: Marca da bicicleta
 *                 example: "Trek"
 *               model:
 *                 type: string
 *                 description: Modelo da bicicleta
 *                 example: "Domane SL 5"
 *               year:
 *                 type: integer
 *                 description: Ano de fabricação
 *                 example: 2023
 *               type:
 *                 type: string
 *                 enum: [road, mountain, hybrid, electric, bmx, other]
 *                 description: Tipo da bicicleta
 *                 example: "road"
 *               serialNumber:
 *                 type: string
 *                 description: Número de série
 *                 example: "TRK2023001"
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 description: Data de compra
 *                 example: "2023-03-15"
 *               lastMaintenance:
 *                 type: string
 *                 format: date
 *                 description: Data da última manutenção
 *                 example: "2024-11-01"
 *               totalKm:
 *                 type: number
 *                 description: Quilometragem total
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Bicicleta adicionada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/bikes', addUserBike);

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
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [road, mountain, hybrid, electric, bmx, other]
 *               serialNumber:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               lastMaintenance:
 *                 type: string
 *                 format: date
 *               totalKm:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bicicleta atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autenticação inválido
 *       404:
 *         description: Bicicleta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/bikes/:bikeId', updateUserBike);

/**
 * @swagger
 * /api/users/bikes/{bikeId}:
 *   delete:
 *     summary: Deletar bicicleta
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
 *         description: Bicicleta deletada com sucesso
 *       401:
 *         description: Token de autenticação inválido
 *       404:
 *         description: Bicicleta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/bikes/:bikeId', deleteUserBike);

module.exports = router;