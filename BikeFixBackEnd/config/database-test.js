const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectDB = async () => {
  try {
    // Se já estiver conectado, não conectar novamente
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB já conectado');
      return;
    }

    // Criar instância do MongoDB em memória
    console.log('🚀 Iniciando MongoDB em memória para testes...');
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27018, // Usar porta diferente para evitar conflitos
        dbName: 'bikefix-test'
      }
    });
    const mongoUri = mongod.getUri();
    console.log('📍 URI do MongoDB em memória:', mongoUri);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ MongoDB em memória conectado para testes');
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Event listeners para conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB em memória:', error.message);
    process.exit(1);
  }
};

// Função para desconectar e parar o servidor
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('🔒 MongoDB em memória desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar MongoDB:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB };