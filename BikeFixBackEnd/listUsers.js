require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Conectado ao MongoDB');
  
  try {
    // Listar todos os usuários
    const users = await User.find({}, 'name email userType createdAt');
    
    console.log(`\n📋 Total de usuários encontrados: ${users.length}\n`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tipo: ${user.userType}`);
        console.log(`   Criado em: ${user.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('Nenhum usuário encontrado na base de dados.');
    }
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    console.log('\nConexão fechada.');
    process.exit(0);
  }
})
.catch(error => {
  console.error('Erro ao conectar ao MongoDB:', error);
  process.exit(1);
});