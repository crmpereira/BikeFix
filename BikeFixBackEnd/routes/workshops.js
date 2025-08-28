const express = require('express');
const router = express.Router();
const {
  getWorkshops,
  getWorkshopById,
  getNearbyWorkshops,
  getWorkshopServices
} = require('../controllers/workshopController');

/**
 * @swagger
 * /api/workshops:
 *   get:
 *     summary: Listar oficinas
 *     description: Busca todas as oficinas aprovadas com filtros opcionais
 *     tags: [Oficinas]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca (nome, endereço, etc.)
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por cidade
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: services
 *         schema:
 *           type: string
 *         description: Filtrar por serviços (separados por vírgula)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Avaliação mínima
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *         description: Distância máxima em km
 *     responses:
 *       200:
 *         description: Lista de oficinas obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 workshops:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workshop'
 *                 total:
 *                   type: integer
 *                   description: Total de oficinas encontradas
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getWorkshops);

/**
 * @swagger
 * /api/workshops/nearby:
 *   get:
 *     summary: Buscar oficinas próximas
 *     description: Busca oficinas próximas baseado em coordenadas geográficas
 *     tags: [Oficinas]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *         example: -23.5505
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *         example: -46.6333
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Raio de busca em km (padrão 10km)
 *     responses:
 *       200:
 *         description: Oficinas próximas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 workshops:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Workshop'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             description: Distância em km
 *       400:
 *         description: Coordenadas inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/nearby', getNearbyWorkshops);

/**
 * @swagger
 * /api/workshops/{id}:
 *   get:
 *     summary: Obter oficina por ID
 *     description: Busca uma oficina específica pelo seu ID
 *     tags: [Oficinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oficina
 *     responses:
 *       200:
 *         description: Oficina encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 workshop:
 *                   $ref: '#/components/schemas/Workshop'
 *       404:
 *         description: Oficina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getWorkshopById);

/**
 * @swagger
 * /api/workshops/{id}/services:
 *   get:
 *     summary: Listar serviços da oficina
 *     description: Busca todos os serviços oferecidos por uma oficina específica
 *     tags: [Oficinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da oficina
 *     responses:
 *       200:
 *         description: Serviços da oficina obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       duration:
 *                         type: string
 *       404:
 *         description: Oficina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/services', getWorkshopServices);

module.exports = router;