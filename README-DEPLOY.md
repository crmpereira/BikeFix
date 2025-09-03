# 🚀 Guia de Deploy para Produção - BikeFix

## 📋 Pré-requisitos

### 1. Contas Necessárias
- [ ] Conta no [Render.com](https://render.com)
- [ ] Conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
- [ ] Repositório no GitHub com o código
- [ ] Chaves de API do Google (OAuth e Maps)
- [ ] Chaves de API do Strava (OAuth)

### 2. Configurações Locais Concluídas
- [x] Build do frontend testado localmente
- [x] Variáveis de ambiente configuradas
- [x] Arquivo `render.yaml` configurado

## 🗄️ Configuração do Banco de Dados

### MongoDB Atlas (RECOMENDADO)

1. **Configurar MongoDB Atlas**:
   - Siga o guia completo em `MONGODB-ATLAS-SETUP.md`
   - Crie cluster `bikefix-production`
   - Configure usuário `bikefix-app`
   - Obtenha string de conexão

2. **String de Conexão**:
   ```
   mongodb+srv://bikefix-app:SENHA@bikefix-production.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
   ```

### Configuração Detalhada do MongoDB Atlas
1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie um novo cluster (Free Tier M0)
3. Configure o usuário do banco:
   - Username: `bikefix-app`
   - Password: Gere uma senha forte
4. Configure Network Access:
   - Adicione `0.0.0.0/0` (Allow access from anywhere)
5. Obtenha a connection string:
   ```
   mongodb+srv://bikefix-app:<password>@cluster0.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority
   ```

### PostgreSQL no Render (ALTERNATIVO)

1. **Criar Banco de Dados**:
   - No dashboard do Render, clique em "New +"
   - Selecione "PostgreSQL"
   - Configure:
     - Name: `bikefix-database`
     - Plan: Free
     - Region: Oregon (US West)

2. **Obter String de Conexão**:
   - Após criação, copie a "External Database URL"
   - Formato: `postgresql://user:pass@host:port/database`

## 🌐 Deploy no Render

### Passo 1: Conectar Repositório
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New" → "Blueprint"
3. Conecte seu repositório GitHub
4. Selecione o arquivo `render.yaml`

### Passo 2: Configurar Variáveis de Ambiente

#### Backend (bikefix-backend)
```bash
# Banco de Dados
MONGODB_URI=mongodb+srv://bikefix-app:<sua-senha>@cluster0.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority

# Segurança
JWT_SECRET=sua_chave_jwt_super_secreta_com_pelo_menos_32_caracteres
SESSION_SECRET=sua_chave_session_secreta

# OAuth Google
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# OAuth Strava
STRAVA_CLIENT_ID=seu_strava_client_id
STRAVA_CLIENT_SECRET=seu_strava_client_secret

# Email
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail

# URLs (configurar após deploy)
FRONTEND_URL=https://bikefix-frontend.onrender.com
CLIENT_URL=https://bikefix-frontend.onrender.com
BACKEND_URL=https://bikefix-backend.onrender.com
CORS_ORIGIN=https://bikefix-frontend.onrender.com
```

#### Frontend (bikefix-frontend)
```bash
# API
REACT_APP_API_URL=https://bikefix-backend.onrender.com/api

# OAuth Callbacks
REACT_APP_GOOGLE_CALLBACK_URL=https://bikefix-frontend.onrender.com/auth/google/callback
REACT_APP_STRAVA_CALLBACK_URL=https://bikefix-frontend.onrender.com/auth/strava/callback
```

### Passo 3: Deploy
1. Clique em "Apply" no Render Dashboard
2. Aguarde o build e deploy (pode levar 10-15 minutos)
3. Verifique os logs para possíveis erros

## 🔧 Configurações OAuth

### Google OAuth
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá para "APIs & Services" → "Credentials"
3. Adicione as URLs de callback:
   - `https://bikefix-frontend.onrender.com/auth/google/callback`
   - `https://bikefix-backend.onrender.com/auth/google/callback`

### Strava OAuth
1. Acesse [Strava Developers](https://developers.strava.com)
2. Edite sua aplicação
3. Adicione as URLs de callback:
   - `https://bikefix-frontend.onrender.com/auth/strava/callback`
   - `https://bikefix-backend.onrender.com/auth/strava/callback`

## ✅ Verificação Pós-Deploy

### Checklist de Testes
- [ ] Backend responde em `https://bikefix-backend.onrender.com/api/health`
- [ ] Frontend carrega em `https://bikefix-frontend.onrender.com`
- [ ] Login com Google funciona
- [ ] Login com Strava funciona
- [ ] Cadastro de usuário funciona
- [ ] Busca de oficinas funciona
- [ ] Agendamento funciona
- [ ] Fluxo de pagamento funciona
- [ ] Upload de imagens funciona

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
- Verifique se `CORS_ORIGIN` está configurado corretamente
- Confirme se as URLs estão sem barra final

#### 2. Erro de Conexão com MongoDB
- Verifique a string de conexão
- Confirme se o IP está liberado no Network Access
- Teste a conexão localmente primeiro

#### 3. OAuth não funciona
- Verifique se as URLs de callback estão corretas
- Confirme se as chaves estão configuradas corretamente
- Teste em modo incógnito

#### 4. Build falha
- Verifique os logs de build no Render
- Confirme se todas as dependências estão no package.json
- Teste o build localmente primeiro

## 📊 Monitoramento

### Logs
- Backend: Render Dashboard → bikefix-backend → Logs
- Frontend: Render Dashboard → bikefix-frontend → Logs

### Métricas
- Uptime: Render Dashboard → Services
- Performance: Render Dashboard → Metrics

## 🔄 Atualizações

### Deploy Automático
- Cada push para a branch `main` triggera um novo deploy
- O processo leva cerca de 5-10 minutos

### Deploy Manual
- Render Dashboard → Service → Manual Deploy

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no Render Dashboard
2. Consulte a documentação do Render
3. Teste localmente primeiro
4. Verifique as configurações de ambiente

**URLs de Produção:**
- Frontend: https://bikefix-frontend.onrender.com
- Backend: https://bikefix-backend.onrender.com
- API: https://bikefix-backend.onrender.com/api