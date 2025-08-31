const mongoose = require('mongoose');
require('dotenv').config({ path: './BikeFixBackEnd/.env' });

// Importar os modelos
const User = require('./BikeFixBackEnd/models/User');
const Appointment = require('./BikeFixBackEnd/models/Appointment');
const Review = require('./BikeFixBackEnd/models/Review');
const Service = require('./BikeFixBackEnd/models/Service');
const Notification = require('./BikeFixBackEnd/models/Notification');

/**
 * Script para limpar coleções específicas do MongoDB Atlas
 * Uso: node clear-specific-collections.js [coleções]
 * Exemplo: node clear-specific-collections.js appointments reviews
 */

const availableCollections = {
  'appointments': { name: 'Appointments', model: Appointment },
  'reviews': { name: 'Reviews', model: Review },
  'notifications': { name: 'Notifications', model: Notification },
  'services': { name: 'Services', model: Service },
  'users': { name: 'Users', model: User }
};

const clearSpecificCollections = async (collectionsToClean = []) => {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não encontrada no arquivo .env');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB Atlas');

    // Se nenhuma coleção especificada, mostrar opções
    if (collectionsToClean.length === 0) {
      console.log('\n📋 Coleções disponíveis:');
      Object.keys(availableCollections).forEach(key => {
        console.log(`   - ${key}`);
      });
      console.log('\n💡 Uso: node clear-specific-collections.js [coleções]');
      console.log('   Exemplo: node clear-specific-collections.js appointments reviews');
      return;
    }

    console.log(`\n⚠️  ATENÇÃO: Será deletado dados das coleções: ${collectionsToClean.join(', ')}`);
    console.log('Pressione Ctrl+C para cancelar ou aguarde 3 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🗑️  Iniciando limpeza...');

    for (const collectionKey of collectionsToClean) {
      const collection = availableCollections[collectionKey.toLowerCase()];
      
      if (!collection) {
        console.log(`❌ Coleção '${collectionKey}' não encontrada`);
        continue;
      }

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

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar apenas se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  clearSpecificCollections(args);
}

module.exports = clearSpecificCollections;