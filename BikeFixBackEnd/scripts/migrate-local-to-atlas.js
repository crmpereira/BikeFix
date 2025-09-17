const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configurações de conexão
const LOCAL_URI = 'mongodb://localhost:27017/bikefix-dev';
const ATLAS_URI = 'mongodb+srv://cesarpereiram_db_user:jXkFsh1dNKtOCiuu@bikefix-production.vx8ptgr.mongodb.net/bikefix?retryWrites=true&w=majority&appName=bikefix-production';

// Importar modelos
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Service = require('../models/Service');
const Notification = require('../models/Notification');
const CommissionConfig = require('../models/CommissionConfig');

// Lista de coleções para migrar
const COLLECTIONS = [
  { name: 'users', model: User },
  { name: 'appointments', model: Appointment },
  { name: 'payments', model: Payment },
  { name: 'reviews', model: Review },
  { name: 'services', model: Service },
  { name: 'notifications', model: Notification },
  { name: 'commissionconfigs', model: CommissionConfig }
];

class DataMigrator {
  constructor() {
    this.localConnection = null;
    this.atlasConnection = null;
    this.migrationLog = [];
  }

  async connectToLocal() {
    console.log('🔗 Conectando ao MongoDB Local...');
    this.localConnection = await mongoose.createConnection(LOCAL_URI);
    console.log('✅ Conectado ao MongoDB Local');
  }

  async connectToAtlas() {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    this.atlasConnection = await mongoose.createConnection(ATLAS_URI);
    console.log('✅ Conectado ao MongoDB Atlas');
  }

  async exportCollection(collectionName, model) {
    console.log(`📤 Exportando coleção: ${collectionName}`);
    
    try {
      // Usar o modelo com a conexão local
      const LocalModel = this.localConnection.model(model.modelName, model.schema);
      const documents = await LocalModel.find({}).lean();
      
      console.log(`📊 Encontrados ${documents.length} documentos em ${collectionName}`);
      
      if (documents.length > 0) {
        // Salvar dados em arquivo JSON para backup
        const backupPath = path.join(__dirname, `backup_${collectionName}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(documents, null, 2));
        console.log(`💾 Backup salvo em: ${backupPath}`);
      }
      
      this.migrationLog.push({
        collection: collectionName,
        exported: documents.length,
        timestamp: new Date()
      });
      
      return documents;
    } catch (error) {
      console.error(`❌ Erro ao exportar ${collectionName}:`, error.message);
      return [];
    }
  }

  async importCollection(collectionName, model, documents) {
    if (documents.length === 0) {
      console.log(`⏭️ Pulando ${collectionName} - nenhum documento para importar`);
      return;
    }

    console.log(`📥 Importando ${documents.length} documentos para ${collectionName}`);
    
    try {
      // Usar o modelo com a conexão Atlas
      const AtlasModel = this.atlasConnection.model(model.modelName, model.schema);
      
      // Limpar coleção existente no Atlas (opcional - remova se quiser manter dados existentes)
      await AtlasModel.deleteMany({});
      console.log(`🗑️ Coleção ${collectionName} limpa no Atlas`);
      
      // Inserir documentos em lotes para melhor performance
      const batchSize = 100;
      let imported = 0;
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await AtlasModel.insertMany(batch, { ordered: false });
        imported += batch.length;
        console.log(`📥 Importados ${imported}/${documents.length} documentos de ${collectionName}`);
      }
      
      console.log(`✅ Importação de ${collectionName} concluída: ${imported} documentos`);
      
      // Atualizar log de migração
      const logEntry = this.migrationLog.find(entry => entry.collection === collectionName);
      if (logEntry) {
        logEntry.imported = imported;
        logEntry.importTimestamp = new Date();
      }
      
    } catch (error) {
      console.error(`❌ Erro ao importar ${collectionName}:`, error.message);
      
      // Atualizar log com erro
      const logEntry = this.migrationLog.find(entry => entry.collection === collectionName);
      if (logEntry) {
        logEntry.error = error.message;
      }
    }
  }

  async verifyMigration() {
    console.log('🔍 Verificando migração...');
    
    for (const { name, model } of COLLECTIONS) {
      try {
        const LocalModel = this.localConnection.model(model.modelName, model.schema);
        const AtlasModel = this.atlasConnection.model(model.modelName, model.schema);
        
        const localCount = await LocalModel.countDocuments();
        const atlasCount = await AtlasModel.countDocuments();
        
        console.log(`📊 ${name}: Local=${localCount}, Atlas=${atlasCount}`);
        
        if (localCount === atlasCount) {
          console.log(`✅ ${name}: Migração verificada com sucesso`);
        } else {
          console.log(`⚠️ ${name}: Diferença na contagem de documentos`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao verificar ${name}:`, error.message);
      }
    }
  }

  async generateReport() {
    console.log('📋 Gerando relatório de migração...');
    
    const report = {
      timestamp: new Date(),
      summary: {
        totalCollections: COLLECTIONS.length,
        successful: this.migrationLog.filter(log => !log.error).length,
        failed: this.migrationLog.filter(log => log.error).length
      },
      details: this.migrationLog
    };
    
    const reportPath = path.join(__dirname, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Relatório salvo em: ${reportPath}`);
    console.log('📊 Resumo da migração:');
    console.log(`   - Total de coleções: ${report.summary.totalCollections}`);
    console.log(`   - Sucessos: ${report.summary.successful}`);
    console.log(`   - Falhas: ${report.summary.failed}`);
  }

  async migrate() {
    try {
      console.log('🚀 Iniciando migração de dados do MongoDB Local para Atlas...');
      
      // Conectar aos bancos
      await this.connectToLocal();
      await this.connectToAtlas();
      
      // Migrar cada coleção
      for (const { name, model } of COLLECTIONS) {
        console.log(`\n🔄 Processando coleção: ${name}`);
        
        // Exportar do local
        const documents = await this.exportCollection(name, model);
        
        // Importar para o Atlas
        await this.importCollection(name, model, documents);
      }
      
      // Verificar migração
      console.log('\n🔍 Verificando migração...');
      await this.verifyMigration();
      
      // Gerar relatório
      await this.generateReport();
      
      console.log('\n🎉 Migração concluída com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante a migração:', error);
    } finally {
      // Fechar conexões
      if (this.localConnection) {
        await this.localConnection.close();
        console.log('🔒 Conexão local fechada');
      }
      
      if (this.atlasConnection) {
        await this.atlasConnection.close();
        console.log('🔒 Conexão Atlas fechada');
      }
    }
  }
}

// Executar migração se o script for chamado diretamente
if (require.main === module) {
  const migrator = new DataMigrator();
  migrator.migrate().catch(console.error);
}

module.exports = DataMigrator;