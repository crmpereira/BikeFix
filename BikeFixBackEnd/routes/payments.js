const express = require('express');
const {
  createPaymentPreference,
  processWebhook,
  getPaymentStatus,
  getUserPayments,
  processRefund,
  getPaymentStats,
  getPaymentsByAppointment
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único do pagamento
 *         appointment:
 *           type: string
 *           description: ID do agendamento
 *         amount:
 *           type: number
 *           description: Valor total do pagamento
 *         platformFee:
 *           type: number
 *           description: Taxa da plataforma
 *         workshopAmount:
 *           type: number
 *           description: Valor líquido para a oficina
 *         status:
 *           type: string
 *           enum: [pending, processing, approved, rejected, cancelled, refunded]
 *           description: Status do pagamento
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, pix, bank_transfer]
 *           description: Método de pagamento
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

/**
 * @swagger
 * /api/payments/create-preference:
 *   post:
 *     summary: Criar preferência de pagamento
 *     description: Cria uma preferência de pagamento no Mercado Pago para um agendamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *             properties:
 *               appointmentId:
 *                 type: string
 *                 description: ID do agendamento
 *               paymentData:
 *                 type: object
 *                 properties:
 *                   paymentMethod:
 *                     type: string
 *                     enum: [credit_card, debit_card, pix, bank_transfer]
 *                   identificationType:
 *                     type: string
 *                     example: CPF
 *                   identificationNumber:
 *                     type: string
 *                     example: "12345678901"
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       number:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *     responses:
 *       201:
 *         description: Preferência criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     preferenceId:
 *                       type: string
 *                     initPoint:
 *                       type: string
 *                     sandboxInitPoint:
 *                       type: string
 *                     paymentId:
 *                       type: string
 *       400:
 *         description: Dados inválidos ou pagamento já existe
 *       404:
 *         description: Agendamento não encontrado
 */
router.post('/create-preference', authenticateToken, createPaymentPreference);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook do Mercado Pago
 *     description: Endpoint para receber notificações do Mercado Pago sobre mudanças de status
 *     tags: [Pagamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: payment
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *       500:
 *         description: Erro ao processar webhook
 */
router.post('/webhook', processWebhook);

/**
 * @swagger
 * /api/payments/{paymentId}/status:
 *   get:
 *     summary: Buscar status de pagamento
 *     description: Obtém o status atual de um pagamento específico
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento
 *     responses:
 *       200:
 *         description: Status do pagamento obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Pagamento não encontrado
 *       403:
 *         description: Acesso negado
 */
router.get('/:paymentId/status', authenticateToken, getPaymentStatus);

/**
 * @swagger
 * /api/payments/user:
 *   get:
 *     summary: Buscar pagamentos do usuário
 *     description: Lista todos os pagamentos relacionados ao usuário (como ciclista ou oficina)
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, approved, rejected, cancelled, refunded]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Pagamentos obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 */
router.get('/user', authenticateToken, getUserPayments);

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Processar reembolso
 *     description: Processa o reembolso de um pagamento (apenas oficinas e admins)
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Valor do reembolso (opcional, padrão é o valor total)
 *               reason:
 *                 type: string
 *                 description: Motivo do reembolso
 *     responses:
 *       200:
 *         description: Reembolso processado com sucesso
 *       400:
 *         description: Pagamento não pode ser reembolsado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Pagamento não encontrado
 */
router.post('/:paymentId/refund', authenticateToken, processRefund);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Estatísticas de pagamento
 *     description: Obtém estatísticas de pagamentos (apenas admins e oficinas)
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início do período
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim do período
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAmount:
 *                       type: number
 *                     totalPlatformFee:
 *                       type: number
 *                     totalWorkshopAmount:
 *                       type: number
 *                     totalPayments:
 *                       type: integer
 *                     averageAmount:
 *                       type: number
 *       403:
 *         description: Acesso negado
 */
router.get('/stats', authenticateToken, getPaymentStats);

/**
 * @swagger
 * /api/payments/appointment/{appointmentId}:
 *   get:
 *     summary: Pagamentos por agendamento
 *     description: Lista todos os pagamentos de um agendamento específico
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do agendamento
 *     responses:
 *       200:
 *         description: Pagamentos obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Agendamento não encontrado
 */
router.get('/appointment/:appointmentId', authenticateToken, getPaymentsByAppointment);

module.exports = router;