/**
 * Script para criar usuário de teste específico - BikeFix
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Usar a mesma configuração do database.js
const MONGODB_URI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bikefix';

async function createTestUser() {
  try {
    console.log('🚀 Criando usuário de teste - BikeFix');
    console.log('==================================================');
    
    // Conectar ao MongoDB
    console.log('🔌 Conectando ao banco de dados...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao banco de dados');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: 'testexxxxx@gmail.com' });
    
    if (existingUser) {
      console.log('⚠️  Usuário já existe, removendo...');
      await User.deleteOne({ email: 'testexxxxx@gmail.com' });
      console.log('✅ Usuário removido');
    }
    
    // Criar hash da senha
    console.log('🔐 Criando hash da senha...');
    const hashedPassword = await bcrypt.hash('123456', 12);
    console.log('✅ Hash criado');
    
    // Criar usuário oficina de teste
    console.log('👤 Criando usuário oficina...');
    const testWorkshop = new User({
      name: 'Oficina Teste',
      email: 'testexxxxx@gmail.com',
      password: hashedPassword,
      userType: 'workshop',
      phone: '(11) 99999-9999',
      isActive: true,
      isVerified: true,
      address: {
        street: 'Rua Teste, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000'
      },
      workshopData: {
        businessName: 'Oficina Teste LTDA',
        cnpj: '12.345.678/0001-99',
        services: [
          {
            name: 'Manutenção básica',
            description: 'Revisão geral da bicicleta',
            basePrice: 50,
            estimatedTime: 60
          },
          {
            name: 'Reparo de pneus',
            description: 'Troca e reparo de pneus',
            basePrice: 25,
            estimatedTime: 30
          }
        ],
        description: 'Oficina de teste para desenvolvimento',
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
    console.log('✅ Usuário oficina criado com sucesso!');
    
    // Verificar se foi criado corretamente
    const createdUser = await User.findOne({ email: 'testexxxxx@gmail.com' }).select('+password');
    console.log('🔍 Verificando usuário criado:');
    console.log(`   - ID: ${createdUser._id}`);
    console.log(`   - Email: ${createdUser.email}`);
    console.log(`   - Nome: ${createdUser.name}`);
    console.log(`   - Tipo: ${createdUser.userType}`);
    console.log(`   - Ativo: ${createdUser.isActive}`);
    console.log(`   - Verificado: ${createdUser.isVerified}`);
    console.log(`   - Tem senha: ${!!createdUser.password}`);
    
    // Testar senha
    const isPasswordValid = await createdUser.comparePassword('123456');
    console.log(`   - Senha válida: ${isPasswordValid}`);
    
    console.log('==================================================');
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('🔑 Credenciais: testexxxxx@gmail.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro durante criação:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexão fechada');
  }
}

if (require.main === module) {
  createTestUser();
}

module.exports = createTestUser;