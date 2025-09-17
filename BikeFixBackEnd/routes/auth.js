const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { geocodeAddress } = require('../services/geocodingService');
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
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - userType
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao@exemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário
 *                 example: "MinhaSenh@123"
 *               userType:
 *                 type: string
 *                 enum: [customer, workshop]
 *                 description: Tipo de usuário
 *                 example: "customer"
 *               workshopData:
 *                 type: object
 *                 description: Dados da oficina (obrigatório se userType for workshop)
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Oficina do João"
 *                   address:
 *                     type: string
 *                     example: "Rua das Flores, 123"
 *                   phone:
 *                     type: string
 *                     example: "(11) 99999-9999"
 *                   services:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Manutenção", "Reparo"]
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
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
 *                   example: "Usuário registrado com sucesso"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

// Endpoint temporário de debug - REMOVER EM PRODUÇÃO
router.post('/debug-user', async (req, res) => {
  try {
    const { email } = req.body;
    const User = require('../models/User');
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.json({
        found: false,
        message: 'Usuário não encontrado',
        email: email
      });
    }

    // Teste de senha
    const testPassword = '123456';
    const isPasswordValid = await user.comparePassword(testPassword);

    res.json({
      found: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isActive: user.isActive,
        isVerified: user.isVerified,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      passwordTest: {
        testPassword: testPassword,
        isValid: isPasswordValid
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      stack: error.stack
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao@exemplo.com"
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "MinhaSenh@123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
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
 *                   example: "Login realizado com sucesso"
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
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

/**
 * @swagger
 * /api/auth/geocode:
 *   post:
 *     summary: Geocodifica um endereço
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *     responses:
 *       200:
 *         description: Coordenadas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *       400:
 *         description: Dados de endereço inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    console.log('Dados recebidos na rota geocode:', { address, type: typeof address });
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Dados de endereço são obrigatórios'
      });
    }
    
    // Se address é uma string, converte para objeto
    let addressObj = address;
    if (typeof address === 'string') {
      addressObj = { street: address };
    }
    
    console.log('Objeto de endereço para geocodificação:', addressObj);
    
    const coordinates = await geocodeAddress(addressObj);
    
    if (!coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Não foi possível geocodificar o endereço fornecido'
      });
    }
    
    res.json({
      success: true,
      coordinates
    });
    
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;