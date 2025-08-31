const mongoose = require('mongoose');
require('dotenv').config({ path: './BikeFixBackEnd/.env' });

// Importar os modelos
const User = require('./BikeFixBackEnd/models/User');
const Appointment = require('./BikeFixBackEnd/models/Appointment');
const Review = require('./BikeFixBackEnd/models/Review');
const Service = require('./BikeFixBackEnd/models/Service');
const Notification = require('./BikeFixBackEnd/models/Notification');

/**
 * Script para visualizar dados do MongoDB Atlas antes de deletar
 */

const viewDatabaseData = async () => {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI não encontrada no arquivo .env');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB Atlas');

    console.log('\n📊 Resumo dos dados no banco:');
    console.log('=' .repeat(50));

    const collections = [
      { name: 'Users', model: User },
      { name: 'Appointments', model: Appointment },
      { name: 'Reviews', model: Review },
      { name: 'Services', model: Service },
      { name: 'Notifications', model: Notification }
    ];

    let totalDocuments = 0;

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        totalDocuments += count;
        console.log(`📋 ${collection.name.padEnd(15)}: ${count.toString().padStart(6)} documentos`);
        
        // Mostrar alguns exemplos se houver dados
        if (count > 0 && count <= 5) {
          const samples = await collection.model.find().limit(2).lean();
          samples.forEach((doc, index) => {
            console.log(`   Exemplo ${index + 1}:`, {
              id: doc._id,
              ...Object.fromEntries(
                Object.entries(doc)
                  .filter(([key]) => !['_id', '__v', 'password'].includes(key))
                  .slice(0, 3)
              )
            });
          });
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${collection.name}:`, error.message);
      }
    }

    console.log('=' .repeat(50));
    console.log(`📊 Total de documentos: ${totalDocuments}`);

    if (totalDocuments > 0) {
      console.log('\n💡 Para limpar os dados, use:');
      console.log('   • Todos os dados: node clear-mongodb-data.js');
      console.log('   • Dados específicos: node clear-specific-collections.js [coleções]');
      console.log('\n📋 Coleções disponíveis para limpeza seletiva:');
      console.log('   appointments, reviews, notifications, services, users');
    } else {
      console.log('\n✨ Banco de dados está vazio!');
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
  viewDatabaseData();
}

module.exports = viewDatabaseData;