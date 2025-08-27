const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  createReview,
  getWorkshopReviews,
  getCyclistReviews,
  respondToReview,
  voteReview,
  reportReview,
  getReviewStats
} = require('../controllers/reviewController');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Validações
const createReviewValidation = [
  body('appointmentId')
    .notEmpty()
    .withMessage('ID do agendamento é obrigatório')
    .isMongoId()
    .withMessage('ID do agendamento inválido'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Nota deve ser um número entre 1 e 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comentário não pode ter mais de 1000 caracteres'),
  body('serviceQuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Qualidade do serviço deve ser um número entre 1 e 5'),
  body('priceValue')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Custo-benefício deve ser um número entre 1 e 5'),
  body('punctuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Pontualidade deve ser um número entre 1 e 5'),
  body('communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Comunicação deve ser um número entre 1 e 5')
];

const respondReviewValidation = [
  body('comment')
    .notEmpty()
    .withMessage('Comentário é obrigatório')
    .isLength({ max: 500 })
    .withMessage('Resposta não pode ter mais de 500 caracteres')
];

const voteReviewValidation = [
  body('vote')
    .isIn(['helpful', 'not_helpful'])
    .withMessage('Voto deve ser "helpful" ou "not_helpful"')
];

const reportReviewValidation = [
  body('reason')
    .isIn(['inappropriate', 'fake', 'spam', 'offensive', 'other'])
    .withMessage('Motivo do report inválido'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição não pode ter mais de 500 caracteres')
];

// Rotas

// POST /api/reviews - Criar nova avaliação
router.post('/', createReviewValidation, createReview);

// GET /api/reviews/workshop/:workshopId - Obter avaliações de uma oficina
router.get('/workshop/:workshopId', getWorkshopReviews);

// GET /api/reviews/my-reviews - Obter avaliações do ciclista logado
router.get('/my-reviews', getCyclistReviews);

// POST /api/reviews/:reviewId/respond - Responder a uma avaliação (apenas oficinas)
router.post('/:reviewId/respond', respondReviewValidation, respondToReview);

// POST /api/reviews/:reviewId/vote - Votar em uma avaliação
router.post('/:reviewId/vote', voteReviewValidation, voteReview);

// POST /api/reviews/:reviewId/report - Reportar uma avaliação
router.post('/:reviewId/report', reportReviewValidation, reportReview);

// GET /api/reviews/stats - Obter estatísticas de avaliações (admin)
router.get('/stats', getReviewStats);

module.exports = router;