/**
 * Script para Configurar MongoDB Atlas - Produção BikeFix
 * 
 * Este script:
 * 1. Conecta ao MongoDB Atlas
 * 2. Configura o banco 'bikefix' como produção
 * 3. Migra dados da base de teste se necessário
 * 4. Configura índices e validações
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

require('dotenv').config();

// Configurações do MongoDB Atlas
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/bikefix';

class MongoDBAtlasSetup {
  constructor() {
    this.productionConnection = null;
    this.testConnection = null;
  }

  async connectToProduction() {
    console.log('🔌 Conectando ao MongoDB Atlas (Produção)...');
    
    if (!MONGODB_ATLAS_URI || MONGODB_ATLAS_URI.includes('CONFIGURE')) {
      throw new Error('❌ MONGODB_ATLAS_URI não configurada corretamente!');
    }

    // Garantir que estamos usando o banco 'bikefix'
    const atlasUri = MONGODB_ATLAS_URI.replace(/\/[^?]*\?/, '/bikefix?');
    
    this.productionConnection = await mongoose.createConnection(atlasUri);
    console.log('✅ Conectado ao MongoDB Atlas - Banco: bikefix');
    
    return this.productionConnection;
  }

  async connectToTest() {
    console.log('🔌 Conectando ao banco de teste...');
    this.testConnection = await mongoose.createConnection(MONGODB_TEST_URI);
    console.log('✅ Conectado ao banco de teste');
    return this.testConnection;
  }

  async createProductionIndexes(connection) {
    console.log('🔧 Criando índices no banco de produção...');
    
    try {
      const db = connection.db;
      
      // Índices para users
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ userType: 1 });
      await db.collection('users').createIndex({ 'workshopData.isApproved': 1 });
      await db.collection('users').createIndex({ 'workshopData.address.coordinates': '2dsphere' });
      console.log('✅ Índices de users criados');
      
      // Índices para appointments
      await db.collection('appointments').createIndex({ cyclist: 1 });
      await db.collection('appointments').createIndex({ workshop: 1 });
      await db.collection('appointments').createIndex({ status: 1 });
      await db.collection('appointments').createIndex({ scheduledDate: 1 });
      console.log('✅ Índices de appointments criados');
      
      // Índices para services
      await db.collection('services').createIndex({ workshop: 1 });
      await db.collection('services').createIndex({ isActive: 1 });
      console.log('✅ Índices de services criados');
      
    } catch (error) {
      console.error('❌ Erro ao criar índices:', error);
      throw error;
    }
  }

  async migrateData() {
    console.log('📦 Iniciando migração de dados...');
    
    try {
      const testDb = this.testConnection.db;
      const prodDb = this.productionConnection.db;
      
      // Verificar se já existem dados na produção
      const prodUserCount = await prodDb.collection('users').countDocuments();
      
      if (prodUserCount > 0) {
        console.log(`ℹ️  Banco de produção já possui ${prodUserCount} usuários`);
        const response = await this.askUserConfirmation('Deseja sobrescrever os dados existentes? (s/n): ');
        
        if (response.toLowerCase() !== 's') {
          console.log('⏭️  Migração de dados cancelada pelo usuário');
          return;
        }
      }
      
      // Coleções para migrar
      const collections = ['users', 'appointments', 'services', 'reviews', 'notifications'];
      
      for (const collectionName of collections) {
        console.log(`📋 Migrando coleção: ${collectionName}`);
        
        const testData = await testDb.collection(collectionName).find({}).toArray();
        
        if (testData.length > 0) {
          // Limpar coleção de produção
          await prodDb.collection(collectionName).deleteMany({});
          
          // Inserir dados do teste
          await prodDb.collection(collectionName).insertMany(testData);
          console.log(`✅ ${testData.length} documentos migrados para ${collectionName}`);
        } else {
          console.log(`ℹ️  Nenhum documento encontrado em ${collectionName}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      throw error;
    }
  }

  async askUserConfirmation(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  async validateProductionSetup() {
    console.log('🔍 Validando configuração de produção...');
    
    try {
      const db = this.productionConnection.db;
      
      // Verificar coleções
      const collections = await db.listCollections().toArray();
      console.log(`📊 Coleções encontradas: ${collections.map(c => c.name).join(', ')}`);
      
      // Contar documentos
      const userCount = await db.collection('users').countDocuments();
      const appointmentCount = await db.collection('appointments').countDocuments();
      const serviceCount = await db.collection('services').countDocuments();
      
      console.log(`👥 Usuários: ${userCount}`);
      console.log(`📅 Agendamentos: ${appointmentCount}`);
      console.log(`🛠️  Serviços: ${serviceCount}`);
      
      // Verificar índices
      const userIndexes = await db.collection('users').indexes();
      console.log(`🔍 Índices de users: ${userIndexes.length}`);
      
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      throw error;
    }
  }

  async run() {
    console.log('🚀 Configurando MongoDB Atlas para Produção');
    console.log('=' .repeat(50));
    
    try {
      // Conectar aos bancos
      await this.connectToProduction();
      await this.connectToTest();
      
      // Criar índices na produção
      await this.createProductionIndexes(this.productionConnection);
      
      // Migrar dados
      await this.migrateData();
      
      // Validar configuração
      await this.validateProductionSetup();
      
      console.log('=' .repeat(50));
      console.log('🎉 Configuração do MongoDB Atlas concluída!');
      console.log('✅ Banco de produção \'bikefix\' está pronto');
      
    } catch (error) {
      console.error('=' .repeat(50));
      console.error('💥 Erro durante configuração:', error);
      process.exit(1);
    } finally {
      if (this.productionConnection) {
        await this.productionConnection.close();
      }
      if (this.testConnection) {
        await this.testConnection.close();
      }
      console.log('🔌 Conexões fechadas');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new MongoDBAtlasSetup();
  setup.run();
}

module.exports = MongoDBAtlasSetup;