const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod = null;

/**
 * Conecta ao MongoDB Atlas ou inicia um servidor em memória para desenvolvimento
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    // Verifica se a URI do MongoDB está configurada corretamente
    if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>') || mongoUri.includes('<cluster-url>')) {
      console.log('⚠️  MongoDB Atlas não configurado. Iniciando servidor em memória para desenvolvimento...');
      
      // Inicia MongoDB em memória
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'bikefix-dev'
        }
      });
      
      const uri = mongod.getUri();
      console.log('🚀 MongoDB em memória iniciado em:', uri);
      
      await mongoose.connect(uri);
      console.log('✅ Conectado ao MongoDB em memória');
      console.log('💡 Para usar MongoDB Atlas, configure o arquivo .env conforme MONGODB_SETUP.md');
      
    } else {
      // Conecta ao MongoDB Atlas
      console.log('🔗 Conectando ao MongoDB Atlas...');
      await mongoose.connect(mongoUri);
      console.log('✅ Conectado ao MongoDB Atlas');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    
    // Se falhar com Atlas, tenta MongoDB em memória como fallback
    if (!mongod) {
      try {
        console.log('🔄 Tentando fallback para MongoDB em memória...');
        mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'bikefix-dev'
          }
        });
        
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('✅ Conectado ao MongoDB em memória (fallback)');
        console.log('💡 Configure MongoDB Atlas para produção - veja MONGODB_SETUP.md');
        
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError.message);
        process.exit(1);
      }
    }
  }
};

/**
 * Desconecta do MongoDB e para o servidor em memória se necessário
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    
    if (mongod) {
      await mongod.stop();
      console.log('🛑 MongoDB em memória parado');
    }
    
    console.log('✅ Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao desconectar:', error.message);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB };