# 🚀 Guia Completo de Deploy no Render

## 📋 Pré-requisitos

✅ **Concluído:**
- [x] Código no GitHub: https://github.com/crmpereira/BikeFix.git
- [x] MongoDB Atlas configurado
- [x] Arquivos de produção preparados

🔲 **Necessário:**
- [ ] Conta no [Render](https://render.com) (gratuita)
- [ ] Credenciais do MongoDB Atlas
- [ ] Chaves JWT seguras

---

## 🎯 Passo 1: Deploy do Backend

### 1.1 Criar Web Service

1. **Acesse:** https://render.com/dashboard
2. **Clique:** "New" → "Web Service"
3. **Conecte:** Repositório GitHub `BikeFix`
4. **Configure:**

```yaml
Name: bikefix-backend
Root Directory: BikeFixBackEnd
Environment: Node
Build Command: npm install
Start Command: npm run start:prod
Instance Type: Free
```

### 1.2 Variáveis de Ambiente

**⚠️ IMPORTANTE:** Configure TODAS as variáveis abaixo:

```env
# Ambiente
NODE_ENV=production
PORT=10000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://bikefix-app:SUA_SENHA_AQUI@cluster0.xxxxx.mongodb.net/bikefix?retryWrites=true&w=majority

# JWT (GERE CHAVES FORTES!)
JWT_SECRET=sua_chave_jwt_super_secreta_com_pelo_menos_32_caracteres_aqui
JWT_EXPIRE=7d

# URLs (ATUALIZE APÓS DEPLOY DO FRONTEND)
FRONTEND_URL=https://bikefix-frontend.onrender.com

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail

# OAuth (Opcional)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
STRAVA_CLIENT_ID=seu-strava-client-id
STRAVA_CLIENT_SECRET=seu-strava-client-secret
```

### 1.3 Deploy

1. **Clique:** "Create Web Service"
2. **Aguarde:** ~5-10 minutos para build
3. **Verifique:** Logs para erros
4. **Teste:** `https://seu-backend.onrender.com/api/health`

---

## 🎯 Passo 2: Deploy do Frontend

### 2.1 Criar Static Site

1. **No Dashboard:** "New" → "Static Site"
2. **Conecte:** Mesmo repositório `BikeFix`
3. **Configure:**

```yaml
Name: bikefix-frontend
Root Directory: BikeFixFrontEnd
Build Command: npm install && npm run build
Publish Directory: build
```

### 2.2 Variável de Ambiente

```env
REACT_APP_API_URL=https://bikefix-backend.onrender.com/api
```

**⚠️ SUBSTITUA:** `bikefix-backend` pela URL real do seu backend

### 2.3 Deploy

1. **Clique:** "Create Static Site"
2. **Aguarde:** ~3-5 minutos para build
3. **Teste:** Acesse a URL fornecida

---

## 🔧 Passo 3: Configurações Finais

### 3.1 Atualizar FRONTEND_URL no Backend

1. **Vá para:** Backend no Render Dashboard
2. **Environment:** Edite `FRONTEND_URL`
3. **Valor:** URL real do frontend (ex: `https://bikefix-frontend.onrender.com`)
4. **Salve:** Isso reiniciará o backend automaticamente

### 3.2 Configurar MongoDB Atlas

1. **Network Access:** Adicione `0.0.0.0/0` (ou IPs específicos do Render)
2. **Database Users:** Confirme usuário `bikefix-app` com senha forte
3. **Test Connection:** Use MongoDB Compass ou shell

---

## ✅ Verificação de Deploy

### Backend Health Check
```bash
curl https://seu-backend.onrender.com/api/health
# Resposta esperada: {"status":"OK","timestamp":"..."}
```

### Frontend Funcionando
- [ ] Página inicial carrega
- [ ] Login/cadastro funciona
- [ ] API calls funcionam (verifique Network tab)

### Logs de Erro
- **Backend:** Render Dashboard → Service → Logs
- **Frontend:** Browser DevTools → Console

---

## 🚨 Troubleshooting

### ❌ Backend não inicia

**Sintomas:** Build falha ou crash no startup

**Soluções:**
```bash
# 1. Verifique package.json tem script start:prod
# 2. Confirme todas env vars estão definidas
# 3. Verifique logs no Render Dashboard
# 4. Teste MongoDB URI localmente
```

### ❌ CORS Error

**Sintomas:** Frontend não consegue chamar API

**Soluções:**
```bash
# 1. Confirme FRONTEND_URL no backend
# 2. Verifique REACT_APP_API_URL no frontend
# 3. Teste URLs manualmente
```

### ❌ MongoDB Connection Failed

**Sintomas:** Erro de conexão com banco

**Soluções:**
```bash
# 1. Verifique MONGODB_URI está correto
# 2. Confirme Network Access no Atlas (0.0.0.0/0)
# 3. Teste credenciais do usuário
# 4. Verifique se cluster está ativo
```

### ❌ Build Timeout

**Sintomas:** Deploy falha por timeout

**Soluções:**
```bash
# 1. Remova node_modules do repo
# 2. Otimize package.json (remova deps desnecessárias)
# 3. Use .renderignore para arquivos grandes
```

---

## 📊 Monitoramento

### URLs de Produção
- **Frontend:** https://bikefix-frontend.onrender.com
- **Backend API:** https://bikefix-backend.onrender.com/api
- **Documentação:** https://bikefix-backend.onrender.com/api-docs
- **Health Check:** https://bikefix-backend.onrender.com/api/health

### Métricas Importantes
- **Uptime:** Render Dashboard
- **Response Time:** Health check
- **Error Rate:** Logs do backend
- **Database:** MongoDB Atlas Metrics

---

## 🔒 Segurança em Produção

### ✅ Checklist de Segurança

- [ ] **JWT_SECRET:** Chave forte (32+ caracteres)
- [ ] **MongoDB:** Usuário específico, não admin
- [ ] **Network Access:** IPs específicos (não 0.0.0.0/0 se possível)
- [ ] **HTTPS:** Render fornece automaticamente
- [ ] **Rate Limiting:** Configurado no backend
- [ ] **CORS:** Apenas frontend autorizado
- [ ] **Env Vars:** Nunca no código, apenas no Render

### 🔐 Rotação de Credenciais

**Mensalmente:**
1. Gere novo JWT_SECRET
2. Atualize senha do MongoDB
3. Renove tokens OAuth se usados

---

## 📞 Suporte

### Recursos Úteis
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **GitHub Repo:** https://github.com/crmpereira/BikeFix

### Em Caso de Problemas
1. **Verifique logs** no Render Dashboard
2. **Teste localmente** com mesmas env vars
3. **Consulte documentação** específica
4. **Abra issue** no GitHub se necessário

---

**🎉 Parabéns! Seu BikeFix está pronto para produção!**