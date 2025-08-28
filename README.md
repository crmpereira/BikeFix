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
- **Swagger** para documentação da API

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

## 📚 Documentação da API

A API possui documentação completa e interativa usando **Swagger UI**:
- **URL**: http://localhost:5000/api-docs
- **Autenticação**: Suporte a Bearer Token JWT
- **Testes**: Interface para testar todos os endpoints

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuários e oficinas
- `POST /api/auth/login` - Login de usuários

### Usuários
- `GET /api/users/profile` - Obter perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil do usuário
- `GET /api/users/bikes` - Listar bicicletas do usuário
- `POST /api/users/bikes` - Adicionar nova bicicleta
- `PUT /api/users/bikes/:id` - Atualizar bicicleta
- `DELETE /api/users/bikes/:id` - Excluir bicicleta

### Oficinas
- `GET /api/workshops` - Listar oficinas com filtros
- `GET /api/workshops/nearby` - Buscar oficinas próximas
- `GET /api/workshops/:id` - Obter oficina por ID
- `GET /api/workshops/:id/services` - Listar serviços da oficina

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
- **Documentação API**: http://localhost:5000/api-docs

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