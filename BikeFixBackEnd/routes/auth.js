const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateWorkshopData,
  handleValidationErrors
} = require('../middleware/validation');
const { body } = require('express-validator');

// Validações específicas para rotas de auth
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  handleValidationErrors
];

const validateVerifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  
  handleValidationErrors
];

const validateResendVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  handleValidationErrors
];

// Rotas públicas (não requerem autenticação)

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verificar email do usuário
 * @access  Public
 */
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Reenviar email de verificação
 * @access  Public
 */
router.post('/resend-verification', validateResendVerification, authController.resendVerification);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar redefinição de senha
 * @access  Public
 */
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Redefinir senha com token
 * @access  Public
 */
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Rotas protegidas (requerem autenticação)

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar senha do usuário logado
 * @access  Private
 */
router.post('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

// Rota para verificar se o token é válido
/**
 * @route   GET /api/auth/verify-token
 * @desc    Verificar se o token JWT é válido
 * @access  Private
 */
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    data: {
      user: req.user.getPublicProfile()
    }
  });
});

// Rota para obter informações básicas do usuário (para refresh de dados)
/**
 * @route   GET /api/auth/me
 * @desc    Obter dados atualizados do usuário logado
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;