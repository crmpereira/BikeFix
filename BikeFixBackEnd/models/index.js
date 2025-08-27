// Exportação centralizada de todos os modelos
const User = require('./User');
const Appointment = require('./Appointment');
const Service = require('./Service');
const Notification = require('./Notification');

module.exports = {
  User,
  Appointment,
  Service,
  Notification
};

// Função para inicializar dados padrão
const initializeDefaultData = async () => {
  try {
    // Verificar se já existem serviços padrão
    const existingServices = await Service.countDocuments({ workshop: null });
    
    if (existingServices === 0) {
      console.log('🔧 Criando serviços padrão...');
      
      const defaultServices = Service.getDefaultServices();
      await Service.insertMany(defaultServices);
      
      console.log('✅ Serviços padrão criados com sucesso');
    }
    
    // Verificar se existe usuário admin
    const adminExists = await User.findOne({ userType: 'admin' });
    
    if (!adminExists) {
      console.log('👤 Criando usuário administrador padrão...');
      
      const adminUser = new User({
        name: 'Administrador BikeFix',
        email: 'admin@bikefix.com',
        password: 'admin123', // Será hasheada automaticamente
        userType: 'admin',
        isVerified: true,
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Usuário administrador criado com sucesso');
      console.log('📧 Email: admin@bikefix.com');
      console.log('🔑 Senha: admin123');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar dados padrão:', error.message);
  }
};

module.exports.initializeDefaultData = initializeDefaultData;