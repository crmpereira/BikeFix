const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco de dados
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar tipo de usuário
const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este tipo de usuário'
      });
    }

    next();
  };
};

// Middleware específicos para cada tipo de usuário
const requireCyclist = requireUserType('cyclist');
const requireWorkshop = requireUserType('workshop');
const requireAdmin = requireUserType('admin');
const requireCyclistOrWorkshop = requireUserType('cyclist', 'workshop');

// Middleware para verificar se o usuário é verificado
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email não verificado. Verifique seu email antes de continuar.'
    });
  }
  next();
};

// Middleware para verificar se a oficina está aprovada
const requireApprovedWorkshop = (req, res, next) => {
  if (req.user.userType === 'workshop' && req.user.workshopData.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Oficina ainda não foi aprovada pelo administrador'
    });
  }
  next();
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignora erros de token em autenticação opcional
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireUserType,
  requireCyclist,
  requireWorkshop,
  requireAdmin,
  requireCyclistOrWorkshop,
  requireVerified,
  requireApprovedWorkshop,
  optionalAuth
};