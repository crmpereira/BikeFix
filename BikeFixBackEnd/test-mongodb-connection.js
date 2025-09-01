const mongoose = require('mongoose');
require('dotenv').config({ path: './BikeFixBackEnd/.env.local' });

// Testar diferentes formatos de conexão
const testConnections = [
  // Formato 1: Com cluster específico
  'mongodb+srv://bikefix-app:BikeFixApp2024!@cluster0.mongodb.net/bikefix?retryWrites=true&w=majority',
  
  // Formato 2: Com domínio genérico
  'mongodb+srv://bikefix-app:BikeFixApp2024!@bikefix.mongodb.net/bikefix?retryWrites=true&w=majority',
  
  // Formato 3: Sem srv
  'mongodb://bikefix-app:BikeFixApp2024!@bikefix-production-shard-00-00.mongodb.net:27017,bikefix-production-shard-00-01.mongodb.net:27017,bikefix-production-shard-00-02.mongodb.net:27017/bikefix?ssl=true&replicaSet=atlas-default&authSource=admin&retryWrites=true&w=majority'
];

async function testConnection(uri, index) {
  try {
    console.log(`\n🔗 Testando conexão ${index + 1}...`);
    console.log(`URI: ${uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    console.log('✅ Conexão bem-sucedida!');
    
    // Testar uma operação simples
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Collections encontradas: ${collections.length}`);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ Falha na conexão: ${error.message}`);
    return false;
  }
}

async function testAllConnections() {
  console.log('🧪 Testando conectividade com MongoDB Atlas...');
  
  for (let i = 0; i < testConnections.length; i++) {
    const success = await testConnection(testConnections[i], i);
    if (success) {
      console.log(`\n🎉 Conexão ${i + 1} funcionou! Use esta URI.`);
      return;
    }
  }
  
  console.log('\n❌ Nenhuma conexão funcionou.');
  console.log('\n💡 Possíveis soluções:');
  console.log('1. Verificar se o usuário e senha estão corretos');
  console.log('2. Verificar se o IP está na whitelist do Atlas');
  console.log('3. Verificar se o cluster está ativo');
  console.log('4. Obter a string de conexão correta do Atlas Dashboard');
}

testAllConnections();