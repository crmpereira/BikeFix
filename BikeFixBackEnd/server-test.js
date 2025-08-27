const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Importar configuração do banco
const connectDB = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurações de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota básica
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BikeFix API está funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'Backend configurado com sucesso'
  });
});

// Rota de teste para verificar se as rotas estão funcionando
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de teste funcionando',
    data: {
      server: 'BikeFix Backend',
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    }
  });
});

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Conectar ao banco de dados e iniciar servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor BikeFix iniciado com sucesso!');
      console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('✅ Backend configurado e funcionando');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar aplicação
startServer();

module.exports = app;