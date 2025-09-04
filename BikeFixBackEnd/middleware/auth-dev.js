const jwt = require('jsonwebtoken');

// Usuários mock (mesmo do controlador) - Joinville/SC
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439001', // ID correto do CESAR
    name: 'César Pereira',
    email: 'cesar.pereiram@gmail.com',
    role: 'user',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'César Pereira (Duplicado)',
    email: 'cesar.duplicado@gmail.com',
    role: 'user',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Ana Silva Santos',
    email: 'ana.silva@email.com',
    role: 'user',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'João Carlos Müller',
    email: 'joao.muller@gmail.com',
    role: 'user',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Maria Fernanda Costa',
    email: 'maria.costa@outlook.com',
    role: 'user',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Pedro Henrique Schneider',
    email: 'pedro.schneider@yahoo.com',
    role: 'user',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439016',
    name: 'Administrador BikeFix',
    email: 'admin@bikefix.com',
    role: 'admin',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439017',
    name: 'Bike Center Joinville',
    email: 'contato@bikecenterjoinville.com.br',
    role: 'workshop',
    isActive: true
  },
  {
    _id: '507f1f77bcf86cd799439018',
    name: 'João Silva',
    email: 'joao@bikecenter.com.br',
    role: 'workshop',
    isActive: true
  }
];

// Middleware de proteção de rotas
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuário mock
      const user = mockUsers.find(u => u._id === decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - usuário não encontrado'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada'
        });
      }

      // Adicionar userType baseado no role para consistência
      req.user = {
        ...user,
        userType: user.role === 'admin' ? 'admin' : (user.role === 'workshop' ? 'workshop' : 'cyclist')
      };
      next();
    } catch (error) {
      console.error('❌ Erro na verificação do token (MOCK):', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acesso negado - token não fornecido'
    });
  }
};

// Middleware para autorização por papel
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado - papel '${req.user.role}' não autorizado`
      });
    }
    next();
  };
};

// Middleware para verificar se é admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores'
    });
  }
  next();
};

// Middleware para verificar se é oficina
const workshopOnly = (req, res, next) => {
  if (req.user.role !== 'workshop') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas oficinas'
    });
  }
  next();
};

// Middleware para verificar se é usuário comum
const userOnly = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas usuários'
    });
  }
  next();
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  workshopOnly,
  userOnly
};