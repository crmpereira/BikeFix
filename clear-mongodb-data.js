const mongoose = require('mongoose');
require('dotenv').config({ path: './BikeFixBackEnd/.env' });

// Importar os modelos
const User = require('./BikeFixBackEnd/models/User');
const Appointment = require('./BikeFixBackEnd/models/Appointment');
const Review = require('./BikeFixBackEnd/models/Review');
const Service = require('./BikeFixBackEnd/models/Service');
const Notification = require('./BikeFixBackEnd/models/Notification');

/**
 * Script para limpar dados do MongoDB Atlas
 * ATENÇÃO: Este script irá DELETAR PERMANENTEMENTE os dados!
 */

const clearDatabase = async () => {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não encontrada no arquivo .env');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB Atlas');

    console.log('\n⚠️  ATENÇÃO: Este script irá deletar TODOS os dados das coleções!');
    console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos...');
    
    // Aguarda 5 segundos para dar tempo de cancelar
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n🗑️  Iniciando limpeza dos dados...');

    // Limpar cada coleção
    const collections = [
      { name: 'Appointments', model: Appointment },
      { name: 'Reviews', model: Review },
      { name: 'Notifications', model: Notification },
      { name: 'Services', model: Service },
      { name: 'Users', model: User }
    ];

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        if (count > 0) {
          await collection.model.deleteMany({});
          console.log(`✅ ${collection.name}: ${count} documentos removidos`);
        } else {
          console.log(`ℹ️  ${collection.name}: Nenhum documento encontrado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao limpar ${collection.name}:`, error.message);
      }
    }

    console.log('\n🎉 Limpeza concluída!');
    console.log('\n📊 Status final das coleções:');
    
    // Verificar status final
    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        console.log(`   ${collection.name}: ${count} documentos`);
      } catch (error) {
        console.log(`   ${collection.name}: Erro ao verificar`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar apenas se chamado diretamente
if (require.main === module) {
  clearDatabase();
}

module.exports = clearDatabase;