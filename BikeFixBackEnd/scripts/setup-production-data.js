/**
 * Script para Configurar Dados de Produção - BikeFix
 * 
 * Este script conecta ao banco atual e garante que estamos usando 'bikefix'
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Usar a mesma configuração do database.js
const MONGODB_URI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bikefix';

async function setupProductionData() {
  try {
    console.log('🚀 Configurando dados de produção - BikeFix');
    console.log('==================================================');
    
    // Conectar ao MongoDB
    console.log('🔌 Conectando ao banco de dados...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao banco de dados');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Verificar se já existem usuários
    const userCount = await User.countDocuments();
    console.log(`👥 Usuários existentes: ${userCount}`);
    
    if (userCount === 0) {
      console.log('📝 Criando usuários iniciais...');
      
      // Criar usuário ciclista de teste
      const hashedPassword = await bcrypt.hash('123456', 12);
      
      const testCyclist = new User({
        name: 'César Pereira',
        email: 'cesar.pereiram@gmail.com',
        password: hashedPassword,
        userType: 'cyclist',
        phone: '(11) 99999-9999',
        address: {
          street: 'Rua das Bicicletas, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        }
      });
      
      await testCyclist.save();
      console.log('✅ Usuário ciclista criado');
      
      // Criar usuário oficina de teste
      const testWorkshop = new User({
        name: 'Oficina Bike Pro',
        email: 'oficina@bikepro.com',
        password: hashedPassword,
        userType: 'workshop',
        phone: '(11) 88888-8888',
        address: {
          street: 'Av. das Oficinas, 456',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-890'
        },
        workshopData: {
          cnpj: '12.345.678/0001-90',
          specialties: ['Manutenção Geral', 'Freios', 'Câmbio'],
          workingHours: {
            monday: { open: '08:00', close: '18:00', isOpen: true },
            tuesday: { open: '08:00', close: '18:00', isOpen: true },
            wednesday: { open: '08:00', close: '18:00', isOpen: true },
            thursday: { open: '08:00', close: '18:00', isOpen: true },
            friday: { open: '08:00', close: '18:00', isOpen: true },
            saturday: { open: '08:00', close: '14:00', isOpen: true },
            sunday: { open: '08:00', close: '12:00', isOpen: false }
          },
          isApproved: true
        }
      });
      
      await testWorkshop.save();
      console.log('✅ Usuário oficina criado');
    }
    
    // Criar índices
    console.log('🔧 Criando índices...');
    
    try {
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ userType: 1 });
      await User.collection.createIndex({ 'workshopData.isApproved': 1 });
      console.log('✅ Índices criados com sucesso');
    } catch (indexError) {
      if (indexError.code === 11000) {
        console.log('ℹ️  Índices já existem');
      } else {
        console.log('⚠️  Erro ao criar índices:', indexError.message);
      }
    }
    
    // Estatísticas finais
    const finalUserCount = await User.countDocuments();
    const cyclistCount = await User.countDocuments({ userType: 'cyclist' });
    const workshopCount = await User.countDocuments({ userType: 'workshop' });
    
    console.log('📊 Estatísticas finais:');
    console.log(`   - Total de usuários: ${finalUserCount}`);
    console.log(`   - Ciclistas: ${cyclistCount}`);
    console.log(`   - Oficinas: ${workshopCount}`);
    
    console.log('==================================================');
    console.log('✅ Configuração de produção concluída com sucesso!');
    console.log('🔑 Credenciais de teste:');
    console.log('   Ciclista: cesar.pereiram@gmail.com / 123456');
    console.log('   Oficina: oficina@bikepro.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexão fechada');
  }
}

if (require.main === module) {
  setupProductionData();
}

module.exports = setupProductionData;