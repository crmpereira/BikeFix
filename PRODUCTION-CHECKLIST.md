# ✅ Checklist de Produção - BikeFix

## 🚀 Status do Deploy

### ✅ Preparação Concluída
- [x] **Variáveis de ambiente configuradas** (.env.production)
- [x] **Build do frontend testado** (npm run build)
- [x] **Servidor de produção testado localmente** (serve -s build)
- [x] **Arquivos de configuração criados** (render.yaml)
- [x] **Script de migração do banco** (migrate-production.js)
- [x] **Sistema de monitoramento** (monitoring.js)
- [x] **Documentação de deploy** (README-DEPLOY.md)

### 🔄 Próximos Passos (Manual)

#### 1. Configuração do MongoDB Atlas
- [ ] Criar cluster no MongoDB Atlas
- [ ] Configurar usuário do banco: `bikefix-app`
- [ ] Configurar Network Access (0.0.0.0/0)
- [ ] Obter connection string

#### 2. Deploy no Render
- [ ] Conectar repositório GitHub ao Render
- [ ] Configurar variáveis de ambiente no dashboard
- [ ] Fazer deploy usando render.yaml
- [ ] Verificar logs de build

#### 3. Configuração OAuth
- [ ] Atualizar URLs de callback no Google Cloud Console
- [ ] Atualizar URLs de callback no Strava Developers
- [ ] Testar login social

#### 4. Testes de Produção
- [ ] Verificar health check: `/api/health`
- [ ] Testar cadastro de usuário
- [ ] Testar login com Google/Strava
- [ ] Testar busca de oficinas
- [ ] Testar agendamento
- [ ] Testar fluxo de pagamento
- [ ] Testar upload de imagens

## 🔧 Configurações Críticas

### Variáveis de Ambiente Obrigatórias

#### Backend
```bash
# Banco de Dados
MONGODB_URI=mongodb+srv://bikefix-app:<password>@cluster0.xxxxx.mongodb.net/bikefix

# Segurança
JWT_SECRET=sua_chave_jwt_super_secreta_com_pelo_menos_32_caracteres
SESSION_SECRET=sua_chave_session_secreta

# OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
STRAVA_CLIENT_ID=seu_strava_client_id
STRAVA_CLIENT_SECRET=seu_strava_client_secret

# Email
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail

# URLs
FRONTEND_URL=https://bikefix-frontend.onrender.com
BACKEND_URL=https://bikefix-backend.onrender.com
CORS_ORIGIN=https://bikefix-frontend.onrender.com
```

#### Frontend
```bash
# API
REACT_APP_API_URL=https://bikefix-backend.onrender.com/api

# OAuth Callbacks
REACT_APP_GOOGLE_CALLBACK_URL=https://bikefix-frontend.onrender.com/auth/google/callback
REACT_APP_STRAVA_CALLBACK_URL=https://bikefix-frontend.onrender.com/auth/strava/callback
```

## 📊 Monitoramento

### Endpoints de Saúde
- **Backend Health**: `https://bikefix-backend.onrender.com/api/health`
- **Frontend**: `https://bikefix-frontend.onrender.com`

### Logs
- **Backend**: Render Dashboard → bikefix-backend → Logs
- **Frontend**: Render Dashboard → bikefix-frontend → Logs

### Métricas Importantes
- Tempo de resposta da API
- Taxa de erro (< 5%)
- Uso de memória
- Conexões com banco de dados
- Uptime (> 99%)

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build
```bash
# Verificar dependências
npm install
npm run build

# Verificar logs no Render
# Render Dashboard → Service → Logs
```

#### 2. Erro de CORS
```bash
# Verificar CORS_ORIGIN no backend
# Verificar REACT_APP_API_URL no frontend
# URLs devem estar sem barra final
```

#### 3. Erro de Banco de Dados
```bash
# Verificar MONGODB_URI
# Verificar Network Access no MongoDB Atlas
# Testar conexão localmente
```

#### 4. OAuth não funciona
```bash
# Verificar URLs de callback
# Verificar chaves de API
# Testar em modo incógnito
```

## 🔄 Processo de Atualização

### Deploy Automático
1. Fazer commit das alterações
2. Push para branch `main`
3. Render faz deploy automático
4. Verificar logs de build
5. Testar funcionalidades críticas

### Rollback
1. Render Dashboard → Service → Deploys
2. Selecionar deploy anterior
3. Clicar em "Redeploy"

## 📞 Contatos de Emergência

### Serviços
- **Render Support**: https://render.com/support
- **MongoDB Atlas**: https://support.mongodb.com
- **Google Cloud**: https://cloud.google.com/support

### Documentação
- **Render Docs**: https://render.com/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **React Docs**: https://reactjs.org/docs

---

## 🎉 Aplicação em Produção

**URLs de Produção:**
- **Frontend**: https://bikefix-frontend.onrender.com
- **Backend**: https://bikefix-backend.onrender.com
- **API Docs**: https://bikefix-backend.onrender.com/api-docs

**Credenciais de Admin:**
- **Email**: admin@bikefix.com
- **Senha**: admin123

---

*Última atualização: Janeiro 2025*
*Versão: 1.0.0*