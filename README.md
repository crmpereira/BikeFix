# BikeFix 🚴‍♂️

Plataforma digital que conecta ciclistas a oficinas especializadas em bicicletas, facilitando agendamentos, orçamentos e manutenções.

## 📋 Sobre o Projeto

O BikeFix é uma solução completa que permite:
- **Para Ciclistas**: Encontrar oficinas próximas, agendar serviços, acompanhar manutenções
- **Para Oficinas**: Gerenciar agenda, criar orçamentos, histórico de clientes
- **Para Administradores**: Supervisionar plataforma, relatórios, gestão de oficinas

## 🏗️ Estrutura do Projeto

```
BikeFix/
├── BikeFixBackEnd/     # API Node.js + Express + MongoDB
├── BikeFixFrontEnd/    # Interface React
└── README.md           # Este arquivo
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Nodemailer** para envio de emails

### Frontend
- **React.js**
- **React Router** para navegação
- **Axios** para requisições HTTP
- **CSS3** responsivo

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB Atlas ou MongoDB local
- Git

### Backend
```bash
cd BikeFixBackEnd
npm install
# Configure o arquivo .env com suas credenciais
npm run dev
```

### Frontend
```bash
cd BikeFixFrontEnd
npm install
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
Crie um arquivo `.env` na pasta `BikeFixBackEnd`:

```env
MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
EMAIL_USER=seu_email
EMAIL_PASS=sua_senha_email
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuários
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verificação de email

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil

## 👥 Tipos de Usuário

1. **Cyclist** - Ciclistas que buscam serviços
2. **Workshop** - Oficinas que prestam serviços
3. **Admin** - Administradores da plataforma

## 🎯 Funcionalidades Principais

- ✅ Sistema de autenticação completo
- ✅ Registro de ciclistas e oficinas
- ✅ Interface responsiva
- ✅ Integração com MongoDB Atlas
- 🔄 Busca de oficinas por localização
- 🔄 Sistema de agendamentos
- 🔄 Gestão de orçamentos
- 🔄 Notificações por email

## 📱 Acesso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Projeto BikeFix - Conectando ciclistas e oficinas especializadas.

---

⭐ Se este projeto te ajudou, considere dar uma estrela!