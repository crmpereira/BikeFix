// Controlador de Autenticação para Desenvolvimento (Mock)
const jwt = require('jsonwebtoken');

// Usuários mock para desenvolvimento - Joinville/SC
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439001', // ID correto do CESAR
    name: 'César Pereira',
    email: 'cesar.pereiram@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'user',
    phone: '(47) 99999-1234',
    address: {
      street: 'Rua XV de Novembro, 850',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89201-400'
    },
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'César Pereira (Duplicado)',
    email: 'cesar.duplicado@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'user',
    phone: '(47) 99999-1234',
    address: {
      street: 'Rua XV de Novembro, 850',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89201-400'
    },
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Ana Silva Santos',
    email: 'ana.silva@email.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'user',
    phone: '(47) 98765-4321',
    address: {
      street: 'Rua Joinville, 456',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89202-100'
    },
    isActive: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'João Carlos Müller',
    email: 'joao.muller@gmail.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'user',
    phone: '(47) 97654-3210',
    address: {
      street: 'Av. Beira Rio, 1200',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89219-700'
    },
    isActive: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Maria Fernanda Costa',
    email: 'maria.costa@outlook.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'user',
    phone: '(47) 96543-2109',
    address: {
      street: 'Rua Coronel Procópio Gomes, 678',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89204-050'
    },
    isActive: true,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'Pedro Henrique Schneider',
    email: 'pedro.schneider@yahoo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'user',
    phone: '(47) 95432-1098',
    address: {
      street: 'Rua Ministro Calógeras, 234',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89206-000'
    },
    isActive: true,
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439016',
    name: 'Administrador BikeFix',
    email: 'admin@bikefix.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'admin',
    phone: '(47) 3422-0000',
    address: {
      street: 'Rua do Príncipe, 1000',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89201-200'
    },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439017',
    name: 'Bike Center Joinville',
    email: 'contato@bikecenterjoinville.com.br',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'workshop',
    phone: '(47) 3422-1234',
    address: {
      street: 'Rua do Príncipe, 1250',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89201-200'
    },
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    _id: '507f1f77bcf86cd799439018',
    name: 'João Silva',
    email: 'joao@bikecenter.com.br',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNq4O', // senha123
    role: 'workshop',
    phone: '(47) 3422-1235',
    address: {
      street: 'Rua do Príncipe, 1250',
      city: 'Joinville',
      state: 'SC',
      zipCode: '89201-200'
    },
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-12-01')
  }
];

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    console.log('📝 Tentativa de registro (MOCK):', { name, email, role });

    // Verificar se usuário já existe
    const userExists = mockUsers.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Criar novo usuário mock
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      password: '$2a$10$mockHashedPassword',
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso (MOCK)',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Login usuário
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Tentativa de login (MOCK):', { email });

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário mock
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      console.log('❌ Usuário não encontrado (MOCK):', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o suporte.'
      });
    }

    // Em desenvolvimento, aceitar qualquer senha
    console.log('✅ Login bem-sucedido (MOCK):', { email, role: user.role });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso (MOCK)',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userType: user.role === 'admin' ? 'admin' : (user.role === 'workshop' ? 'workshop' : 'cyclist'), // Mapear role para userType
          isActive: user.isActive
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Erro no login (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = mockUsers.find(u => u._id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userType: user.role === 'admin' ? 'admin' : (user.role === 'workshop' ? 'workshop' : 'cyclist'), // Mapear role para userType
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter perfil (MOCK):', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Logout usuário
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  console.log('👋 Logout realizado (MOCK)');
  res.json({
    success: true,
    message: 'Logout realizado com sucesso (MOCK)'
  });
};

// @desc    Esqueci minha senha
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  console.log('🔑 Solicitação de recuperação de senha (MOCK):', email);
  
  res.json({
    success: true,
    message: 'Email de recuperação enviado (MOCK)'
  });
};

// @desc    Resetar senha
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  console.log('🔄 Reset de senha (MOCK)');
  
  res.json({
    success: true,
    message: 'Senha resetada com sucesso (MOCK)'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  mockUsers // Exportar dados mock para uso em outros controladores
};