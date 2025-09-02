/**
 * Script de Migração para Produção - BikeFix
 * 
 * Este script configura o banco de dados de produção com:
 * - Índices necessários
 * - Dados iniciais (se necessário)
 * - Validações de schema
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// Configuração do MongoDB
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bikefix';

async function createIndexes() {
  console.log('🔧 Criando índices do banco de dados...');
  
  try {
    // Índices para User
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ googleId: 1 }, { sparse: true });
    await User.collection.createIndex({ stravaId: 1 }, { sparse: true });
    console.log('✅ Índices de User criados');
    
    // Índices para Workshop (usuários do tipo workshop)
    await User.collection.createIndex({ userType: 1 });
    await User.collection.createIndex({ 'workshopData.address.coordinates': '2dsphere' });
    await User.collection.createIndex({ 'workshopData.address.city': 1 });
    await User.collection.createIndex({ 'workshopData.address.state': 1 });
    await User.collection.createIndex({ 'workshopData.isApproved': 1 });
    console.log('✅ Índices de Workshop (User) criados');
    
    // Índices para Appointment
    await Appointment.collection.createIndex({ cyclist: 1 });
    await Appointment.collection.createIndex({ workshop: 1 });
    await Appointment.collection.createIndex({ status: 1 });
    await Appointment.collection.createIndex({ scheduledDate: 1 });
    await Appointment.collection.createIndex({ createdAt: -1 });
    console.log('✅ Índices de Appointment criados');
    
    // Índices para Service
    await Service.collection.createIndex({ workshop: 1 });
    await Service.collection.createIndex({ name: 1 });
    await Service.collection.createIndex({ isActive: 1 });
    console.log('✅ Índices de Service criados');
    
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
    throw error;
  }
}

async function validateCollections() {
  console.log('🔍 Validando coleções...');
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['users', 'appointments', 'services'];
    
    for (const collection of requiredCollections) {
      if (collectionNames.includes(collection)) {
        console.log(`✅ Coleção '${collection}' existe`);
      } else {
        console.log(`⚠️  Coleção '${collection}' será criada automaticamente`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao validar coleções:', error);
    throw error;
  }
}

async function createDefaultServices() {
  console.log('🛠️  Verificando serviços padrão...');
  
  try {
    const serviceCount = await Service.countDocuments();
    
    if (serviceCount === 0) {
      console.log('ℹ️  Nenhum serviço encontrado. Serviços serão criados pelas oficinas.');
    } else {
      console.log(`✅ ${serviceCount} serviços encontrados no banco`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar serviços:', error);
    throw error;
  }
}

async function checkDatabaseHealth() {
  console.log('🏥 Verificando saúde do banco de dados...');
  
  try {
    // Teste de conexão
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    
    if (result.ok === 1) {
      console.log('✅ Conexão com MongoDB está saudável');
    } else {
      throw new Error('Ping falhou');
    }
    
    // Verificar espaço em disco (se disponível)
    const stats = await mongoose.connection.db.stats();
    console.log(`📊 Estatísticas do banco:`);
    console.log(`   - Coleções: ${stats.collections}`);
    console.log(`   - Documentos: ${stats.objects}`);
    console.log(`   - Tamanho dos dados: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Tamanho dos índices: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Erro na verificação de saúde:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('🚀 Iniciando migração para produção...');
  console.log('='.repeat(50));
  
  try {
    // Conectar ao MongoDB
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    
    // Executar migrações
    await validateCollections();
    await createIndexes();
    await createDefaultServices();
    await checkDatabaseHealth();
    
    console.log('='.repeat(50));
    console.log('🎉 Migração concluída com sucesso!');
    console.log('✅ Banco de dados está pronto para produção');
    
  } catch (error) {
    console.error('='.repeat(50));
    console.error('💥 Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  createIndexes,
  validateCollections,
  createDefaultServices,
  checkDatabaseHealth
};