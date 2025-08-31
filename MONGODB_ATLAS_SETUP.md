# 🗄️ Configuração MongoDB Atlas para Produção - BikeFix

## 📋 Pré-requisitos

- Conta no MongoDB Atlas (gratuita)
- Cartão de crédito para clusters M10+ (opcional, mas recomendado para produção)

## 🚀 Passo a Passo

### 1️⃣ Criar Conta e Organização

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crie uma conta gratuita
3. Crie uma organização chamada `BikeFix-Production`
4. Crie um projeto chamado `bikefix-app`

### 2️⃣ Criar Cluster de Produção

1. **Clique em "Build a Database"**
2. **Escolha o plano:**
   - **M0 (Gratuito)**: Para testes iniciais
   - **M10+ (Pago)**: Recomendado para produção real

3. **Configurações do Cluster:**
   - **Provider**: AWS (recomendado)
   - **Region**: us-east-1 (Virginia) - menor latência para Render
   - **Cluster Name**: `bikefix-production`
   - **MongoDB Version**: 7.0 (mais recente)

### 3️⃣ Configurar Segurança

#### 🔐 Autenticação de Banco de Dados

1. **Criar Usuário Administrador:**
   - Username: `bikefix-admin`
   - Password: Gerar senha forte (salvar em local seguro)
   - Role: `Atlas Admin`

2. **Criar Usuário da Aplicação:**
   - Username: `bikefix-app`
   - Password: Gerar senha forte
   - Role: `Read and write to any database`

#### 🌐 Lista de Acesso IP

1. **Para Desenvolvimento:**
   - Adicionar seu IP atual
   - Adicionar `0.0.0.0/0` (temporário para testes)

2. **Para Produção:**
   - Remover `0.0.0.0/0`
   - Adicionar IPs específicos do Render (será configurado após deploy)

### 4️⃣ Obter String de Conexão

1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Selecione "Node.js" e versão "4.1 or later"
4. Copie a string de conexão:

```
mongodb+srv://bikefix-app:<password>@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
```

### 5️⃣ Configurar Banco de Dados

1. **Nome do Banco:** `bikefix`
2. **Collections principais:**
   - `users`
   - `workshops`
   - `appointments`
   - `reviews`
   - `bikes`

## 🔒 Configurações de Segurança Avançadas

### Encryption at Rest
- ✅ Habilitado por padrão no Atlas
- Para clusters M10+: Considere usar Customer Key Management

### Network Security
- ✅ TLS/SSL habilitado por padrão
- ✅ VPC Peering (para clusters M10+)
- ✅ Private Endpoints (para máxima segurança)

### Monitoring e Alertas
1. **Configurar Alertas:**
   - High CPU Usage (>80%)
   - High Memory Usage (>80%)
   - Connection Limit Reached
   - Disk Space Usage (>80%)

2. **Performance Advisor:**
   - Revisar sugestões de índices
   - Monitorar queries lentas

## 📊 Backup e Recuperação

### Continuous Backup (M10+)
- ✅ Backup automático a cada 6 horas
- ✅ Point-in-time recovery
- ✅ Retenção de 7 dias (configurável)

### Cloud Backup (M0)
- ✅ Snapshots diários
- ✅ Retenção limitada

## 🌍 Configurações de Produção

### Variáveis de Ambiente
```env
# String de conexão completa
MONGODB_URI=mongodb+srv://bikefix-app:SUA_SENHA@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority

# Configurações adicionais
MONGODB_DB_NAME=bikefix
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=5
```

### Otimizações de Performance
1. **Índices Recomendados:**
   ```javascript
   // Users
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "userType": 1 })
   
   // Workshops
   db.workshops.createIndex({ "address.coordinates": "2dsphere" })
   db.workshops.createIndex({ "status": 1 })
   
   // Appointments
   db.appointments.createIndex({ "workshopId": 1, "appointmentDate": 1 })
   db.appointments.createIndex({ "customerId": 1 })
   ```

2. **Connection Pooling:**
   - Max Pool Size: 10
   - Min Pool Size: 5
   - Max Idle Time: 30000ms

## 🚨 Checklist de Segurança

- [ ] ✅ Usuários com senhas fortes criados
- [ ] ✅ Lista de IP configurada (sem 0.0.0.0/0 em produção)
- [ ] ✅ TLS/SSL habilitado
- [ ] ✅ Encryption at Rest ativo
- [ ] ✅ Alertas de monitoramento configurados
- [ ] ✅ Backup automático funcionando
- [ ] ✅ Índices de performance criados
- [ ] ✅ String de conexão segura (sem credenciais expostas)

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão:**
   - Verificar lista de IP
   - Verificar credenciais
   - Verificar string de conexão

2. **Performance Lenta:**
   - Revisar índices
   - Verificar queries no Performance Advisor
   - Considerar upgrade do cluster

3. **Limite de Conexões:**
   - Verificar connection pooling
   - Considerar upgrade para M10+

## 📞 Suporte

- **Documentação:** [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- **Suporte:** [MongoDB Support](https://support.mongodb.com/)
- **Community:** [MongoDB Community Forums](https://community.mongodb.com/)

---

**⚠️ Importante:** Nunca commite credenciais no código! Use sempre variáveis de ambiente.

**💡 Dica:** Para produção real, considere clusters M10+ para melhor performance e recursos avançados de segurança.