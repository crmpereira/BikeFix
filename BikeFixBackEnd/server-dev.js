const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
require('dotenv').config({ path: '.env.local' });

// Modo de desenvolvimento offline (sem MongoDB)
console.log('⚠️ Rodando em modo offline - sem MongoDB');
console.log('💡 Para funcionalidade completa, instale MongoDB Community Edition');

const app = express();

// Middleware de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting (mais permissivo para desenvolvimento)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite de 1000 requests por windowMs
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de log para desenvolvimento
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas de desenvolvimento (com mocks)
app.use('/api/auth', require('./routes/auth-dev'));
app.use('/api/workshops', require('./routes/workshops-dev'));
app.use('/api/users', require('./routes/users-dev'));
app.use('/api/appointments', require('./routes/appointments-dev'));
// Outras rotas desabilitadas temporariamente para desenvolvimento offline
// app.use('/api/reviews', require('./routes/reviews'));

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'BikeFix API - Desenvolvimento Local',
    version: '1.0.0',
    environment: 'development',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      workshops: '/api/workshops',
      appointments: '/api/appointments',
      reviews: '/api/reviews',
      health: '/health'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro capturado:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 BikeFix Backend - Desenvolvimento');
  console.log('=================================');
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Conectado' : 'Não configurado'}`);
  console.log('=================================\n');
});

// Tratamento de sinais de encerramento
process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Promise rejeitada não tratada:', err);
  process.exit(1);
});

module.exports = app;