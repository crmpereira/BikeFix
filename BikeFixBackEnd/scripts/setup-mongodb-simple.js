/**
 * Script Simples para Configurar MongoDB Atlas - BikeFix
 * 
 * Este script conecta ao MongoDB Atlas e configura os índices necessários
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function setupMongoDB() {
  try {
    console.log('🚀 Configurando MongoDB Atlas para BikeFix');
    console.log('==================================================');
    
    // Conectar ao MongoDB
    console.log('🔌 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB Atlas');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Criar índices
    console.log('🔧 Criando índices...');
    
    // Índices para users
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.collection('users').createIndex({ userType: 1 });
    await mongoose.connection.collection('users').createIndex({ 'workshopData.isApproved': 1 });
    console.log('✅ Índices de users criados');
    
    // Índices para appointments
    await mongoose.connection.collection('appointments').createIndex({ cyclist: 1 });
    await mongoose.connection.collection('appointments').createIndex({ workshop: 1 });
    await mongoose.connection.collection('appointments').createIndex({ status: 1 });
    await mongoose.connection.collection('appointments').createIndex({ scheduledDate: 1 });
    console.log('✅ Índices de appointments criados');
    
    // Índices para services
    await mongoose.connection.collection('services').createIndex({ workshop: 1 });
    await mongoose.connection.collection('services').createIndex({ isActive: 1 });
    console.log('✅ Índices de services criados');
    
    // Verificar coleções existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Coleções existentes:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Contar documentos
    const userCount = await mongoose.connection.collection('users').countDocuments();
    const appointmentCount = await mongoose.connection.collection('appointments').countDocuments();
    
    console.log('📊 Estatísticas:');
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Agendamentos: ${appointmentCount}`);
    
    console.log('==================================================');
    console.log('✅ Configuração do MongoDB Atlas concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexão fechada');
  }
}

if (require.main === module) {
  setupMongoDB();
}

module.exports = setupMongoDB;