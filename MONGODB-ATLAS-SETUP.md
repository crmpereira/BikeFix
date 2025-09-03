# Configuração do MongoDB Atlas - BikeFix Produção

## 📋 Visão Geral

Este guia explica como configurar o MongoDB Atlas como banco de dados de produção para o BikeFix, usando o banco `bikefix` como base principal.

## 🔧 Configuração Inicial

### 1. Criar Conta no MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie uma conta gratuita
3. Crie um novo projeto chamado "BikeFix"

### 2. Criar Cluster

1. Clique em "Build a Database"
2. Escolha "M0 Sandbox" (gratuito)
3. Selecione a região mais próxima (ex: AWS - São Paulo)
4. Nome do cluster: `bikefix-production`

### 3. Configurar Usuário do Banco

1. Vá em "Database Access"
2. Clique em "Add New Database User"
3. Configurações:
   - **Username**: `bikefix-app`
   - **Password**: Gere uma senha forte (salve em local seguro)
   - **Database User Privileges**: "Read and write to any database"

### 4. Configurar Acesso de Rede

1. Vá em "Network Access"
2. Clique em "Add IP Address"
3. Adicione:
   - `0.0.0.0/0` (permite acesso de qualquer IP - apenas para desenvolvimento)
   - Para produção, adicione IPs específicos do Render.com

### 5. Obter String de Conexão

1. Vá em "Database" → "Connect"
2. Escolha "Connect your application"
3. Selecione "Node.js" e versão "4.1 or later"
4. Copie a string de conexão

## 🔗 String de Conexão

A string deve ter este formato:
```
mongodb+srv://bikefix-app:<password>@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
```

**IMPORTANTE**: 
- Substitua `<password>` pela senha real do usuário
- Certifique-se de que o nome do banco seja `bikefix`
- O cluster deve ser `bikefix-production`

## ⚙️ Configuração no Projeto

### Arquivo .env.production

Atualize as seguintes variáveis:

```env
# MongoDB Atlas - Produção
MONGODB_URI=mongodb+srv://bikefix-app:SUA_SENHA_AQUI@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
MONGODB_ATLAS_URI=mongodb+srv://bikefix-app:SUA_SENHA_AQUI@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
```

### Configuração no Render.com

1. Acesse o dashboard do Render
2. Vá no serviço `bikefix-backend`
3. Em "Environment", adicione:
   - `MONGODB_URI`: String completa do Atlas
   - `MONGODB_ATLAS_URI`: Mesma string do Atlas

## 🚀 Migração de Dados

### Executar Script de Configuração

```bash
# No diretório BikeFixBackEnd
cd BikeFixBackEnd

# Configurar variáveis de ambiente
export MONGODB_ATLAS_URI="sua_string_do_atlas_aqui"
export MONGODB_TEST_URI="mongodb://localhost:27017/bikefix"

# Executar script de configuração
node scripts/setup-mongodb-atlas-production.js
```

### O que o Script Faz

1. ✅ Conecta ao MongoDB Atlas
2. ✅ Cria índices necessários
3. ✅ Migra dados do banco local/teste
4. ✅ Valida a configuração

## 🔍 Verificação

### Testar Conexão

```bash
# Testar migração de produção
node scripts/migrate-production.js
```

### Verificar no Atlas

1. Acesse MongoDB Atlas
2. Vá em "Database" → "Browse Collections"
3. Verifique se o banco `bikefix` foi criado
4. Confirme se as coleções existem:
   - `users`
   - `appointments`
   - `services`
   - `reviews`
   - `notifications`

## 🛡️ Segurança

### Boas Práticas

1. **Senhas Fortes**: Use senhas com pelo menos 16 caracteres
2. **IPs Específicos**: Em produção, limite acesso a IPs específicos
3. **Usuários Limitados**: Crie usuários com permissões mínimas necessárias
4. **Backup**: Configure backup automático no Atlas

### Variáveis de Ambiente Seguras

```env
# ❌ NUNCA faça isso
MONGODB_URI=mongodb+srv://user:password123@cluster.mongodb.net/db

# ✅ Use variáveis de ambiente
MONGODB_URI=${MONGODB_ATLAS_URI}
```

## 🔧 Troubleshooting

### Erro de Conexão

```
MongoNetworkError: failed to connect to server
```

**Soluções**:
1. Verificar se IP está na whitelist
2. Confirmar usuário e senha
3. Testar conectividade de rede

### Erro de Autenticação

```
MongoServerError: bad auth : authentication failed
```

**Soluções**:
1. Verificar username/password
2. Confirmar permissões do usuário
3. Verificar nome do banco na string

### Banco Não Encontrado

```
Database 'bikefix' not found
```

**Soluções**:
1. Verificar nome do banco na string de conexão
2. Executar script de migração
3. Criar coleções manualmente se necessário

## 📞 Suporte

Para problemas específicos:
1. Consulte [documentação do MongoDB Atlas](https://docs.atlas.mongodb.com/)
2. Verifique logs do aplicativo
3. Teste conexão com MongoDB Compass

---

**Status**: ✅ Configuração pronta para produção com banco `bikefix`