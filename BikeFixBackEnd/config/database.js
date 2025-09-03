const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Priorizar MongoDB Atlas em produção, fallback para local em desenvolvimento
    const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bikefix';
    
    // Log da configuração (sem expor credenciais)
    const safeUri = mongoURI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
    console.log(`🔗 Conectando ao MongoDB: ${safeUri}`);
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Event listeners para conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    console.log('💡 Certifique-se de que o MongoDB está rodando ou configure MONGODB_URI no .env');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 Conexão MongoDB fechada devido ao encerramento da aplicação');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fechar conexão MongoDB:', error);
    process.exit(1);
  }
});

module.exports = { connectDB };