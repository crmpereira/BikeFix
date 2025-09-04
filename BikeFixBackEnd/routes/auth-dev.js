const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController-dev');
const { protect } = require('../middleware/auth-dev');

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Rotas protegidas
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;