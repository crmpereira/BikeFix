# 🚴‍♂️ BikeFix - Plataforma de Manutenção de Bicicletas

## 🚴‍♂️ Fluxo da Aplicação

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    CICLISTA     │    │    PLATAFORMA   │    │    OFICINA      │
│                 │    │    BIKEFIX      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Cadastro/Login     │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 2. Busca Oficinas     │                       │
         ├──────────────────────►│                       │
         │                       │                       │
         │ 3. Lista Oficinas     │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 4. Agenda Serviço     │                       │
         ├──────────────────────►│                       │
         │                       │ 5. Notifica Oficina  │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │ 6. Confirma Agenda   │
         │                       │◄──────────────────────┤
         │                       │                       │
         │ 7. Confirmação        │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 8. Realiza Serviço    │ 9. Atualiza Status   │
         │                       │◄──────────────────────┤
         │                       │                       │
         │ 10. Notifica Conclusão│                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │ 11. Avalia Serviço    │                       │
         ├──────────────────────►│                       │
         │                       │ 12. Registra Review  │
         │                       ├──────────────────────►│
```

### 📋 Detalhamento do Fluxo

**👤 CICLISTA:**
1. **Cadastro/Login** - Cria conta ou acessa plataforma
2. **Busca Oficinas** - Filtra por localização, serviços, avaliação
3. **Agenda Serviço** - Seleciona oficina, serviço e horário
4. **Acompanha Status** - Recebe notificações sobre o progresso
5. **Avalia Serviço** - Deixa review e nota após conclusão

**🏪 OFICINA:**
1. **Cadastro/Login** - Registra oficina com serviços oferecidos
2. **Gerencia Agenda** - Define horários disponíveis
3. **Recebe Solicitações** - Notificada sobre novos agendamentos
4. **Confirma/Rejeita** - Aceita ou recusa baseado na disponibilidade
5. **Atualiza Status** - Informa progresso do serviço
6. **Recebe Avaliações** - Visualiza feedback dos clientes

**🔧 TIPOS DE SERVIÇO:**
- 🔧 Manutenção Básica
- ⚙️ Troca de Peças
- 🛠️ Revisão Completa
- 🚴‍♂️ Ajustes Personalizados

## 📋 Sobre o Projeto

BikeFix é uma plataforma MVP que conecta ciclistas com oficinas especializadas em manutenção de bicicletas. O sistema permite agendamentos online, gerenciamento de serviços e avaliações.

## 🏗️ Arquitetura

- **Frontend**: React.js com Material-UI
- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB Atlas
- **Deploy**: Render (Backend + Frontend)

## 📁 Estrutura do Projeto

```
BikeFix/
├── BikeFixBackEnd/          # API Node.js
│   ├── controllers/         # Controladores da API
│   ├── models/             # Modelos do MongoDB
│   ├── routes/             # Rotas da API
│   ├── middleware/         # Middlewares
│   ├── config/             # Configurações
│   ├── scripts/            # Scripts de migração e setup
│   │   ├── migrate-local-to-atlas.js    # Migração MongoDB Local → Atlas
│   │   ├── setup-mongodb-atlas-production.js  # Setup produção Atlas
│   │   ├── migrate-production.js        # Migração dados produção
│   │   └── seedWorkshops.js            # Seed dados de teste
│   ├── server.js           # Servidor de desenvolvimento
│   ├── server-production.js # Servidor de produção
│   └── package.json
├── BikeFixFrontEnd/        # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── contexts/       # Contextos React
│   │   └── utils/          # Utilitários
│   └── package.json
└── docs/                   # Documentação
```

## 🚀 Deploy em Produção

### Pré-requisitos

1. **MongoDB Atlas**: Cluster configurado ([Guia](./MONGODB-ATLAS-SETUP.md))
2. **Render Account**: Conta gratuita no [Render](https://render.com)
3. **GitHub**: Repositório público ou privado
4. **Migração de Dados**: Se necessário, execute a migração antes do deploy

### 1️⃣ Deploy do Backend

1. **No Render Dashboard:**
   - New → Web Service
   - Connect Repository: `BikeFix`
   - Configure:
     - **Name**: `bikefix-backend`
     - **Root Directory**: `BikeFixBackEnd`
     - **Build Command**: `npm install`
     - **Start Command**: `npm run start:prod`

2. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://bikefix-app:SUA_SENHA@cluster.mongodb.net/bikefix
   JWT_SECRET=sua_chave_jwt_super_secreta_com_32_caracteres
   JWT_EXPIRE=7d
   FRONTEND_URL=https://bikefix-frontend.onrender.com
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=seu-email@gmail.com
   EMAIL_PASS=sua-senha-app
   ```

### 2️⃣ Deploy do Frontend

1. **No Render Dashboard:**
   - New → Static Site
   - Connect Repository: `BikeFix`
   - Configure:
     - **Name**: `bikefix-frontend`
     - **Root Directory**: `BikeFixFrontEnd`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

2. **Environment Variables:**
   ```env
   REACT_APP_API_URL=https://bikefix-backend.onrender.com/api
   ```

## 🔄 Migração de Dados

### MongoDB Local para Atlas

Se você já possui dados em um MongoDB local e deseja migrar para o MongoDB Atlas, utilize o script de migração:

```bash
cd BikeFixBackEnd
node scripts/migrate-local-to-atlas.js
```

**O que o script faz:**
- ✅ Conecta ao MongoDB local e Atlas simultaneamente
- ✅ Cria backups de segurança de todas as coleções
- ✅ Exporta dados do MongoDB local
- ✅ Importa dados para o MongoDB Atlas
- ✅ Gera relatório detalhado da migração
- ✅ Remove arquivos temporários automaticamente

**Pré-requisitos:**
- MongoDB local rodando com dados
- MongoDB Atlas configurado e acessível
- Variáveis de ambiente configuradas (`.env`)

**Configuração necessária no `.env`:**
```env
# MongoDB Local
MONGODB_LOCAL_URI=mongodb://localhost:27017/bikefix

# MongoDB Atlas (produção)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/bikefix
```

### Backend
```bash
cd BikeFixBackEnd
npm install
npm run dev
# Servidor rodando em http://localhost:5000
```

### Frontend
```bash
cd BikeFixFrontEnd
npm install
npm start
# Aplicação rodando em http://localhost:3000
```

### 🌱 Populando o Banco com Dados de Teste

Para popular o banco de dados com oficinas de exemplo:

```bash
cd BikeFixBackEnd
npm run seed
```

Este comando criará 5 oficinas de teste com dados completos:
- **Bike Center** - Oficina geral com boa avaliação
- **Speed Bikes** - Especializada em bikes de performance
- **Ciclo Repair** - Oficina de bairro com preços acessíveis
- **Bike Master** - Oficina premium com serviços especializados
- **Mountain Bikes SP** - Especializada em mountain bikes

**Importante**: Em produção com MongoDB Atlas, execute o seed apenas uma vez após o deploy inicial.

## ✨ Funcionalidades

### Para Ciclistas
- ✅ Cadastro e autenticação
- ✅ Busca de oficinas por localização
- ✅ Agendamento de serviços
- ✅ Gerenciamento de bicicletas
- ✅ Histórico de serviços
- ✅ Sistema de avaliações

### Para Oficinas
- ✅ Cadastro e perfil completo
- ✅ Gerenciamento de agenda
- ✅ Controle de serviços oferecidos
- ✅ Histórico de atendimentos
- ✅ Dashboard administrativo

## 🔒 Segurança

- **Autenticação JWT** com refresh tokens
- **Hash de senhas** com bcrypt
- **Rate limiting** para APIs
- **Validação de dados** no backend
- **CORS** configurado para produção
- **Helmet.js** para headers de segurança
- **Variáveis de ambiente** para credenciais

## 📊 Monitoramento

- **Health Check**: `/api/health`
- **Logs estruturados** com Morgan
- **Error handling** centralizado
- **MongoDB Atlas** monitoring integrado

## 🌐 URLs de Produção

- **Frontend**: https://bikefix-frontend.onrender.com
- **Backend API**: https://bikefix-backend.onrender.com/api
- **Documentação**: https://bikefix-backend.onrender.com/api-docs

## 🛠️ Troubleshooting

### Problemas Comuns

**1. Erro de conexão com MongoDB**
```bash
# Verifique se a URI está correta no .env
# Confirme se o IP está na whitelist do Atlas
```

**2. CORS Error no Frontend**
```bash
# Verifique se FRONTEND_URL está configurado no backend
# Confirme se REACT_APP_API_URL aponta para o backend correto
```

**3. Deploy falha no Render**
```bash
# Verifique os logs no Render Dashboard
# Confirme se todas as variáveis de ambiente estão configuradas
# Verifique se os comandos de build estão corretos
```

**4. Problemas na Migração de Dados**
```bash
# Erro de conexão com MongoDB local
# Verifique se o MongoDB local está rodando: mongod --version

# Erro de conexão com Atlas
# Confirme se a URI do Atlas está correta no .env
# Verifique se o IP está na whitelist do MongoDB Atlas

# Falha na migração de coleções específicas
# Execute o script novamente - ele detecta dados já migrados
# Verifique os logs detalhados no console durante a execução
```

## 🚀 Tecnologias

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + Bcrypt
- Multer + Nodemailer

### Frontend
- React.js + Material-UI
- Axios + React Router
- Context API

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Consulte os logs de erro
3. Abra uma issue no GitHub

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB Atlas ou MongoDB local
- Git

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