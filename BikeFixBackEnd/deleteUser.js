require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Conectado ao MongoDB');
  
  try {
    // Apagar o usuário
    const result = await User.deleteOne({ email: 'cesar.pereiram@gmail.com' });
    
    if (result.deletedCount > 0) {
      console.log('✅ Usuário cesar.pereiram@gmail.com foi apagado com sucesso!');
    } else {
      console.log('❌ Usuário cesar.pereiram@gmail.com não foi encontrado.');
    }
  } catch (error) {
    console.error('Erro ao apagar usuário:', error);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    console.log('Conexão fechada.');
    process.exit(0);
  }
})
.catch(error => {
  console.error('Erro ao conectar ao MongoDB:', error);
  process.exit(1);
});