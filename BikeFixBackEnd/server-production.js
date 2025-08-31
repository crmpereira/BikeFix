const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config({ path: '.env.production' });

// Importar configuração do banco e modelos
const { connectDB } = require('./config/database');
const { initializeDefaultData } = require('./models');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 10000;

// Configurações de segurança
app.use(helmet());

// Rate limiting para produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// CORS configurado para produção
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://bikefix-frontend.onrender.com',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'BikeFix API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Importar e usar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workshopRoutes = require('./routes/workshops');
const appointmentRoutes = require('./routes/appointments');
const reviewRoutes = require('./routes/reviews');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  
  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Erro interno do servidor',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.originalUrl} não existe nesta API`
  });
});

// Função para iniciar o servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor BikeFix...');
    console.log('🌍 Ambiente:', process.env.NODE_ENV || 'production');
    console.log('🔗 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'Não configurado');
    
    // Conectar ao banco de dados
    console.log('📡 Tentando conectar ao MongoDB...');
    await connectDB();
    console.log('✅ MongoDB conectado com sucesso');
    
    // Inicializar dados padrão
    console.log('🔧 Inicializando dados padrão...');
    await initializeDefaultData();
    console.log('✅ Dados padrão inicializados');
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📚 Documentação da API: http://localhost:${PORT}/api-docs`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log('✅ Servidor iniciado com sucesso!');
    });
    
    // Timeout para conexões
    server.timeout = 30000;
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Em produção, tente novamente após um delay
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Tentando novamente em 5 segundos...');
      setTimeout(() => {
        startServer();
      }, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Recebido SIGINT, encerrando servidor graciosamente...');
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;